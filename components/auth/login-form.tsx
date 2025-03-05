"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { loginUser } from "@/lib/auth-actions"
import CaptchaChallenge from "@/components/security/captcha-challenge"
import { sanitizeInput } from "@/lib/security-utils"

interface LoginFormProps {
  onLoginSuccess: (email: string) => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(sanitizeInput(e.target.value))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value) // No sanitization for passwords
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

    if (loginAttempts >= 5) {
      setError("Too many login attempts. Please try again later.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // In a real app, this would call an API endpoint
      const result = await loginUser(email, password)

      if (result.success) {
        // Log successful login attempt
        console.log(`[AUDIT] Successful login attempt for user: ${email}`)
        onLoginSuccess(email)
      } else {
        setLoginAttempts((prev) => prev + 1)
        setError(result.error || "Invalid email or password")
        setCaptchaVerified(false)
        // Log failed login attempt
        console.log(`[AUDIT] Failed login attempt for user: ${email}`)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("[AUDIT] Login error:", err)
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

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="name@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-xs text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="current-password"
        />
      </div>

      <CaptchaChallenge onSuccess={handleCaptchaSuccess} verified={captchaVerified} />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}

