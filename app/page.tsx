"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, LogOut, LayoutList, ArrowRight } from "lucide-react"
import { ClientTokenService } from "@/lib/client-token-service"

export default function TennisBookingPage() {
  const [isBooking, setIsBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isBooking2, setIsBooking2] = useState(false)
  const [bookingResult2, setBookingResult2] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isBooking3, setIsBooking3] = useState(false)
  const [bookingResult3, setBookingResult3] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isBooking4, setIsBooking4] = useState(false)
  const [bookingResult4, setBookingResult4] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isBooking5, setIsBooking5] = useState(false)
  const [bookingResult5, setBookingResult5] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  // Check for existing token on component mount
  useEffect(() => {
    const checkServerToken = async () => {
      try {
        const token = await ClientTokenService.getValidToken("0979251496")
        
        if (token) {
          setCurrentToken(token)
          setIsLoggedIn(true)
          
          // Load user data
          loadUserData(token)
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
  }, [router])

  const loadUserData = async (token: string) => {
    try {
      const userMeResponse = await fetch("/api/user-me", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (userMeResponse.ok) {
        const userMeResult = await userMeResponse.json()
        if (userMeResult.data) {
          setUserData(userMeResult.data)
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }
  }

  const handleBooking = async () => {
    if (!currentToken) {
      setBookingResult({
        success: false,
        message: "Please login first to book tennis courts.",
      })
      return
    }

    setIsBooking(true)
    setBookingResult(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          placeId: 801, 
          placeUtilityId: 625, 
          timeConstraintId: 575,
          jwtToken: currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        setBookingResult({
          success: true,
          message: "Tennis court booking completed successfully! 🎾",
        })
      } else {
        setBookingResult({
          success: false,
          message: result.message || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      setBookingResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleBooking2 = async () => {
    if (!currentToken) {
      setBookingResult2({
        success: false,
        message: "Please login first to book tennis courts.",
      })
      return
    }

    setIsBooking2(true)
    setBookingResult2(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          placeId: 802, 
          placeUtilityId: 626, 
          timeConstraintId: 575,
          jwtToken: currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        setBookingResult2({
          success: true,
          message: "Tennis court booking completed successfully! 🎾",
        })
      } else {
        setBookingResult2({
          success: false,
          message: result.message || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      setBookingResult2({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsBooking2(false)
    }
  }

  const handleBooking3 = async () => {
    if (!currentToken) {
      setBookingResult3({
        success: false,
        message: "Please login first to book tennis courts.",
      })
      return
    }

    setIsBooking3(true)
    setBookingResult3(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: 802,
          placeUtilityId: 626,
          timeConstraintId: 571,
          jwtToken: currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        setBookingResult3({
          success: true,
          message: "Tennis court booking completed successfully! 🎾",
        })
      } else {
        setBookingResult3({
          success: false,
          message: result.message || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      setBookingResult3({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsBooking3(false)
    }
  }

  const handleBooking4 = async () => {
    if (!currentToken) {
      setBookingResult4({
        success: false,
        message: "Please login first to book tennis courts.",
      })
      return
    }

    setIsBooking4(true)
    setBookingResult4(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: 801,
          placeUtilityId: 625,
          timeConstraintId: 576,
          jwtToken: currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        setBookingResult4({
          success: true,
          message: "Tennis court booking completed successfully! 🎾",
        })
      } else {
        setBookingResult4({
          success: false,
          message: result.message || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      setBookingResult4({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsBooking4(false)
    }
  }

  const handleBooking5 = async () => {
    if (!currentToken) {
      setBookingResult5({
        success: false,
        message: "Please login first to book tennis courts.",
      })
      return
    }

    setIsBooking5(true)
    setBookingResult5(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: 802,
          placeUtilityId: 625,
          timeConstraintId: 576,
          jwtToken: currentToken
        }),
      })

      const result = await response.json()

      if (result?.data?.transactionId || result?.data?.userId) {
        setBookingResult5({
          success: true,
          message: "Tennis court booking completed successfully! 🎾",
        })
      } else {
        setBookingResult5({
          success: false,
          message: result.message || "Booking failed. Please try again.",
        })
      }
    } catch (error) {
      setBookingResult5({
        success: false,
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsBooking5(false)
    }
  }


  const handleLogout = async () => {
    try {
      // Clear token from server
      await ClientTokenService.clearToken("0979251496")
      
      setCurrentToken(null)
      setIsLoggedIn(false)
      setUserData(null)
      setBookingResult(null)
      setBookingResult2(null)
      setBookingResult3(null)
      setBookingResult4(null)
      setBookingResult5(null)
      router.push("/login")
    } catch (error) {
      console.error("Failed to logout:", error)
      // Still redirect to login even if server logout fails
      router.push("/login")
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tennis Court Booking</h1>
            <p className="text-gray-600">Welcome back, {userData?.data?.fullName || "User"}!</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push("/utilities")}
              variant="outline"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Utilities
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* First booking card (original) */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
              

              {bookingResult && (
                <Alert className={bookingResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking}
                disabled={isBooking || !isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '18h-20h'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
             

              {bookingResult2 && (
                <Alert className={bookingResult2.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult2.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult2.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking2}
                disabled={isBooking2 || !isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isBooking2 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '18h-20h'}
              </Button>
            </CardContent>
          </Card>

          {/* Third booking card */}
          {/* Fourth booking card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">

              {bookingResult4 && (
                <Alert className={bookingResult4.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult4.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult4.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking4}
                disabled={isBooking4 || !isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isBooking4 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '20h-21h'}
              </Button>
            </CardContent>
          </Card>

          {/* Fifth booking card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">

              {bookingResult5 && (
                <Alert className={bookingResult5.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult5.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult5.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking5}
                disabled={isBooking5 || !isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isBooking5 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '20h-21h'}
              </Button>
            </CardContent>
          </Card>

          {/* Third booking card (moved to end) */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
              

              {bookingResult3 && (
                <Alert className={bookingResult3.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult3.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{bookingResult3.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking3}
                disabled={isBooking3 || !isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isBooking3 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '10h-12h'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sequential flow: time slots → classifies → places → ticket info → booking
          </p>
        </div>
      </div>
    </div>
  )
}

