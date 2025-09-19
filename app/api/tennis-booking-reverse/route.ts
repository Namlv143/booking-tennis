import { NextResponse } from "next/server"

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

interface TimeSlot {
  id: number
  fromTime: string
}

interface ApiResponse {
  data?: any
  error?: string
  code?: number
  message?: string
}

interface StepResult {
  success?: boolean
  error?: string
}

class VinhomesTennisBooking {
  // Static constants - configuration that doesn't change
  private static readonly BASE_URL = "https://vh.vinhomes.vn"
  private static readonly SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
  private static readonly UTILITY_ID = 75
  // private static readonly CLASSIFY_ID = 117  // Hardcoded
  private static readonly RESIDENT_TICKET_COUNT = 4
  private static readonly DEVICE_TYPE = "ANDROID"

  // Hardcoded parameters
  private readonly placeId: number = 796
  private readonly placeUtilityId: number = 625  // Will be set from API response
  private readonly timeConstraintId: number = 571
  private readonly jwtToken: string
  
  // Internal state - managed during booking flow
  private fromTime: string | null = null  // Can be timestamp string like "1758337200000"
  private bookingDate: number | null = null
  private cookies: string = ""  // Store cookies from step 4

  constructor(jwtToken: string) {
    this.jwtToken = jwtToken
  }

  // Private utility methods - internal helpers
  private getHeaders(method: string): Record<string, string> {
    const headers: Record<string, string> = {
      "user-agent": "Dart/3.7 (dart:io)",
      "app-version-name": "1.5.5",
      "device-inf": "PHY110 OPPO 35",
      "accept-language": "vi",
      "x-vinhome-token": this.jwtToken,
      "device-id": "51a9e0d3fcb8574c",
      host: "vh.vinhomes.vn",
      "content-type": "application/json; charset=UTF-8",
    }

    // Add cookies if available
    if (this.cookies) {
      headers["Cookie"] = this.cookies
    }

    if (method === "POST") {
      headers["Connection"] = "keep-alive"
      headers["accept-encoding"] = "gzip, deflate, br"
    } else {
      headers["accept-encoding"] = "gzip"
    }

    return headers
  }

  private getBookingDate(): number {
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // UTC+7
    const bookingDate = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
    return bookingDate.getTime()
  }

