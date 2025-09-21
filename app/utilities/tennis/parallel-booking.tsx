"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BOOKING_CONFIG } from "@/lib/booking-config"

interface BookingResult {
  success: boolean
  message: string
  booking?: any
  allResults?: any[]
  error?: string
}

export default function ParallelBooking() {
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<BookingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleBooking = async () => {
    if (!token) {
      setErrorMessage("Please enter your authentication token")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)

    try {
      // Court information from booking config
      const courtsToBook = [
        {
          place_id: BOOKING_CONFIG.bookingPreferences.card1.placeId,
          place_utility_id: BOOKING_CONFIG.bookingPreferences.card1.placeUtilityId, 
          time_constraint_id: BOOKING_CONFIG.bookingPreferences.card1.timeConstraintId,
          name: `${BOOKING_CONFIG.bookingPreferences.card1.courtName} at ${BOOKING_CONFIG.bookingPreferences.card1.timeSlot}`
        },
        {
          place_id: BOOKING_CONFIG.bookingPreferences.card2.placeId,
          place_utility_id: BOOKING_CONFIG.bookingPreferences.card2.placeUtilityId,
          time_constraint_id: BOOKING_CONFIG.bookingPreferences.card2.timeConstraintId,
          name: `${BOOKING_CONFIG.bookingPreferences.card2.courtName} at ${BOOKING_CONFIG.bookingPreferences.card2.timeSlot}`
        }
      ]

      // Call the parallel booking API
      const response = await fetch("/api/tennis-booking-parallel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwtToken: token,
          courtsToBook
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to book courts")
      }

      setResult(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Parallel Tennis Court Booking</CardTitle>
        <CardDescription>
          Book multiple tennis courts simultaneously to increase your chances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="token" className="font-medium">
              Authentication Token
            </label>
            <textarea
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your JWT token"
              className="p-2 border rounded-md min-h-[80px]"
            />
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertTitle>{result.success ? "Success!" : "Failed"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.success && result.booking && (
                  <div className="mt-2">
                    <strong>Booked:</strong> {result.booking.name}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleBooking} 
          disabled={isLoading || !token}
          className="w-full"
        >
          {isLoading ? "Booking..." : "Book Tennis Courts"}
        </Button>
      </CardFooter>
    </Card>
  )
}

