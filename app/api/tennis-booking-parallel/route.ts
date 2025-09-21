import { NextResponse } from "next/server"
import crypto from "crypto"

// Types for better type safety
interface BookingRequest {
  bookingDate: number
  placeId: number
  timeConstraintId: number
  utilityId: number
  residentTicket: number
  residentChildTicket: null
  guestTicket: null
  guestChildTicket: null
}

interface BookingData {
  bookingRequests: BookingRequest[]
  paymentMethod: null
  vinClubPoint: null
  deviceType: string
  cs?: string
}

interface ApiResponse {
  data?: any
  error?: string
  code?: number
  message?: string
}

interface CourtInfo {
  place_id: number
  place_utility_id: number
  time_constraint_id: number
  name: string
}

interface BookingResult extends CourtInfo {
  result: ApiResponse
}

class VinhomesTennisBooking {
  // Static constants
  private static readonly BASE_URL = "https://vh.vinhomes.vn"
  private static readonly SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
  private static readonly UTILITY_ID = 75
  private static readonly CLASSIFY_ID = 118
  private static readonly DEVICE_TYPE = "ANDROID"

  // Instance properties
  private readonly placeId: number
  private readonly placeUtilityId: number
  private readonly timeConstraintId: number
  private readonly jwtToken: string
  private bookingDate: number | null = null

  constructor(placeId: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string) {
    this.placeId = placeId
    this.placeUtilityId = placeUtilityId
    this.timeConstraintId = timeConstraintId
    this.jwtToken = jwtToken
  }

  // Private utility methods
  private getHeaders(): Record<string, string> {
    return {
      "user-agent": "Dart/3.7 (dart:io)",
      "app-version-name": "1.5.5",
      "device-inf": "PHY110 OPPO 35",
      "accept-language": "vi",
      "x-vinhome-token": this.jwtToken,
      "device-id": "51a9e0d3fcb8574c",
      "host": "vh.vinhomes.vn",
      "content-type": "application/json; charset=UTF-8",
      "accept-encoding": "gzip"
    }
  }

  private getBookingDate(): number {
    const now = new Date()
    const bookingDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
    return bookingDate.getTime()
  }

  private generateFromTime(hour: number, daysToAdd: number): number {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysToAdd)
    
    // Vietnam is UTC+7
    // When setting 18:00 in Vietnam time, we need to adjust for the UTC time that the server expects
    // 18:00 Vietnam time is 11:00 UTC
    const vietnamHourInUtc = hour - 7
    targetDate.setUTCHours(vietnamHourInUtc, 0, 0, 0)
    
    return targetDate.getTime()
  }

  private generateChecksum(bookingData: BookingData): string {
    const booking = bookingData.bookingRequests[0]
    
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
    
    const interpolatedString = `${numericSum}${VinhomesTennisBooking.SECRET_KEY}`
    
    return crypto.createHash('sha256').update(interpolatedString).digest('hex')
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse> {
    const url = new URL(endpoint, VinhomesTennisBooking.BASE_URL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const headers = this.getHeaders()

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP ${response.status}: ${errorText}`)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error("Request failed:", error)
      return { error: String(error) }
    }
  }

  // Execute the booking flow - follows the Python script's logic
  async executeBookingFlow(): Promise<ApiResponse> {
    try {
      // Set booking date and from time for tomorrow
      this.bookingDate = this.getBookingDate()
      const fromTime = this.generateFromTime(18, 1) // 18:00 (6 PM) tomorrow

      // Sequential API calls to update server-side session state
      await this.makeRequest(
        "GET", 
        `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/booking-time`,
        undefined,
        { bookingDate: this.bookingDate }
      )

      await this.makeRequest(
        "GET",
        `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/classifies`,
        undefined,
        { 
          timeConstraintId: this.timeConstraintId,
          monthlyTicket: false,
          fromTime: fromTime
        }
      )

      await this.makeRequest(
        "GET",
        `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/places`,
        undefined,
        {
          classifyId: VinhomesTennisBooking.CLASSIFY_ID,
          timeConstraintId: this.timeConstraintId,
          monthlyTicket: false,
          fromTime: fromTime
        }
      )

      await this.makeRequest(
        "GET",
        "/api/vhr/utility/v0/utility/ticket-info",
        undefined,
        {
          bookingDate: this.bookingDate,
          placeUtilityId: this.placeUtilityId,
          timeConstraintId: this.timeConstraintId
        }
      )

      // Construct and send the final booking request
      const bookingData: BookingData = {
        bookingRequests: [
          {
            bookingDate: this.bookingDate,
            placeId: this.placeId,
            timeConstraintId: this.timeConstraintId,
            utilityId: VinhomesTennisBooking.UTILITY_ID,
            residentTicket: 4, // Using the same value as in Python script
            residentChildTicket: null,
            guestTicket: null,
            guestChildTicket: null,
          },
        ],
        paymentMethod: null,
        vinClubPoint: null,
        deviceType: VinhomesTennisBooking.DEVICE_TYPE,
      }

      // Add checksum
      bookingData.cs = this.generateChecksum(bookingData)

      // Execute final booking
      return await this.makeRequest("POST", "/api/vhr/utility/v0/customer-utility/booking", bookingData)
    } catch (error) {
      console.error("Error in booking flow:", error)
      return { error: String(error) }
    }
  }
}

// Helper function to book a court
async function bookCourt(courtInfo: CourtInfo, jwtToken: string): Promise<BookingResult> {
  console.log(`🚀 Preparing booking for: ${courtInfo.name}`)
  
  try {
    const bookingInstance = new VinhomesTennisBooking(
      courtInfo.place_id,
      courtInfo.place_utility_id,
      courtInfo.time_constraint_id,
      jwtToken
    )
    
    const result = await bookingInstance.executeBookingFlow()
    return { ...courtInfo, result }
  } catch (error) {
    return { 
      ...courtInfo, 
      result: { error: String(error) } 
    }
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { jwtToken, courtsToBook } = body

    if (!jwtToken) {
      return NextResponse.json({ message: "JWT token is required" }, { status: 400 })
    }

    if (!courtsToBook || !Array.isArray(courtsToBook) || courtsToBook.length === 0) {
      return NextResponse.json({ message: "courtsToBook array is required and cannot be empty" }, { status: 400 })
    }

    // Book multiple courts in parallel
    console.log("🎾 Starting booking race for multiple tennis courts...")
    
    // Execute all booking operations in parallel
    const bookingPromises = courtsToBook.map(court => bookCourt(court, jwtToken))
    const results = await Promise.all(bookingPromises)
    
    // Check for any successful bookings
    const successfulBooking = results.find(result => 
      result.result.code === 200 && !result.result.error
    )
    
    if (successfulBooking) {
      console.log(`✅ SUCCESS for ${successfulBooking.name}! A court has been booked.`)
      return NextResponse.json({
        success: true,
        message: `Successfully booked ${successfulBooking.name}`,
        booking: successfulBooking,
        allResults: results
      })
    } else {
      console.log("💔 All booking attempts failed.")
      return NextResponse.json({
        success: false,
        message: "All booking attempts failed",
        results
      })
    }
  } catch (error) {
    console.error("💥 UNEXPECTED ERROR:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error: " + String(error) 
    }, { status: 500 })
  }
}