  private async generateChecksum(bookingData: BookingData): Promise<string> {
    const booking = bookingData.bookingRequests[0]
    
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
    
    const interpolatedString = `${numericSum}${VinhomesTennisBooking.SECRET_KEY}`

    const encoder = new TextEncoder()
    const data = encoder.encode(interpolatedString)
    
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const checksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    
    return checksum
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, string | any>,
  ): Promise<ApiResponse> {
    const url = new URL(endpoint, VinhomesTennisBooking.BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = this.getHeaders(method)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        cache: "no-store",
        redirect: "manual",
        referrerPolicy: "no-referrer",
        mode: "cors",
        credentials: "omit",
        keepalive: false,
        integrity: undefined,
        signal: undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response body:", errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      // Extract cookies from response headers
      const setCookieHeaders = (response.headers as any).getSetCookie?.() || []
      if (setCookieHeaders.length > 0) {
        const cookieStrings = setCookieHeaders.map((cookie: string) => {
          // Extract only the name=value part before the first semicolon
          const nameValue = cookie.split(';')[0].trim()
          return nameValue
        })
        this.cookies = cookieStrings.join('; ')
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error("Request failed with error:", error)
      return { error: String(error) }
    }
  }

  // Private booking flow methods - step-by-step process
  // STEP 1: Get time slots - COMMENTED OUT
  // private async getTimeSlots(): Promise<StepResult> {
  //   this.bookingDate = this.getBookingDate()
  //   const params = { bookingDate: this.bookingDate }
  //   const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/booking-time`
  //   const response = await this.makeRequest("GET", endpoint, undefined, params)
  //   if (response.error) {
  //     console.error("❌ [STEP 1] Error in getTimeSlots:", response.error)
  //     return { error: response.error }
  //   }
  //   const timeSlots: TimeSlot[] = response.data || []
  //   const targetSlot = timeSlots.find((slot: TimeSlot) => slot.id === this.timeConstraintId)
  //   this.fromTime = targetSlot?.fromTime || ""
  //   return { success: true }
  // }

  // STEP 2: Get classifies - COMMENTED OUT
  // private async getClassifies(): Promise<StepResult> {
  //   const params = {
  //     timeConstraintId: this.timeConstraintId,
  //     monthlyTicket: "false",
  //     fromTime: this.fromTime!,
  //   }
  //   const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/classifies`
  //   const response = await this.makeRequest("GET", endpoint, undefined, params)
  //   if (response.error) {
  //     console.error("❌ [STEP 2] Error in getClassifies:", response.error)
  //     return { error: response.error }
  //   }
  //   return { success: true }
  // }

  // STEP 3: Get places - COMMENTED OUT
  // private async getPlaces(): Promise<StepResult> {
  //   const params = {
  //     classifyId: VinhomesTennisBooking.CLASSIFY_ID,
  //     fromTime: this.fromTime!,
  //     timeConstraintId: this.timeConstraintId,
  //     monthlyTicket: "false",
  //   }
  //   const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/places`
  //   const response = await this.makeRequest("GET", endpoint, undefined, params)
  //   if (response.error) {
  //     console.error("❌ [STEP 3] Error in getPlaces:", response.error)
  //     return { error: response.error }
  //   }
  //   return { success: true }
  // }

  private async getTicketInfo(): Promise<StepResult> {
    // Set hardcoded values
    this.bookingDate = this.getBookingDate()
    // this.fromTime = "1758337200000"  // Hardcoded fromTime timestamp for timeConstraintId 571
    
    const params = {
      bookingDate: this.bookingDate,
      placeUtilityId: this.placeUtilityId,
      timeConstraintId: this.timeConstraintId,
    }
    const endpoint = "/api/vhr/utility/v0/utility/ticket-info"

    console.log("🎫 [STEP 4] Getting ticket info with params:", params)
    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      console.error("❌ [STEP 4] Error in getTicketInfo:", response.error)
      return { error: response.error }
    }

    console.log("✅ [STEP 4] Ticket info retrieved successfully")
    return { success: true }
  }

  private async makeBooking(): Promise<ApiResponse> {
    const bookingData: BookingData = {
      bookingRequests: [
        {
          bookingDate: this.bookingDate!,
          placeId: this.placeId,
          timeConstraintId: this.timeConstraintId,
          utilityId: VinhomesTennisBooking.UTILITY_ID,
          residentTicket: VinhomesTennisBooking.RESIDENT_TICKET_COUNT,
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
    bookingData.cs = await this.generateChecksum(bookingData)

    const endpoint = "/api/vhr/utility/v0/customer-utility/booking"
    
    const result = await this.makeRequest("POST", endpoint, bookingData)
    
    if (result.error) {
      console.error("❌ [STEP 5] Booking failed:", result.error)
    }
    
    return result
  }

  // Public method - main booking execution flow
  async executeBookingFlow(): Promise<ApiResponse> {
  
    const step4 = await this.getTicketInfo()
    if (step4.error) {
      console.error("💥 STEP 4 FAILED:", step4.error)
      return { error: "Step 4 failed: " + step4.error }
    }
    const result = await this.makeBooking()
    if (result.error) {
      console.error("💥 FINAL RESULT: BOOKING FAILED")
      console.error("💥 Error:", result.error)
    } else {
      console.error("🎉 FINAL RESULT: BOOKING SUCCESS!")
    }
    
    return result
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body to get jwtToken only (other parameters are hardcoded)
    const body = await request.json()
    
    const { jwtToken } = body
    
    if (!jwtToken) {
      console.error("❌ VALIDATION FAILED: Missing jwtToken")
      return NextResponse.json(
        { message: "jwtToken is required" },
        { status: 400 },
      )
    }
    
    const booking = new VinhomesTennisBooking(jwtToken)
    const result = await booking.executeBookingFlow()

    if (result.error) {
      console.error("❌ Returning error response:", result.error)
      return NextResponse.json({ message: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 UNEXPECTED ERROR in tennis booking reverse API:")
    console.error("💥 Error type:", typeof error)
    console.error("💥 Error message:", error instanceof Error ? error.message : String(error))
    console.error("💥 Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ message: "Internal server error: " + String(error) }, { status: 500 })
  }
}
