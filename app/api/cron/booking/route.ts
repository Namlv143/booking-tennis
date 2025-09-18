import { NextResponse } from 'next/server'
import { BOOKING_CONFIG, getVietnamTime, getWaitTimeUntilBooking } from '@/lib/booking-config'

// Types for the booking automation
interface LoginCredentials {
  username: string
  password: string
}

interface BookingData {
  courtId: string
  date: string
  timeSlot: string
}

class TennisBookingAutomation {
  private static readonly LOGIN_CREDENTIALS: LoginCredentials = {
    username: '0979251496',
    password: 'Nam@2025'
  }
  private static readonly BASE_URL = 'https://vh.vinhomes.vn'

  // Step 1: Logout and login with credentials (exactly like manual login)
  private async performLogin(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      console.log('[CRON] Starting login process...')
      
      // First, logout if there's an existing session
      await this.logout()
      
      // Login using the same API as manual login
      const loginUrl = `${TennisBookingAutomation.BASE_URL}/api/vhr/iam/v0/security/oauth-login`
      const loginData = {
        username: TennisBookingAutomation.LOGIN_CREDENTIALS.username,
        password: TennisBookingAutomation.LOGIN_CREDENTIALS.password
      }

      const response = await fetch(loginUrl, {
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
        },
        body: JSON.stringify(loginData),
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[CRON] Login failed:', response.status, errorText)
        return { success: false, error: `Login failed: ${response.status}` }
      }

      const loginResult = await response.json()
      const token = loginResult.data?.accessToken

      if (!token) {
        console.error('[CRON] No token received from login')
        return { success: false, error: 'No token received' }
      }

      console.log('[CRON] Login successful, token received')
      return { success: true, token }
    } catch (error) {
      console.error('[CRON] Login error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Step 2: Logout from existing session
  private async logout(): Promise<void> {
    try {
      console.log('[CRON] Logging out from existing session...')
      // Implementation for logout if needed
      // This might involve clearing cookies or calling a logout endpoint
    } catch (error) {
      console.log('[CRON] Logout error (non-critical):', error)
    }
  }

  // Step 3: Get utilities after login (exactly like handleGetUtility)
  private async getUtilities(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('[CRON] Getting utilities...')
      
      const utilitiesUrl = `${TennisBookingAutomation.BASE_URL}/api/vhr/utility/v0/utility`
      const response = await fetch(utilitiesUrl, {
        method: 'GET',
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
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[CRON] Utilities API failed:', response.status, errorText)
        return { success: false, error: `Utilities API failed: ${response.status}` }
      }

      const utilitiesData = await response.json()
      console.log('[CRON] Utilities retrieved successfully')
      return { success: true, data: utilitiesData }
    } catch (error) {
      console.error('[CRON] Utilities error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Step 4: Wait for precise timing (8:30 AM) and trigger booking
  private async waitAndTriggerBooking(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[CRON] Waiting for 8:30 AM precise timing...')
      
      // Use the configuration helper to calculate wait time
      const waitTime = getWaitTimeUntilBooking()
      
      if (waitTime > 0) {
        console.log(`[CRON] Waiting ${Math.round(waitTime / 1000)} seconds until 8:30 AM...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      
      console.log('[CRON] 8:30 AM reached! Triggering booking flow...')
      
      // Trigger the booking flow here
      const bookingResult = await this.triggerBookingFlow(token)
      
      return bookingResult
    } catch (error) {
      console.error('[CRON] Wait and trigger error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Step 5: Trigger the actual booking flow (exactly like manual buttons 1 and 2)
  private async triggerBookingFlow(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[CRON] Triggering booking flow for cards 1 and 2...')
      
      // Book Card 1: S1.01 18h-20h (placeId: 801, placeUtilityId: 625, timeConstraintId: 575)
      console.log('[CRON] Booking Card 1: S1.01 18h-20h...')
      const booking1Result = await this.makeBookingRequest(token, {
        placeId: 801,
        placeUtilityId: 625,
        timeConstraintId: 575
      })
      
      if (booking1Result.success) {
        console.log('[CRON] Card 1 booking successful!')
      } else {
        console.error('[CRON] Card 1 booking failed:', booking1Result.error)
      }
      
      // Book Card 2: S1.02 18h-20h (placeId: 802, placeUtilityId: 626, timeConstraintId: 575)
      console.log('[CRON] Booking Card 2: S1.02 18h-20h...')
      const booking2Result = await this.makeBookingRequest(token, {
        placeId: 802,
        placeUtilityId: 626,
        timeConstraintId: 575
      })
      
      if (booking2Result.success) {
        console.log('[CRON] Card 2 booking successful!')
      } else {
        console.error('[CRON] Card 2 booking failed:', booking2Result.error)
      }
      
      // Return success if at least one booking succeeded
      const overallSuccess = booking1Result.success || booking2Result.success
      const errorMessage = !overallSuccess ? 'Both bookings failed' : undefined
      
      console.log(`[CRON] Booking flow completed. Success: ${overallSuccess}`)
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

  // Main automation method
  async runAutomation(): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('[CRON] Starting tennis booking automation...')
      
      // Step 1: Login at 8:25 AM
      const loginResult = await this.performLogin()
      if (!loginResult.success || !loginResult.token) {
        return { 
          success: false, 
          message: 'Login failed', 
          error: loginResult.error 
        }
      }

      // Step 2: Wait until 8:27 AM and get utilities
      const utilitiesResult = await this.waitAndGetUtilities(loginResult.token)
      if (!utilitiesResult.success) {
        return { 
          success: false, 
          message: 'Failed to get utilities', 
          error: utilitiesResult.error 
        }
      }

      // Step 3: Wait for 8:30 AM and trigger booking
      const bookingResult = await this.waitAndTriggerBooking(loginResult.token)
      if (!bookingResult.success) {
        return { 
          success: false, 
          message: 'Booking flow failed', 
          error: bookingResult.error 
        }
      }

      return { 
        success: true, 
        message: 'Tennis booking automation completed successfully' 
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

  // Step 2: Wait until 8:27 AM and get utilities
  private async waitAndGetUtilities(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('[CRON] Waiting for 8:27 AM to call utilities...')
      
      // Calculate time until 8:27 AM
      const now = getVietnamTime()
      const targetTime = new Date(now)
      targetTime.setHours(8, 27, 0, 0) // 8:27 AM
      
      // If it's already past 8:27 AM, schedule for next day
      if (now >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1)
      }
      
      const waitTime = targetTime.getTime() - now.getTime()
      
      if (waitTime > 0) {
        console.log(`[CRON] Waiting ${Math.round(waitTime / 1000)} seconds until 8:27 AM...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      
      console.log('[CRON] 8:27 AM reached! Calling utilities...')
      
      // Now call utilities
      return await this.getUtilities(token)
    } catch (error) {
      console.error('[CRON] Wait and get utilities error:', error)
      return { success: false, error: String(error) }
    }
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[CRON] Tennis booking cron job triggered')
    
    const automation = new TennisBookingAutomation()
    const result = await automation.runAutomation()
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[CRON] Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed',
        error: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
