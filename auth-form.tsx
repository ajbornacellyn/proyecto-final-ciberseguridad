"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState("login")
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // CAPTCHA state
  const [captcha, setCaptcha] = useState(() => generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState("")
  const [captchaError, setCaptchaError] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10)
    const num2 = Math.floor(Math.random() * 10)
    return { question: `${num1} + ${num2} = ?`, answer: (num1 + num2).toString() }
  }

  function refreshCaptcha() {
    setCaptcha(generateCaptcha())
    setCaptchaInput("")
    setCaptchaError(false)
  }

  function handleTabChange(value: string) {
    setActiveTab(value)
    setFormStatus({ type: null, message: "" })
    refreshCaptcha()
  }

  function validateCaptcha() {
    if (captchaInput === captcha.answer) {
      setCaptchaError(false)
      return true
    } else {
      setCaptchaError(true)
      return false
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!validateCaptcha()) {
      return
    }

    // Here you would typically call your authentication API
    console.log("Login attempt:", { email: loginEmail, password: loginPassword })

    // Simulate successful login
    setFormStatus({
      type: "success",
      message: "Login successful! Redirecting...",
    })

    // Reset form
    setLoginEmail("")
    setLoginPassword("")
    setCaptchaInput("")
    refreshCaptcha()
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (!validateCaptcha()) {
      return
    }

    if (registerPassword !== confirmPassword) {
      setFormStatus({
        type: "error",
        message: "Passwords do not match",
      })
      return
    }

    // Here you would typically call your registration API
    console.log("Registration attempt:", {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    })

    // Simulate successful registration
    setFormStatus({
      type: "success",
      message: "Registration successful! You can now log in.",
    })

    // Reset form
    setRegisterName("")
    setRegisterEmail("")
    setRegisterPassword("")
    setConfirmPassword("")
    setCaptchaInput("")
    refreshCaptcha()

    // Switch to login tab after successful registration
    setTimeout(() => {
      setActiveTab("login")
      setFormStatus({ type: null, message: "" })
    }, 2000)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {formStatus.type && (
              <Alert
                className={`mb-4 ${formStatus.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
              >
                {formStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                <AlertDescription>{formStatus.message}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="captcha">
                    CAPTCHA: {captcha.question}
                    <Button type="button" variant="ghost" size="sm" className="ml-2 h-6 px-2" onClick={refreshCaptcha}>
                      Refresh
                    </Button>
                  </Label>
                  <Input
                    id="captcha"
                    placeholder="Enter the answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className={captchaError ? "border-red-500" : ""}
                    required
                  />
                  {captchaError && <p className="text-sm text-red-500">Incorrect CAPTCHA answer. Please try again.</p>}
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="register-captcha">
                    CAPTCHA: {captcha.question}
                    <Button type="button" variant="ghost" size="sm" className="ml-2 h-6 px-2" onClick={refreshCaptcha}>
                      Refresh
                    </Button>
                  </Label>
                  <Input
                    id="register-captcha"
                    placeholder="Enter the answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className={captchaError ? "border-red-500" : ""}
                    required
                  />
                  {captchaError && <p className="text-sm text-red-500">Incorrect CAPTCHA answer. Please try again.</p>}
                </div>

                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

