"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, ArrowRight } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { TokenService } from "@/lib/token-service"

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginResult, setLoginResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login } = useUser()

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setLoginResult(null)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

              if (response.ok && result.success && result.data?.data?.accessToken) {
                // Store token in localStorage
                TokenService.storeToken(username, result.data.data.accessToken)
                
                // Update context
                login(result.data.data.accessToken, result.data.data, username)
                
                setLoginResult({
                  success: true,
                  message: "Login successful! Redirecting to utilities...",
                  data: result,
                })
                window.open("/utilities/tennis", "_blank")
      } else {
        setLoginResult({
          success: false,
          message: result.message || "Login failed. Please try again.",
          data: result,
        })
      }
    } catch (error) {
      setLoginResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Tennis Booking Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the tennis booking system
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loginResult && (
              <Alert className={loginResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={loginResult.success ? "text-green-800" : "text-red-800"}>
                  {loginResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || !username || !password}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>

           
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
