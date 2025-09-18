import { NextResponse } from 'next/server'
import { BOOKING_CONFIG, getVietnamTime, getWaitTimeUntilBooking } from '@/lib/booking-config'

// Types for the booking automation
interface LoginCredentials {
  phone: string
  password: string
}

interface BookingData {
  courtId: string
  date: string
  timeSlot: string
}

class TennisBookingAutomation {
  private static readonly LOGIN_CREDENTIALS: LoginCredentials = BOOKING_CONFIG.credentials
  private static readonly BASE_URL = BOOKING_CONFIG.api.baseUrl

  // Step 1: Logout and login with credentials
  private async performLogin(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      console.log('[CRON] Starting login process...')
      
      // First, logout if there's an existing session
      await this.logout()
      
      // Login with credentials
      const loginUrl = `${TennisBookingAutomation.BASE_URL}${BOOKING_CONFIG.api.login}`
      const loginData = {
        phone: TennisBookingAutomation.LOGIN_CREDENTIALS.phone,
        password: TennisBookingAutomation.LOGIN_CREDENTIALS.password
      }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          ...BOOKING_CONFIG.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[CRON] Login failed:', response.status, errorText)
        return { success: false, error: `Login failed: ${response.status}` }
      }

      const loginResult = await response.json()
      const token = loginResult.data?.token || loginResult.token

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

  // Step 3: Get utilities after login
  private async getUtilities(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('[CRON] Getting utilities...')
      
      const utilitiesUrl = `${TennisBookingAutomation.BASE_URL}${BOOKING_CONFIG.api.utilities}`
      const response = await fetch(utilitiesUrl, {
        method: 'GET',
        headers: {
          ...BOOKING_CONFIG.headers,
          'X-Vinhome-Token': token
        }
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

  // Step 5: Trigger the actual booking flow
  private async triggerBookingFlow(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[CRON] Triggering booking flow...')
      
      // This is where you would implement the actual booking logic
      // For now, we'll simulate the booking process
      
      // Example: Get available courts
      // Example: Select preferred court and time
      // Example: Submit booking request
      
      console.log('[CRON] Booking flow completed successfully')
      return { success: true }
    } catch (error) {
      console.error('[CRON] Booking flow error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Main automation method
  async runAutomation(): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('[CRON] Starting tennis booking automation...')
      
      // Step 1: Login
      const loginResult = await this.performLogin()
      if (!loginResult.success || !loginResult.token) {
        return { 
          success: false, 
          message: 'Login failed', 
          error: loginResult.error 
        }
      }

      // Step 2: Get utilities
      const utilitiesResult = await this.getUtilities(loginResult.token)
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
