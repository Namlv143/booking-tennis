"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LayoutList, LogOut, ArrowRight, Calendar, Clock } from "lucide-react"
import { ClientTokenService } from "@/lib/client-token-service"

export default function UtilitiesPage() {
  const [isLoadingUtility, setIsLoadingUtility] = useState(false)
  const [utilityApiResult, setUtilityApiResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [userData, setUserData] = useState<any>(null)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const handleGetUtility = useCallback(async () => {
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
  }, [currentToken])

  // Check for existing token on component mount
  useEffect(() => {
    const checkServerToken = async () => {
      try {
        const token = await ClientTokenService.getValidToken("0979251496")
        
        if (token) {
          setCurrentToken(token)
          setIsLoggedIn(true)
          // Auto-call utilities when page loads
          handleGetUtility()
        } else {
          // No valid token, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Failed to check server token:", error)
        router.push("/login")
      }
    }

    checkServerToken()
  }, [router, handleGetUtility])

  const handleLogout = async () => {
    try {
      // Clear token from server
      await ClientTokenService.clearToken("0979251496")
      
      setCurrentToken(null)
      setIsLoggedIn(false)
      setUserData(null)
      setUtilityApiResult(null)
      router.push("/login")
    } catch (error) {
      console.error("Failed to logout:", error)
      // Still redirect to login even if server logout fails
      router.push("/login")
    }
  }

  const handleGoToBooking = () => {
    router.push("/")
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Utilities Dashboard</h1>
          <p className="text-gray-600">Manage your tennis court utilities and bookings</p>
        </div>

        {/* User Info and Logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <LayoutList className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Welcome back!</h2>
            </div>
          </div>
          
          <div className="flex space-x-2">
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

        {/* Utilities Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Utility Data Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <LayoutList className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">Utility Data</CardTitle>
              <CardDescription>Retrieve and view utility information</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {utilityApiResult && (
                <Alert className={utilityApiResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={utilityApiResult.success ? "text-green-800" : "text-red-800"}>
                    {utilityApiResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGetUtility}
                disabled={isLoadingUtility}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                size="lg"
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
              </Button>

              {utilityApiResult?.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Utility Data:</h3>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(utilityApiResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
              <CardDescription>Access booking and other features</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handleGoToBooking}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                size="lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Go to Tennis Booking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>After getting utilities, proceed to book tennis courts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Utilities loaded successfully? Proceed to the booking page to reserve your tennis courts.
          </p>
        </div>
      </div>
    </div>
  )
}
