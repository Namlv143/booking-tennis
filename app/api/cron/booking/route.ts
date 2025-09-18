import { NextResponse } from 'next/server'
import { getVietnamTime } from '@/lib/booking-config'

// Types for the booking automation
interface BookingData {
  courtId: string
  date: string
  timeSlot: string
}

class TennisBookingAutomation {
  private static readonly BASE_URL = 'https://vh.vinhomes.vn'

  // Get existing token (no login to avoid token expiration)
  private async getExistingToken(): Promise<string | null> {
    try {
      console.log('[CRON] Getting existing token...')
      
      // For automated booking, we need a valid token that was obtained manually
      // This should be set as an environment variable or stored securely
      const storedToken = process.env.VINHOMES_TOKEN
      
      if (!storedToken) {
        console.log('[CRON] No stored token found - please set VINHOMES_TOKEN environment variable')
        return null
      }

      console.log('[CRON] Using stored token for booking')
      return storedToken
    } catch (error) {
      console.error('[CRON] Error getting existing token:', error)
      return null
    }
  }




  // Trigger the actual booking flow (exactly like manual buttons 1 and 2) - PRECISE TIMING
  private async triggerBookingFlow(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const startTime = getVietnamTime()
      console.log(`[CRON] PRECISE TIMING: Starting booking flow at ${startTime.toISOString()}`)
      console.log('[CRON] Triggering SIMULTANEOUS booking for cards 1 and 2...')
      
      // Book both cards SIMULTANEOUSLY at exact 8:30:00 AM
      const [booking1Result, booking2Result] = await Promise.all([
        // Card 1: S1.01 18h-20h (placeId: 801, placeUtilityId: 625, timeConstraintId: 575)
        this.makeBookingRequest(token, {
          placeId: 801,
          placeUtilityId: 625,
          timeConstraintId: 575
        }).then(result => {
          console.log(`[CRON] Card 1 (S1.01) ${result.success ? 'SUCCESS' : 'FAILED'} at ${getVietnamTime().toISOString()}`)
          return result
        }),
        
        // Card 2: S1.02 18h-20h (placeId: 802, placeUtilityId: 626, timeConstraintId: 575)
        this.makeBookingRequest(token, {
          placeId: 802,
          placeUtilityId: 626,
          timeConstraintId: 575
        }).then(result => {
          console.log(`[CRON] Card 2 (S1.02) ${result.success ? 'SUCCESS' : 'FAILED'} at ${getVietnamTime().toISOString()}`)
          return result
        })
      ])
      
      const endTime = getVietnamTime()
      const duration = endTime.getTime() - startTime.getTime()
      
      console.log(`[CRON] PRECISE TIMING: Both bookings completed in ${duration}ms`)
      console.log(`[CRON] Card 1 result: ${booking1Result.success ? 'SUCCESS' : 'FAILED'}`)
      console.log(`[CRON] Card 2 result: ${booking2Result.success ? 'SUCCESS' : 'FAILED'}`)
      
      // Return success if at least one booking succeeded
      const overallSuccess = booking1Result.success || booking2Result.success
      const errorMessage = !overallSuccess ? 'Both bookings failed' : undefined
      
      console.log(`[CRON] PRECISE TIMING: Overall booking result: ${overallSuccess ? 'SUCCESS' : 'FAILED'}`)
      return { success: overallSuccess, error: errorMessage }
    } catch (error) {
      console.error('[CRON] Booking flow error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Helper method to make individual booking requests
  private async makeBookingRequest(token: string, bookingParams: {
    placeId: number
    placeUtilityId: number
    timeConstraintId: number
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const response = await fetch(`${TennisBookingAutomation.BASE_URL}/api/vhr/utility/v0/customer-utility/booking`, {
        method: 'POST',
        headers: {
          'accept-encoding': 'gzip',
          'accept-language': 'vi',
          'app-version-name': '1.5.5',
          'content-type': 'application/json; charset=UTF-8',
          'device-id': '51a9e0d3fcb8574c',
          'device-inf': 'PHY110 OPPO 35',
          'host': 'vh.vinhomes.vn',
          'user-agent': 'Dart/3.7 (dart:io)',
          'x-vinhome-token': token
        },
        body: JSON.stringify({
          bookingRequests: [{
            bookingDate: this.getBookingDate(),
            placeId: bookingParams.placeId,
            timeConstraintId: bookingParams.timeConstraintId,
            utilityId: 75,
            residentTicket: 4,
            residentChildTicket: null,
            guestTicket: null,
            guestChildTicket: null,
          }],
          paymentMethod: null,
          vinClubPoint: null,
          deviceType: 'ANDROID',
          cs: await this.generateChecksum({
            bookingRequests: [{
              bookingDate: this.getBookingDate(),
              placeId: bookingParams.placeId,
              timeConstraintId: bookingParams.timeConstraintId,
              utilityId: 75,
              residentTicket: 4,
              residentChildTicket: null,
              guestTicket: null,
              guestChildTicket: null,
            }],
            paymentMethod: null,
            vinClubPoint: null,
            deviceType: 'ANDROID'
          })
        }),
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: `HTTP ${response.status}: ${errorText}` }
      }

      const result = await response.json()
      const success = result?.data?.transactionId || result?.data?.userId
      
      return { success: !!success, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Helper method to get booking date (tomorrow)
  private getBookingDate(): number {
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // UTC+7
    const bookingDate = new Date(vietnamTime.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
    return bookingDate.getTime()
  }

  // Helper method to generate checksum
  private async generateChecksum(bookingData: any): Promise<string> {
    const booking = bookingData.bookingRequests[0]
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
    const secretKey = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
    const interpolatedString = `${numericSum}${secretKey}`

    const encoder = new TextEncoder()
    const data = encoder.encode(interpolatedString)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
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

      // PRECISE TIMING: Wait until exactly 8:30:00 AM Vietnam time
      const now = getVietnamTime()
      const targetTime = new Date(now)
      targetTime.setHours(8, 30, 0, 0) // Exactly 8:30:00.000 AM
      
      if (now < targetTime) {
        const waitTime = targetTime.getTime() - now.getTime()
        console.log(`[CRON] PRECISE TIMING: Waiting ${waitTime}ms to reach exactly 8:30:00 AM`)
        console.log(`[CRON] Current time: ${now.toISOString()}`)
        console.log(`[CRON] Target time: ${targetTime.toISOString()}`)
        
        // Wait until exactly 8:30:00 AM
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        const afterWait = getVietnamTime()
        console.log(`[CRON] PRECISE TIMING: Reached target time at ${afterWait.toISOString()}`)
      } else if (now > targetTime) {
        console.log(`[CRON] PRECISE TIMING: Already past 8:30:00 AM (${now.toISOString()}) - proceeding immediately`)
      } else {
        console.log(`[CRON] PRECISE TIMING: Exactly at 8:30:00 AM - proceeding immediately`)
      }

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

  // Enhanced booking flow with retry logic
  private async triggerBookingFlowWithRetry(token: string, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[CRON] PRECISE TIMING: Attempt ${attempt}/${maxRetries} at ${getVietnamTime().toISOString()}`)
        
        const result = await this.triggerBookingFlow(token)
        
        if (result.success) {
          console.log(`[CRON] PRECISE TIMING: SUCCESS on attempt ${attempt}`)
          return result
        }
        
        console.log(`[CRON] PRECISE TIMING: FAILED on attempt ${attempt}: ${result.error}`)
        
        // If not the last attempt, wait before retry
        if (attempt < maxRetries) {
          const retryDelay = attempt * 1000 // 1s, 2s, 3s delays
          console.log(`[CRON] PRECISE TIMING: Waiting ${retryDelay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      } catch (error) {
        console.error(`[CRON] PRECISE TIMING: Error on attempt ${attempt}:`, error)
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
    console.log(`[GITHUB-ACTIONS-CRON] Tennis booking triggered at ${vietnamTime.toISOString()} (Vietnam time)`)
    console.log('[GITHUB-ACTIONS-CRON] Source: GitHub Actions workflow')
    
    const automation = new TennisBookingAutomation()
    const result = await automation.runAutomation()
    
    console.log(`[GITHUB-ACTIONS-CRON] Result: ${result.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`[GITHUB-ACTIONS-CRON] Message: ${result.message}`)
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: vietnamTime.toISOString(),
      source: 'GitHub Actions',
      timezone: 'Asia/Ho_Chi_Minh'
    })
  } catch (error) {
    console.error('[GITHUB-ACTIONS-CRON] Cron job error:', error)
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
