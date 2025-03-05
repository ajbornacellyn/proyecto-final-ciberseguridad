"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { registerUser } from "@/lib/auth-actions"
import CaptchaChallenge from "@/components/security/captcha-challenge"
import { sanitizeInput, validatePassword } from "@/lib/security-utils"
import PasswordStrengthMeter from "@/components/security/password-strength-meter"

interface RegisterFormProps {
  onRegisterSuccess: () => void
}

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(sanitizeInput(e.target.value))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(sanitizeInput(e.target.value))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    // Calculate password strength (0-100)
    const strength = calculatePasswordStrength(newPassword)
    setPasswordStrength(strength)
  }

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let score = 0

    // Length check
    if (password.length >= 8) score += 25

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 25
    if (/[0-9]/.test(password)) score += 25
    if (/[^A-Za-z0-9]/.test(password)) score += 25

    return score
  }

  const handleCaptchaSuccess = () => {
    setCaptchaVerified(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaVerified) {
      setError("Please complete the CAPTCHA verification")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordStrength < 75) {
      setError("Please use a stronger password")
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message)
      return
    }

    setLoading(true)
    setError("")

    try {
      // In a real app, this would call an API endpoint
      const result = await registerUser(fullName, email, password)

      if (result.success) {
        setSuccess(true)
        // Log successful registration
        console.log(`[AUDIT] New user registered: ${email}`)

        setTimeout(() => {
          onRegisterSuccess()
        }, 2000)
      } else {
        setError(result.error || "Registration failed")
        setCaptchaVerified(false)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("[AUDIT] Registration error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Registration successful! You can now log in.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" value={fullName} onChange={handleNameChange} placeholder="John Doe" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email Address</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input id="register-password" type="password" value={password} onChange={handlePasswordChange} required />
        <PasswordStrengthMeter strength={passwordStrength} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <CaptchaChallenge onSuccess={handleCaptchaSuccess} verified={captchaVerified} />

      <Button type="submit" className="w-full" disabled={loading || success}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}

