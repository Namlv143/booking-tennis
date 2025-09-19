"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LayoutList, LogOut, ArrowRight, Calendar, Clock, Copy, Check } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

export default function UtilitiesPage() {
  const [isLoadingUtility, setIsLoadingUtility] = useState(false)
  const [utilityApiResult, setUtilityApiResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [tokenCopied, setTokenCopied] = useState(false)
  const router = useRouter()

  // Use context for user state
  const { 
    isLoggedIn, 
    currentToken, 
    userData, 
    isLoading, 
    logout, 
    utilityData, 
    setUtilityData 
  } = useUser()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoading, isLoggedIn, router])

  const handleGetUtility = async () => {
    if (!currentToken) {
      setUtilityApiResult({
        success: false,
        message: "Please login first to get utility data.",
      })
      return
    }

    setIsLoadingUtility(true)
    setUtilityApiResult(null)

    try {
      const response = await fetch(`/api/utility?token=${encodeURIComponent(currentToken)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok && result.data) {
        // Store in context
        setUtilityData(result.data)
        setUtilityApiResult({
          success: true,
          message: "Utility data retrieved successfully! 📊",
          data: result.data,
        })
      } else {
        setUtilityApiResult({
          success: false,
          message: result.message || "Failed to retrieve utility data.",
        })
      }
    } catch (error) {
      setUtilityApiResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsLoadingUtility(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUtilityApiResult(null)
    // logout() already handles redirect with page refresh
  }

  const handleGoToBooking = () => {
    router.push("/utilities/tennis")
  }

  const handleCopyToken = async () => {
    if (!currentToken) return
    
    try {
      await navigator.clipboard.writeText(currentToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy token:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
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
          {userData?.data?.fullName && <h1 className="text-2xl font-semibold text-orange-500">Welcome {userData?.data?.fullName}!</h1>}
          <p className=" text-gray-800 mb-2">Tennis Booking Dashboard</p>

        </div>

        {/* User Info and Logout */}
          
          <div className="grid grid-cols-2 space-x-2 flex-col lg:flex-row gap-6 lg:gap-2 my-5">
            {/* <Button
              onClick={handleGetUtility}
              disabled={isLoadingUtility}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoadingUtility ? (
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
            </Button> */}
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
                    {currentToken ? `${currentToken.substring(0, 20)}...` : 'No token available'}
                  </code>
                </div>
                <Button
                  onClick={handleCopyToken}
                  disabled={!currentToken}
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

            {/* <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Click &quot;Copy&quot; to copy the token</li>
                <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
                <li>Add new variable: <code className="bg-gray-200 px-1 rounded">VINHOMES_TOKEN</code></li>
                <li>Paste the copied token as the value</li>
                <li>Save and redeploy your application</li>
              </ol>
            </div> */}
          </CardContent>
        </Card>

        {/* Utility Result Display */}
        {utilityApiResult && (
          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <Alert className={utilityApiResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={utilityApiResult.success ? "text-green-800" : "text-red-800"}>
                  {utilityApiResult.message}
                </AlertDescription>
              </Alert>

              {utilityApiResult.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Utility Data:</h3>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(utilityApiResult.data, null, 2)}
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
