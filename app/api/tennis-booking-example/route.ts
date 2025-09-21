import { NextResponse } from "next/server"
import { BOOKING_CONFIG } from "@/lib/booking-config"

export async function GET() {
  try {
    // This is just an example - in a real implementation you would get the token from authentication
    // For testing purposes, we'll use a fixed token
    const jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxODI2NSIsInN1YiI6IjA5NzkyNTE0OTYiLCJhdWQiOiJvYXV0aCIsImlhdCI6MTc1ODMwNDgwNSwiZXhwIjoxNzU4MzkxMjA1fQ.WYQqDM411KP-OgVSnWzMnbCdzOPdhPPSqOaE6UO8eck7qqjkXaVy1vGy6rERlZE8_gLeN6-UWbfUj3x-O3Kv6Q"

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

    // Make the request to our parallel booking API
    const response = await fetch(new URL("/api/tennis-booking-parallel", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jwtToken,
        courtsToBook
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Failed to book courts: ${errorText}` }, { status: 500 })
    }

    const bookingResult = await response.json()
    return NextResponse.json(bookingResult)
  } catch (error) {
    console.error("Error in example endpoint:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

