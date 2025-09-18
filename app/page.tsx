"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, Clock, MapPin } from "lucide-react"

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

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginResult, setLoginResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleBooking = async () => {
    setIsBooking(true)
    setBookingResult(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ placeId: 801, placeUtilityId: 625, timeConstraintId: 575 }),
      })

      const result = await response.json()

      if (response.ok && (result.code === undefined || result.code === 200)) {
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
    setIsBooking2(true)
    setBookingResult2(null)

    try {
      const response = await fetch("/api/tennis-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ placeId: 802, placeUtilityId: 626, timeConstraintId: 575 }),
      })

      const result = await response.json()

      if (response.ok && (result.code === undefined || result.code === 200)) {
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

      if (response.ok) {
        setLoginResult({
          success: true,
          message: "Login successful!",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="mb-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Login Test</CardTitle>
              <CardDescription className="text-gray-600">Test reversed login API with your credentials</CardDescription>
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
                  />
                </div>
              </div>

              {loginResult && (
                <Alert className={loginResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={loginResult.success ? "text-green-800" : "text-red-800"}>
                    <div className="font-semibold mb-2">{loginResult.message}</div>
                    {loginResult.data && (
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(loginResult.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn || !username || !password}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Login...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* First booking card (original) */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">S1</CardTitle>
              <CardDescription className="text-gray-600">Place Utility: 625</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Time: 18:20</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>San: 01</span>
                </div>
              </div>

              {bookingResult && (
                <Alert className={bookingResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult.success ? "text-green-800" : "text-red-800"}>
                    {bookingResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                size="lg"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">S1</CardTitle>
              <CardDescription className="text-gray-600">Place Utility: 626</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Time: 18:20</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>San: 02</span>
                </div>
              </div>

              {bookingResult2 && (
                <Alert className={bookingResult2.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={bookingResult2.success ? "text-green-800" : "text-red-800"}>
                    {bookingResult2.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking2}
                disabled={isBooking2}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                size="lg"
              >
                {isBooking2 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book"
                )}
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
