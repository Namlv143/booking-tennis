"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, LogOut, LayoutList } from "lucide-react"
import { useApp } from "@/lib/context/app-context"

export default function TennisBookingPage() {
  const router = useRouter()
  const { state, logout, bookTennisCourt } = useApp()

  // Redirect if not logged in
  useEffect(() => {
    if (!state.isLoggedIn) {
      router.push("/login")
    }
  }, [state.isLoggedIn, router])

  const handleBooking = async () => {
    await bookTennisCourt({
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 575,
      bookingKey: "booking1"
    })
  }

  const handleBooking2 = async () => {
    await bookTennisCourt({
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 575,
      bookingKey: "booking2"
    })
  }

  const handleBooking3 = async () => {
    await bookTennisCourt({
      placeId: 802,
      placeUtilityId: 626,
      timeConstraintId: 571,
      bookingKey: "booking3"
    })
  }

  const handleBooking4 = async () => {
    await bookTennisCourt({
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 576,
      bookingKey: "booking4"
    })
  }

  const handleBooking5 = async () => {
    await bookTennisCourt({
      placeId: 802,
      placeUtilityId: 625,
      timeConstraintId: 576,
      bookingKey: "booking5"
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tennis Court Booking</h1>
            <p className="text-gray-600">Welcome back, {state.userData?.data?.fullName || "User"}!</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push("/utilities")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Dashboard
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
              {state.bookingResults.booking1 && (
                <Alert className={state.bookingResults.booking1.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={state.bookingResults.booking1.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{state.bookingResults.booking1.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking}
                disabled={state.isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {state.isBooking ? (
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
              {state.bookingResults.booking2 && (
                <Alert className={state.bookingResults.booking2.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={state.bookingResults.booking2.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{state.bookingResults.booking2.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking2}
                disabled={state.isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {state.isBooking ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '18h-20h'}
              </Button>
            </CardContent>
          </Card>

          {/* Third booking card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.02</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
              {state.bookingResults.booking3 && (
                <Alert className={state.bookingResults.booking3.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={state.bookingResults.booking3.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{state.bookingResults.booking3.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking3}
                disabled={state.isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {state.isBooking ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '10h-12h'}
              </Button>
            </CardContent>
          </Card>

          {/* Fourth booking card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center p-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800">S1.01</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1 px-4 py-2">
              {state.bookingResults.booking4 && (
                <Alert className={state.bookingResults.booking4.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={state.bookingResults.booking4.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{state.bookingResults.booking4.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking4}
                disabled={state.isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {state.isBooking ? (
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
              {state.bookingResults.booking5 && (
                <Alert className={state.bookingResults.booking5.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={state.bookingResults.booking5.success ? "text-green-800" : "text-red-800"}>
                    <div className="text-xs">{state.bookingResults.booking5.message}</div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleBooking5}
                disabled={state.isBooking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-sm"
                size="default"
              >
                {state.isBooking ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Booking...
                  </>
                ) : '20h-21h'}
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