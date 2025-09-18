import { NextResponse } from 'next/server'
import { getVietnamTime } from '../../../../lib/booking-config'

// Import the VinhomesTennisBooking class from tennis-booking route
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
    params?: Record<string, string | any>,
  ): Promise<ApiResponse> {
    const url = new URL(endpoint, VinhomesTennisBooking.BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = this.getHeaders(method)

    console.log("[CRON] Making request:", {
      method,
      url: url,
      headers: { ...headers, "x-vinhome-token": "***" }, // Hide token in logs
      data: data ? JSON.stringify(data, null, 2) : undefined,
    })

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

      console.log("[CRON] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[CRON] Error response body:", errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const responseData = await response.json()
      console.log("[CRON] Response data:", responseData)
      return responseData
    } catch (error) {
      console.log("[CRON] Request failed with error:", error)
      return { error: String(error) }
    }
  }

  // Private booking flow methods - step-by-step process
  private async getTimeSlots(): Promise<StepResult> {
    this.bookingDate = this.getBookingDate()

    const params = { bookingDate: this.bookingDate }
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
      timeConstraintId: this.timeConstraintId,
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
      classifyId: VinhomesTennisBooking.CLASSIFY_ID,
      fromTime: this.fromTime!,
      timeConstraintId: this.timeConstraintId,
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
      bookingDate: this.bookingDate,
      placeUtilityId: this.placeUtilityId,
      timeConstraintId: this.timeConstraintId,
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
    console.log("[CRON] Step 1: Getting time slots...")
    const step1 = await this.getTimeSlots()
    if (step1.error) {
      console.log("[CRON] Step 1 failed:", step1.error)
      return { error: "Step 1 failed: " + step1.error }
    }
    console.log("[CRON] Step 1 completed successfully")

    // Step 2: Get classifies
    console.log("[CRON] Step 2: Getting classifies...")
    const step2 = await this.getClassifies()
    if (step2.error) {
      console.log("[CRON] Step 2 failed:", step2.error)
      return { error: "Step 2 failed: " + step2.error }
    }
    console.log("[CRON] Step 2 completed successfully")

    // Step 3: Get places
    console.log("[CRON] Step 3: Getting places...")
    const step3 = await this.getPlaces()
    if (step3.error) {
      console.log("[CRON] Step 3 failed:", step3.error)
      return { error: "Step 3 failed: " + step3.error }
    }
    console.log("[CRON] Step 3 completed successfully")

    // Step 4: Trigger ticket info (non-blocking for performance)
    console.log("[CRON] Step 4: Triggering ticket info (non-blocking)...")
    this.getTicketInfo()
      .then((result) => {
        if (result.error) {
          console.log("[CRON] Step 4 failed (async):", result.error)
        } else {
          console.log("[CRON] Step 4 completed successfully (async)")
        }
      })
      .catch((error) => {
        console.log("[CRON] Step 4 error (async):", error)
      })

    // Step 5: Make booking (parallel with ticket info for performance)
    console.log("[CRON] Step 5: Making booking (parallel with ticket info)...")
    const result = await this.makeBooking()
    console.log("[CRON] Final booking result:", result)
    return result
  }
}

class TennisBookingAutomation {
  // Get existing token (no login to avoid token expiration)
  private async getExistingToken(): Promise<string | null> {
    try {
      console.log('[CRON] Token:', process.env.VINHOMES_TOKEN)
      return process.env.VINHOMES_TOKEN as string
    } catch (error) {
      console.error('[CRON] ❌ Error getting existing token:', error)
      return null
    }
  }

