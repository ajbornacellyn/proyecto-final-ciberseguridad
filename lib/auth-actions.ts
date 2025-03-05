"use server"
import { sanitizeInput } from "@/lib/security-utils"
import { logSecurityEvent } from "@/lib/audit-logger"
import { sendEmail } from "@/lib/email-service"
import prisma from "@/lib/prisma"
import { hash, compare } from "bcrypt"

// Constants
const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_RESET_TIME = 15 * 60 * 1000 // 15 minutes
const SALT_ROUNDS = 10

export async function loginUser(email: string, password: string) {
  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email.toLowerCase())

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (!user) {
      // Log failed login attempt for non-existent user
      await logSecurityEvent({
        type: "FAILED_LOGIN",
        userId: "unknown",
        details: "User not found",
        ip: "127.0.0.1", // In a real app, this would be the actual IP
      })

      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Check recent login attempts
    const recentAttempts = await prisma.loginAttempt.count({
      where: {
        userId: user.id,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_RESET_TIME),
        },
      },
    })

    if (recentAttempts >= MAX_LOGIN_ATTEMPTS) {
      await logSecurityEvent({
        type: "RATE_LIMIT_EXCEEDED",
        userId: user.id,
        details: "Too many login attempts",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      }
    }

    // Verify password
    const passwordValid = await compare(password, user.password)

    // Record login attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        success: passwordValid,
        ipAddress: "127.0.0.1",
        userAgent: "Unknown", // In a real app, this would be the actual user agent
      },
    })

    if (!passwordValid) {
      await logSecurityEvent({
        type: "FAILED_LOGIN",
        userId: user.id,
        details: "Invalid password",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Log successful login
    await logSecurityEvent({
      type: "SUCCESSFUL_LOGIN",
      userId: user.id,
      details: "User logged in successfully",
      ip: "127.0.0.1",
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function registerUser(name: string, email: string, password: string) {
  // Sanitize inputs
  const sanitizedName = sanitizeInput(name)
  const sanitizedEmail = sanitizeInput(email.toLowerCase())

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existingUser) {
      await logSecurityEvent({
        type: "FAILED_REGISTRATION",
        userId: "unknown",
        details: "Email already in use",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Email already in use",
      }
    }

    // Hash the password
    const hashedPassword = await hash(password, SALT_ROUNDS)

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
      },
    })

    // Log successful registration
    await logSecurityEvent({
      type: "USER_REGISTERED",
      userId: newUser.id,
      details: "New user registered",
      ip: "127.0.0.1",
    })

    // Send welcome email
    await sendEmail({
      to: sanitizedEmail,
      subject: "Welcome to Our Secure Platform",
      body: `Welcome, ${sanitizedName}! Your account has been created successfully.`,
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function sendVerificationCode(email: string) {
  // Sanitize input
  const sanitizedEmail = sanitizeInput(email.toLowerCase())

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Delete any existing unused codes for this user
    await prisma.verificationCode.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    })

    // Create a new verification code
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    })

    // In a real app, send the code via email
    try {
      await sendEmail({
        to: sanitizedEmail,
        subject: "Your Verification Code",
        body: `Your verification code is: ${code}. It will expire in 15 minutes.`,
      })

      await logSecurityEvent({
        type: "2FA_CODE_SENT",
        userId: user.id,
        details: "Verification code sent to user's email",
        ip: "127.0.0.1",
      })

      return {
        success: true,
      }
    } catch (error) {
      await logSecurityEvent({
        type: "2FA_CODE_SEND_FAILED",
        userId: user.id,
        details: "Failed to send verification code",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Failed to send verification code. Please try again.",
      }
    }
  } catch (error) {
    console.error("Send verification code error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function verifyTwoFactorCode(email: string, code: string) {
  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email.toLowerCase())

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Find the most recent verification code for this user
    const verificationData = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!verificationData) {
      await logSecurityEvent({
        type: "2FA_FAILED",
        userId: user.id,
        details: "No verification code found",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Verification code not found or expired. Please request a new code.",
      }
    }

    // Check if the code has expired
    if (new Date() > verificationData.expiresAt) {
      // Mark code as used
      await prisma.verificationCode.update({
        where: { id: verificationData.id },
        data: { used: true },
      })

      await logSecurityEvent({
        type: "2FA_FAILED",
        userId: user.id,
        details: "Verification code expired",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      }
    }

    // Check if the code matches
    if (verificationData.code !== code) {
      await logSecurityEvent({
        type: "2FA_FAILED",
        userId: user.id,
        details: "Invalid verification code",
        ip: "127.0.0.1",
      })

      return {
        success: false,
        error: "Invalid verification code. Please try again.",
      }
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationData.id },
      data: { used: true },
    })

    await logSecurityEvent({
      type: "2FA_SUCCESS",
      userId: user.id,
      details: "Two-factor authentication successful",
      ip: "127.0.0.1",
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Verify two-factor code error:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

