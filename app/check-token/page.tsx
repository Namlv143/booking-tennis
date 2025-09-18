"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, XCircle, Key, User } from "lucide-react"

export default function CheckTokenPage() {
  const [username, setUsername] = useState("0979251496")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    hasToken: boolean
    isValid?: boolean
    username?: string
    tokenInfo?: any
    error?: string
  } | null>(null)

  const handleCheckToken = async () => {
    setIsChecking(true)
    setResult(null)

    try {
      const response = await fetch(`/api/check-token?username=${encodeURIComponent(username)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Network error",
        hasToken: false,
        error: String(error)
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleValidateToken = async () => {
    setIsChecking(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Network error",
        hasToken: false,
        error: String(error)
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Check Token Status
            </CardTitle>
            <CardDescription>
              Check if a token exists and validate it on the server
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleCheckToken}
                disabled={isChecking || !username}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Check Token
                  </>
                )}
              </Button>

              <Button
                onClick={handleValidateToken}
                disabled={isChecking || !username}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate Token
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  <div className="space-y-2">
                    <div className="font-semibold">{result.message}</div>
                    
                    {result.hasToken && (
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Username: {result.username}</span>
                        </div>
                        
                        {result.tokenInfo && (
                          <>
                            <div className="flex items-center space-x-2">
                              {result.isValid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span>Valid: {result.isValid ? 'Yes' : 'No'}</span>
                            </div>
                            
                            <div className="text-xs text-gray-600">
                              <div>Token Length: {result.tokenInfo.tokenLength} characters</div>
                              <div>Token Preview: {result.tokenInfo.tokenPreview}</div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>Use "Check Token" to see if a token exists locally</p>
              <p>Use "Validate Token" to test if the token works with the server</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
