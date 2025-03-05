"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface CaptchaChallengeProps {
  onSuccess: () => void
  verified: boolean
}

export default function CaptchaChallenge({ onSuccess, verified }: CaptchaChallengeProps) {
  const [captcha, setCaptcha] = useState({ question: "", answer: "" })
  const [userAnswer, setUserAnswer] = useState("")
  const [error, setError] = useState(false)

  // Generate a new CAPTCHA challenge
  const generateCaptcha = useCallback(() => {
    // Different types of CAPTCHA challenges
    const challenges = [
      // Simple math
      () => {
        const num1 = Math.floor(Math.random() * 10)
        const num2 = Math.floor(Math.random() * 10)
        return {
          question: `What is ${num1} + ${num2}?`,
          answer: (num1 + num2).toString(),
        }
      },
      // Reverse a number
      () => {
        const num = Math.floor(Math.random() * 1000)
        return {
          question: `Reverse the number: ${num}`,
          answer: num.toString().split("").reverse().join(""),
        }
      },
      // Count characters
      () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const randomChar = chars[Math.floor(Math.random() * chars.length)]
        const text = Array(5)
          .fill(0)
          .map(() => chars[Math.floor(Math.random() * chars.length)])
          .join("")
        const count = text.split("").filter((c) => c === randomChar).length
        return {
          question: `How many ${randomChar}'s are in: ${text}${randomChar}${text}?`,
          answer: (count + 1).toString(),
        }
      },
    ]

    // Select a random challenge
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]()
    setCaptcha(challenge)
    setUserAnswer("")
    setError(false)
  }, [])

  useEffect(() => {
    generateCaptcha()
  }, [generateCaptcha])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Add this to prevent event bubbling

    if (userAnswer.trim().toLowerCase() === captcha.answer.toLowerCase()) {
      setError(false)
      onSuccess()
    } else {
      setError(true)
      generateCaptcha()
    }
  }

  if (verified) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        CAPTCHA verification successful
      </div>
    )
  }

  return (
    <div className="space-y-2 p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-between items-center">
        <Label htmlFor="captcha">CAPTCHA Challenge</Label>
        <Button type="button" variant="ghost" size="sm" onClick={generateCaptcha} className="h-6 w-6 p-0">
          <RefreshCw className="h-3 w-3" />
          <span className="sr-only">Refresh CAPTCHA</span>
        </Button>
      </div>

      <div className="text-sm font-medium mb-2">{captcha.question}</div>

      <div className="flex space-x-2">
        <Input
          id="captcha"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          className={error ? "border-red-500" : ""}
          required
        />
        <Button type="button" size="sm" onClick={handleSubmit}>
          Verify
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">Incorrect answer. Please try again with a new challenge.</p>}
    </div>
  )
}

