"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, ArrowRight, Volleyball } from "lucide-react"
import { loginWithAdditionalData } from "@/lib/vinhomes-api"
import { useUser } from "@/contexts/UserContext"

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
      console.log("[Login] Starting direct API call to Vinhomes...")
      
      // Call Vinhomes API directly using axios
      const result = await loginWithAdditionalData({ username, password })
      if (result.login?.data?.accessToken) {
        console.log("result", result)

        // Store token in localStorage
        localStorage.setItem('vinhomes_tokens', JSON.stringify(result.login.data.accessToken))

        
        // Update context
        login(result.login.data.accessToken, result.login.data?.customerInfo as any, username)
        
        setLoginResult({
          success: true,
          message: "Login successful! Redirecting to utilities...",
          data: result,
        })
        
        // Redirect after a short delay to show success message
        router.push("/utilities/s1")
      } else {
        setLoginResult({
          success: false,
          message: result.login?.message || "Login failed. Please try again.",
          data: result,
        })
      }
    } catch (error: any) {
      console.error("[Login] Login error:", error)
      setLoginResult({
        success: false,
        message: error.message || "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #F6E2BC 0%, #A9D09E 100%)' }}>
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#3B7097' }}>
              <LogIn className="w-8 h-8 text-white" />
            </div>
            
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
                <Label htmlFor="username">Phone number</Label>
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
                      className="w-full text-white font-semibold py-3"
                      style={{ backgroundColor: '#3B7097' }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#75BDE0'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3B7097'}
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
