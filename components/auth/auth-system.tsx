"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import TwoFactorAuth from "@/components/auth/two-factor-auth"
import { Shield, ShieldCheck } from "lucide-react"

export default function AuthSystem() {
  const [activeTab, setActiveTab] = useState("login")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email)
    setShowTwoFactor(true)
  }

  const handleTwoFactorSuccess = () => {
    // In a real application, this would redirect to the dashboard
    alert("Successfully authenticated! Redirecting to dashboard...")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setShowTwoFactor(false)
  }

  const handleBackToLogin = () => {
    setShowTwoFactor(false)
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          {showTwoFactor ? (
            <ShieldCheck className="h-10 w-10 text-primary" />
          ) : (
            <Shield className="h-10 w-10 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {showTwoFactor ? "Two-Factor Authentication" : "Secure Authentication"}
        </CardTitle>
        <CardDescription className="text-center">
          {showTwoFactor ? "Please verify your identity to continue" : "Enterprise-grade security for your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showTwoFactor ? (
          <TwoFactorAuth email={userEmail} onSuccess={handleTwoFactorSuccess} onBack={handleBackToLogin} />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onRegisterSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-xs text-center text-muted-foreground">Protected by enterprise-grade security</div>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">SSL Encrypted</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">DoS Protected</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">Audit Logging</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

