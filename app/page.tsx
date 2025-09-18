"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, Clock, MapPin, LogOut, Settings, LayoutList } from "lucide-react"
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

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginResult, setLoginResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [editorConfig, setEditorConfig] = useState<any>(null)
  const [utilityData, setUtilityData] = useState<any>(null)

  const [isLoadingUtility, setIsLoadingUtility] = useState(false)
  const [utilityApiResult, setUtilityApiResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  // Check for existing token on component mount and auto-call APIs
  useEffect(() => {
    const token = TokenService.getToken(username || "0979251496");
    
    if (token) {
      setCurrentToken(token)
      setIsLoggedIn(true)
      
      // Auto-call APIs when token exists
      handleAutoLogin(token)
    }
  }, [username])

  const handleAutoLogin = async (token: string) => {
    try {
      console.log("[v0] Auto-login: Calling APIs with existing token...")
      
      // Call both APIs in parallel
      const [editorConfigResponse, userMeResponse] = await Promise.all([
        fetch("/api/editor-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }),
        fetch("/api/user-me", {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
      ])

      let hasSuccess = false
      // Process editor config response
      if (editorConfigResponse.ok) {
        const editorConfigResult = await editorConfigResponse.json()
        if (editorConfigResult.data) {
          setEditorConfig(editorConfigResult.data)
          console.log("[v0] Auto-login: Editor config loaded")
          hasSuccess = true
        }
      }

      // Process user/me response
      if (userMeResponse.ok) {
        const userMeResult = await userMeResponse.json()
        if (userMeResult.data) {
          setUserData(userMeResult.data)
          console.log("[v0] Auto-login: User data loaded")
          hasSuccess = true
        }
      }

      // If no APIs succeeded, clear token and reset state
      if (!hasSuccess) {
        console.log("[v0] Auto-login: No APIs succeeded, clearing token and resetting state")
        handleLogout()
        return
      }

      console.log("[v0] Auto-login: APIs completed successfully")
    } catch (error) {
      console.error("[v0] Auto-login: Failed to call APIs:", error)
      console.log("[v0] Auto-login: Error occurred, clearing token and resetting state")
      handleLogout()
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
        setCurrentToken(result.data.data.accessToken)
        setIsLoggedIn(true)
        
        // Store additional user data
        if (result.userMe?.data) {
          setUserData(result.userMe.data)
        }
        if (result.editorConfig?.data) {
          setEditorConfig(result.editorConfig.data)
        }
        if (result.utility?.data) {
          setUtilityData(result.utility.data)
        }
        
        setLoginResult({
          success: true,
          message: "Login successful! Token stored in localStorage.",
          data: result,
        })
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

  const handleLogout = () => {
    TokenService.clearAllTokens();
    setCurrentToken(null)
    setIsLoggedIn(false)
    setUserData(null)
    setEditorConfig(null)
    setUtilityData(null)
    setLoginResult(null)
    setBookingResult(null)
    setBookingResult2(null)
    setBookingResult3(null)
    setBookingResult4(null)
    setBookingResult5(null)
    setUtilityApiResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        
        {/* Login and Utility sections in same row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Login Section */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <LogOut className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">
                {isLoggedIn ? userData?.data?.fullName : "Login"}
              </CardTitle>

              {isLoggedIn && (
                <div className="mt-2">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 px-3 py-1 text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-2 p-4">
              {!isLoggedIn && <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-sm py-1"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm py-1"
                  />
                </div>
              </div>}


              {!isLoggedIn && <Button
                onClick={handleLogin}
                disabled={isLoggingIn || !username || !password || isLoggedIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Login...
                  </>
                ) : (
                  "Login"
                )}
              </Button>}
            </CardContent>
          </Card>

          {/* Utility API Section */}
          {isLoggedIn && (
            <Card className="shadow-lg">
              <CardHeader className="text-center p-2">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                  <LayoutList className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Utilities</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 p-2">
                {utilityApiResult && (
                  <Alert className={utilityApiResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={utilityApiResult.success ? "text-green-800" : "text-red-800"}>
                      <div className="text-xs">{utilityApiResult.message}</div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGetUtility}
                  disabled={isLoadingUtility}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold p-4 text-sm"
                  size="lg"
                >
                  {isLoadingUtility ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      DS Tiện ích
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Placeholder for logged out state */}
          {!isLoggedIn && (
            <Card className="shadow-lg opacity-50">
              <CardHeader className="text-center p-2">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <LayoutList className="w-6 h-6 text-gray-400" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-400">Utility Data</CardTitle>
                <CardDescription className="text-gray-400">Login required to access utilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Please login to access utility data
                </div>
              </CardContent>
            </Card>
          )}
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