  // Trigger the actual booking flow (exactly like manual buttons 1 and 2) - PRECISE TIMING
  private async triggerBookingFlow(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Book both cards SIMULTANEOUSLY at exact 8:30:00 AM using full booking flow
      const [booking1Result, booking2Result] = await Promise.all([
        // Card 1: S1.01 18h-20h (placeId: 801, placeUtilityId: 625, timeConstraintId: 575)
        this.executeFullBookingFlow(token, 801, 625, 575, 'S1.01'),
        
        // Card 2: S1.02 18h-20h (placeId: 802, placeUtilityId: 626, timeConstraintId: 575)
        this.executeFullBookingFlow(token, 802, 626, 575, 'S1.02')
      ])
            
      // Return success if at least one booking succeeded
      const overallSuccess = booking1Result.success || booking2Result.success
      const errorMessage = !overallSuccess ? 'Both bookings failed' : undefined
      
      return { success: overallSuccess, error: errorMessage }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Execute full booking flow using VinhomesTennisBooking class
  private async executeFullBookingFlow(
    token: string, 
    placeId: number, 
    placeUtilityId: number, 
    timeConstraintId: number, 
    courtName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[CRON] Starting full booking flow for ${courtName} at ${getVietnamTime().toISOString()}`)
      
      const booking = new VinhomesTennisBooking(placeId, placeUtilityId, timeConstraintId, token)
      const result = await booking.executeBookingFlow()
      
      if (result.error) {
        console.log(`[CRON] ${courtName} booking FAILED: ${result.error}`)
        return { success: false, error: result.error }
      }
      
      console.log(`[CRON] ${courtName} booking SUCCESS at ${getVietnamTime().toISOString()}`)
      return { success: true }
    } catch (error) {
      console.log(`[CRON] ${courtName} booking ERROR: ${error}`)
      return { success: false, error: String(error) }
    }
  }


  // Main automation method - Focus on PRECISE 8:30 AM booking only (using existing token)
  async runAutomation(): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('[CRON] Starting PRECISE 8:30 AM tennis booking...')
      
      // Get existing token (no login to avoid token expiration)
      const token = await this.getExistingToken()
      if (!token) {
        return { 
          success: false, 
          message: 'No valid token available - please login manually first', 
          error: 'No token found' 
        }
      }

      // MAXIMUM SPEED: Start booking immediately - no waiting, no delays
      const now = getVietnamTime()
      console.log(`[CRON] MAXIMUM SPEED: Starting booking IMMEDIATELY at ${now.toISOString()}`)
      console.log(`[CRON] MAXIMUM SPEED: Racing for slots - every millisecond counts!`)

      // Trigger booking with retry logic
      const bookingResult = await this.triggerBookingFlowWithRetry(token)
      if (!bookingResult.success) {
        return { 
          success: false, 
          message: 'Booking failed after all retries', 
          error: bookingResult.error 
        }
      }

      return { 
        success: true, 
        message: 'PRECISE 8:30 AM tennis booking completed successfully' 
      }
    } catch (error) {
      console.error('[CRON] Automation error:', error)
      return { 
        success: false, 
        message: 'Automation failed', 
        error: String(error) 
      }
    }
  }

  // MAXIMUM SPEED booking flow with fast retry logic
  private async triggerBookingFlowWithRetry(token: string, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[CRON] MAXIMUM SPEED: Attempt ${attempt}/${maxRetries} at ${getVietnamTime().toISOString()}`)
        
        const result = await this.triggerBookingFlow(token)
        
        if (result.success) {
          console.log(`[CRON] MAXIMUM SPEED: SUCCESS on attempt ${attempt}`)
          return result
        }
        
        console.log(`[CRON] MAXIMUM SPEED: FAILED on attempt ${attempt}: ${result.error}`)
        
        // If not the last attempt, retry IMMEDIATELY (no delay)
        if (attempt < maxRetries) {
          console.log(`[CRON] MAXIMUM SPEED: Retrying IMMEDIATELY - no delay!`)
        }
      } catch (error) {
        console.error(`[CRON] MAXIMUM SPEED: Error on attempt ${attempt}:`, error)
        if (attempt === maxRetries) {
          return { success: false, error: String(error) }
        }
      }
    }
    
    return { success: false, error: 'All retry attempts failed' }
  }

}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const vietnamTime = getVietnamTime()
    console.log(`[GITHUB-ACTIONS-CRON] 🎾 Tennis booking triggered at ${vietnamTime.toISOString()} (Vietnam time)`)
    console.log('[GITHUB-ACTIONS-CRON] 🚀 Source: GitHub Actions workflow')
    console.log('[GITHUB-ACTIONS-CRON] 🎯 Target: Simultaneous booking for S1.01 and S1.02 (18h-20h)')
    
    console.log('[GITHUB-ACTIONS-CRON] 🔄 Starting automation...')
    const automation = new TennisBookingAutomation()
    const result = await automation.runAutomation()
    
    console.log(`[GITHUB-ACTIONS-CRON] 📊 Final Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`[GITHUB-ACTIONS-CRON] 💬 Message: ${result.message}`)
    if (result.error) {
      console.log(`[GITHUB-ACTIONS-CRON] ⚠️  Error Details: ${result.error}`)
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: vietnamTime.toISOString(),
      source: 'GitHub Actions',
      timezone: 'Asia/Ho_Chi_Minh'
    })
  } catch (error) {
    console.error('[GITHUB-ACTIONS-CRON] ❌ Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed',
        error: String(error),
        timestamp: new Date().toISOString(),
        source: 'GitHub Actions'
      },
      { status: 500 }
    )
  }
}
