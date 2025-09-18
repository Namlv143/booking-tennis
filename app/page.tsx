"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, LogOut, LayoutList, ArrowRight } from "lucide-react"
import { TokenService } from "@/lib/token-service"

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
    const token = TokenService.getToken("0979251496")
    
    if (token) {
      setCurrentToken(token)
      setIsLoggedIn(true)
      
      // Load user data
      loadUserData(token)
      
      // Redirect to utilities as homepage when logged in
      router.push("/utilities")
    } else {
      // No token, redirect to login
      router.push("/login")
    }
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


  const handleLogout = () => {
    TokenService.clearAllTokens()
    setCurrentToken(null)
    setIsLoggedIn(false)
    setUserData(null)
    setBookingResult(null)
    setBookingResult2(null)
    setBookingResult3(null)
    setBookingResult4(null)
    setBookingResult5(null)
    router.push("/login")
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

  // Show redirecting message since utilities is now the homepage
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  )
}

