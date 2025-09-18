import { NextResponse } from "next/server"

class VinhomesTennisBooking {
  private baseUrl = "https://vh.vinhomes.vn"
  private jwtToken =
    "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxODI2NSIsInN1YiI6IjA5NzkyNTE0OTYiLCJhdWQiOiJvYXV0aCIsImlhdCI6MTc1ODA5ODg4NiwiZXhwIjoxNzU4MTg1Mjg2fQ.3n0wf4LoM4ZuOCMNaLdOpBCavvcx05XD1u4GhVKzZkd-cXIl_XXnvPa_WB_6kN_9gXLW3X1CZLlqIqg0bnoWEA"
  private secretKey = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"

  // Pre-configured data
  private utilityId = 75
  private placeId: number
  private placeUtilityId: number
  private classifyId = 118
  private timeConstraintId: number
  private fromTime: string | null = null
  private bookingDate: number | null = null

  constructor(placeId: number, placeUtilityId: number, timeConstraintId: number) {
    this.placeId = placeId
    this.placeUtilityId = placeUtilityId
    this.timeConstraintId = timeConstraintId
  }

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

  private async generateChecksum(bookingData: any): Promise<string> {
    const booking = bookingData.bookingRequests[0]
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
    const interpolatedString = `${numericSum}${this.secretKey}`

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
  ): Promise<any> {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = this.getHeaders(method)

    console.log("[v0] Making request:", {
      method,
      url: url.toString(),
      headers,
      data: data ? JSON.stringify(data, null, 2) : undefined,
    })

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        // Prevent all automatic headers and behaviors
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

  private async getTimeSlots(): Promise<{ success?: boolean; error?: string }> {
    this.bookingDate = this.getBookingDate()

    const params = { bookingDate: this.bookingDate.toString() }
    const endpoint = `/api/vhr/utility/v0/utility/${this.utilityId}/booking-time`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    // Extract fromTime from API response for id=575
    const timeSlots = response.data || []
    const targetSlot = timeSlots.find((slot: any) => slot.id === this.timeConstraintId)

    this.fromTime = targetSlot.fromTime
    return { success: true }
  }

  private async getClassifies(): Promise<{ success?: boolean; error?: string }> {
    const params = {
      timeConstraintId: this.timeConstraintId.toString(),
      monthlyTicket: "false",
      fromTime: this.fromTime!,
    }
    const endpoint = `/api/vhr/utility/v0/utility/${this.utilityId}/classifies`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    return { success: true }
  }

  private async getPlaces(): Promise<{ success?: boolean; error?: string }> {
    const params = {
      classifyId: this.classifyId.toString(),
      fromTime: this.fromTime!,
      timeConstraintId: this.timeConstraintId.toString(),
      monthlyTicket: "false",
    }
    const endpoint = `/api/vhr/utility/v0/utility/${this.utilityId}/places`

    const response = await this.makeRequest("GET", endpoint, undefined, params)
    if (response.error) {
      return { error: response.error }
    }

    return { success: true }
  }

  private async getTicketInfo(): Promise<{ success?: boolean; error?: string }> {
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

  private async makeBooking(): Promise<any> {
    const bookingData = {
      bookingRequests: [
        {
          bookingDate: this.bookingDate!,
          placeId: this.placeId,
          timeConstraintId: this.timeConstraintId,
          utilityId: this.utilityId,
          residentTicket: 4,
          residentChildTicket: null,
          guestTicket: null,
          guestChildTicket: null,
        },
      ],
      paymentMethod: null,
      vinClubPoint: null,
      deviceType: "ANDROID",
    }

    // Add checksum
    bookingData.cs = await this.generateChecksum(bookingData)

    const endpoint = "/api/vhr/utility/v0/customer-utility/booking"
    return await this.makeRequest("POST", endpoint, bookingData)
  }

  async executeBookingFlow(): Promise<any> {
    // Step 1: Get time slots
    console.log("[v0] Step 1: Getting time slots...")
    const step1 = await this.getTimeSlots()
    if (step1.error) {
      console.log("[v0] Step 1 failed:", step1.error)
      return { error: "Step 1 failed: " + step1.error }
    }
    console.log("[v0] Step 1 completed successfully")

    // Step 2: Get classifies
    console.log("[v0] Step 2: Getting classifies...")
    const step2 = await this.getClassifies()
    if (step2.error) {
      console.log("[v0] Step 2 failed:", step2.error)
      return { error: "Step 2 failed: " + step2.error }
    }
    console.log("[v0] Step 2 completed successfully")

    // Step 3: Get places
    console.log("[v0] Step 3: Getting places...")
    const step3 = await this.getPlaces()
    if (step3.error) {
      console.log("[v0] Step 3 failed:", step3.error)
      return { error: "Step 3 failed: " + step3.error }
    }
    console.log("[v0] Step 3 completed successfully")

    console.log("[v0] Step 4: Triggering ticket info (non-blocking)...")
    this.getTicketInfo()
      .then((result) => {
        if (result.error) {
          console.log("[v0] Step 4 failed (async):", result.error)
        } else {
          console.log("[v0] Step 4 completed successfully (async)")
        }
      })
      .catch((error) => {
        console.log("[v0] Step 4 error (async):", error)
      })

    console.log("[v0] Step 5: Making booking (parallel with ticket info)...")
    const result = await this.makeBooking()
    console.log("[v0] Final booking result:", result)
    return result
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Tennis booking API called")

    // Parse request body to get placeId, placeUtilityId, and timeConstraintId
    const body = await request.json()
    const { placeId, placeUtilityId, timeConstraintId } = body

    if (!placeId || !placeUtilityId || !timeConstraintId) {
      return NextResponse.json(
        { message: "placeId, placeUtilityId, and timeConstraintId are required" },
        { status: 400 },
      )
    }

    console.log(
      `[v0] Booking for placeId: ${placeId}, placeUtilityId: ${placeUtilityId}, timeConstraintId: ${timeConstraintId}`,
    )

    const booking = new VinhomesTennisBooking(placeId, placeUtilityId, timeConstraintId)
    const result = await booking.executeBookingFlow()

    if (result.error) {
      console.log("[v0] Booking failed with error:", result.error)
      return NextResponse.json({ message: result.error }, { status: 400 })
    }

    console.log("[v0] Booking completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.log("[v0] Unexpected error:", error)
    return NextResponse.json({ message: "Internal server error: " + String(error) }, { status: 500 })
  }
}
