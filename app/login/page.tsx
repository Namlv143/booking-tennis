"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, ArrowRight } from "lucide-react"
import { useApp } from "@/lib/context/app-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { state, login } = useApp()

  // Redirect if already logged in
  useEffect(() => {
    if (state.isLoggedIn) {
      router.push("/utilities")
    }
  }, [state.isLoggedIn, router])

  const handleLogin = async () => {
    await login(username, password)
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
                    {state.loginResult && (
                      <Alert className={state.loginResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <AlertDescription className={state.loginResult.success ? "text-green-800" : "text-red-800"}>
                          {state.loginResult.message}
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
                      disabled={state.isLoggingIn || !username || !password}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                      size="lg"
                    >
                      {state.isLoggingIn ? (
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

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/")}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
