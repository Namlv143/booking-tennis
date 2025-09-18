"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LayoutList, LogOut, ArrowRight, Calendar, Clock, Copy, Check } from "lucide-react"
import { useApp } from "@/lib/context/app-context"

export default function UtilitiesPage() {
  const [tokenCopied, setTokenCopied] = useState(false)
  const router = useRouter()
  const { state, logout, getUtilityData } = useApp()

  // Redirect if not logged in
  useEffect(() => {
    if (!state.isLoggedIn) {
      router.push("/login")
    }
  }, [state.isLoggedIn, router])

  const handleGetUtility = async () => {
    if (state.currentToken) {
      await getUtilityData(state.currentToken)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleGoToBooking = () => {
    router.push("/utilities/tennis")
  }

  const handleCopyToken = async () => {
    if (!state.currentToken) return
    
    try {
      await navigator.clipboard.writeText(state.currentToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy token:', error)
    }
  }

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tennis Booking Dashboard</h1>
          <p className="text-gray-600">Manage your tennis court utilities and bookings</p>
        </div>

        {/* User Info and Logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <LayoutList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Welcome {state.userData?.data?.fullName || "back"}!</h2>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleGetUtility}
              disabled={state.isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <LayoutList className="w-4 h-4 mr-2" />
                  Get Utility Data
                </>
              )}
            </Button>
            <Button
              onClick={handleGoToBooking}
              variant="outline"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Go to Booking
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Token Management Section */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Copy className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800">Token Management</CardTitle>
            <CardDescription>Copy token for Vercel environment variable</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Access Token:</p>
                          <code className="text-xs text-gray-600 break-all">
                            {state.currentToken ? `${state.currentToken.substring(0, 20)}...` : 'No token available'}
                          </code>
                </div>
                <Button
                  onClick={handleCopyToken}
                  disabled={!state.currentToken}
                  size="sm"
                  className="ml-4 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {tokenCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Click &quot;Copy&quot; to copy the token</li>
                <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
                <li>Add new variable: <code className="bg-gray-200 px-1 rounded">VINHOMES_TOKEN</code></li>
                <li>Paste the copied token as the value</li>
                <li>Save and redeploy your application</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Utility Result Display */}
        {state.utilityResult && (
          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <Alert className={state.utilityResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={state.utilityResult.success ? "text-green-800" : "text-red-800"}>
                  {state.utilityResult.message}
                </AlertDescription>
              </Alert>

              {state.utilityResult.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Utility Data:</h3>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(state.utilityResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Welcome to your tennis booking dashboard. Use the buttons above to manage utilities and book courts.
          </p>
        </div>
      </div>
    </div>
  )
}
