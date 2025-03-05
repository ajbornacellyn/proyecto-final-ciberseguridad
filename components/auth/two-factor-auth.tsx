"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, Mail } from "lucide-react"
import { sendVerificationCode, verifyTwoFactorCode } from "@/lib/auth-actions"

interface TwoFactorAuthProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export default function TwoFactorAuth({ email, onSuccess, onBack }: TwoFactorAuthProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  useEffect(() => {
    // Send verification code when component mounts
    sendCode()
  }, [])

  const sendCode = async () => {
    if (sendingCode) return

    setSendingCode(true)
    setError("")

    try {
      const result = await sendVerificationCode(email)

      if (result.success) {
        setCodeSent(true)
        setCanResend(false)
        setTimeLeft(30)

        // Start countdown timer for resending code
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              setCanResend(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.error || "Failed to send verification code")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("[AUDIT] Error sending 2FA code:", err)
    } finally {
      setSendingCode(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setVerificationCode(value)
  }

  const handleResendCode = () => {
    if (!canResend) return
    sendCode()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await verifyTwoFactorCode(email, verificationCode)

      if (result.success) {
        // Log successful 2FA verification
        console.log(`[AUDIT] Successful 2FA verification for user: ${email}`)
        onSuccess()
      } else {
        setError(result.error || "Invalid verification code")
        // Log failed 2FA attempt
        console.log(`[AUDIT] Failed 2FA attempt for user: ${email}`)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("[AUDIT] 2FA verification error:", err)
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

      <div className="text-center mb-4 space-y-2">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="text-sm">
          We've sent a verification code to <strong>{email}</strong>
        </p>
        <p className="text-xs text-muted-foreground">Please check your inbox and enter the 6-digit code below</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verification-code">Verification Code</Label>
        <Input
          id="verification-code"
          value={verificationCode}
          onChange={handleCodeChange}
          placeholder="Enter 6-digit code"
          className="text-center text-lg tracking-widest"
          inputMode="numeric"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <div className="flex justify-between items-center pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Login
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResendCode}
          disabled={!canResend || sendingCode}
          className="text-xs"
        >
          {sendingCode ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : canResend ? (
            "Resend Code"
          ) : (
            `Resend in ${timeLeft}s`
          )}
        </Button>
      </div>
    </form>
  )
}

