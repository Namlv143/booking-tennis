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
  private static readonly CLASSIFY_ID = 118
  private static readonly RESIDENT_TICKET_COUNT = 4
  private static readonly DEVICE_TYPE = "ANDROID"

  // Instance properties - specific to each booking
  private readonly placeId: number
  private readonly placeUtilityId: number
  private readonly timeConstraintId: number
  private readonly jwtToken: string
  
  // Internal state - managed during booking flow
  private fromTime: string | null = null
  private bookingDate: number | null = null

  constructor(placeId: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string) {
    this.placeId = placeId
    this.placeUtilityId = placeUtilityId
    this.timeConstraintId = timeConstraintId
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
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, string>,
  ): Promise<ApiResponse> {
    const url = new URL(endpoint, VinhomesTennisBooking.BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = this.getHeaders(method)

    console.log("[v0] Making request:", {
      method,
      url: url.toString(),
      headers: { ...headers, "x-vinhome-token": "***" }, // Hide token in logs
      data: data ? JSON.stringify(data, null, 2) : undefined,
    })

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        // Mimic mobile app behavior more closely
        cache: "no-store",
        redirect: "manual",
        referrerPolicy: "no-referrer",
        mode: "cors",
        credentials: "omit",
        keepalive: false,
        // Additional options to match mobile app behavior
        integrity: undefined,
        signal: undefined,
      })

      console.log("[v0] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Error response body:", errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)
      return responseData
    } catch (error) {
      console.log("[v0] Request failed with error:", error)
      return { error: String(error) }
    }
  }

  // Private booking flow methods - step-by-step process
  private async getTimeSlots(): Promise<StepResult> {
    this.bookingDate = this.getBookingDate()

    const params = { bookingDate: this.bookingDate.toString() }
    const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/booking-time`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    // Extract fromTime from API response for the specific time constraint
    const timeSlots: TimeSlot[] = response.data || []
    const targetSlot = timeSlots.find((slot: TimeSlot) => slot.id === this.timeConstraintId)

    if (!targetSlot) {
      return { error: `Time slot with id ${this.timeConstraintId} not found` }
    }

    this.fromTime = targetSlot.fromTime
    return { success: true }
  }

  private async getClassifies(): Promise<StepResult> {
    const params = {
      timeConstraintId: this.timeConstraintId.toString(),
      monthlyTicket: "false",
      fromTime: this.fromTime!,
    }
    const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/classifies`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    return { success: true }
  }

  private async getPlaces(): Promise<StepResult> {
    const params = {
      classifyId: VinhomesTennisBooking.CLASSIFY_ID.toString(),
      fromTime: this.fromTime!,
      timeConstraintId: this.timeConstraintId.toString(),
      monthlyTicket: "false",
    }
    const endpoint = `/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/places`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    return { success: true }
  }

  private async getTicketInfo(): Promise<StepResult> {
    const params = {
      bookingDate: this.bookingDate!.toString(),
      placeUtilityId: this.placeUtilityId.toString(),
      timeConstraintId: this.timeConstraintId.toString(),
    }
    const endpoint = "/api/vhr/utility/v0/utility/ticket-info"

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

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
    return await this.makeRequest("POST", endpoint, bookingData)
  }

  // Public method - main booking execution flow
  async executeBookingFlow(): Promise<ApiResponse> {
    // Step 1: Get time slots
    console.log("Step 1: Getting time slots...")
    const step1 = await this.getTimeSlots()
    if (step1.error) {
      console.log("Step 1 failed:", step1.error)
      return { error: "Step 1 failed: " + step1.error }
    }
    console.log("Step 1 completed successfully")

    // Step 2: Get classifies
    console.log("Step 2: Getting classifies...")
    const step2 = await this.getClassifies()
    if (step2.error) {
      console.log("Step 2 failed:", step2.error)
      return { error: "Step 2 failed: " + step2.error }
    }
    console.log("Step 2 completed successfully")

    // Step 3: Get places
    console.log("Step 3: Getting places...")
    const step3 = await this.getPlaces()
    if (step3.error) {
      console.log("Step 3 failed:", step3.error)
      return { error: "Step 3 failed: " + step3.error }
    }
    console.log("Step 3 completed successfully")

    // Step 4: Trigger ticket info (non-blocking for performance)
    console.log("Step 4: Triggering ticket info (non-blocking)...")
    this.getTicketInfo()
      .then((result) => {
        if (result.error) {
          console.log("Step 4 failed (async):", result.error)
        } else {
          console.log("Step 4 completed successfully (async)")
        }
      })
      .catch((error) => {
        console.log("Step 4 error (async):", error)
      })

    // Step 5: Make booking (parallel with ticket info for performance)
    console.log("Step 5: Making booking (parallel with ticket info)...")
    const result = await this.makeBooking()
    console.log("Final booking result:", result)
    return result
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body to get placeId, placeUtilityId, timeConstraintId, jwtToken, and optional mode
    const body = await request.json()
    const { placeId, placeUtilityId, timeConstraintId, jwtToken, mode = "stealth" } = body

    if (!placeId || !placeUtilityId || !timeConstraintId || !jwtToken) {
      return NextResponse.json(
        { message: "placeId, placeUtilityId, timeConstraintId, and jwtToken are required" },
        { status: 400 },
      )
    }
    const booking = new VinhomesTennisBooking(placeId, placeUtilityId, timeConstraintId, jwtToken)


    const result = await booking.executeBookingFlow()

    if (result.error) {
      return NextResponse.json({ message: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ message: "Internal server error: " + String(error) }, { status: 500 })
  }
}
