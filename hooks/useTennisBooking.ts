// React Hook for Client-Side Tennis Booking
// Uses user's Vietnam IP automatically - no server costs!

import { useState, useCallback } from 'react'
import { executeClientBooking } from '@/lib/client-tennis-booking'

interface BookingParams {
  placeId?: number
  placeUtilityId?: number  
  timeConstraintId?: number
}

interface BookingState {
  loading: boolean
  success: boolean
  error: string | null
  data: any
}

interface UseTennisBookingReturn {
  bookingState: BookingState
  bookTennis: (jwtToken: string, params?: BookingParams) => Promise<void>
  reset: () => void
}

export function useTennisBooking(): UseTennisBookingReturn {
  const [bookingState, setBookingState] = useState<BookingState>({
    loading: false,
    success: false,
    error: null,
    data: null
  })
  
  const bookTennis = useCallback(async (jwtToken: string, params?: BookingParams) => {
    setBookingState({
      loading: true,
      success: false,
      error: null,
      data: null
    })

    try {
      
      const result = await executeClientBooking(jwtToken, params)
      
      if (result.success) {
        setBookingState({
          loading: false,
          success: true,
          error: null,
          data: result.data
        })
        console.log('✅ Tennis booking successful!', result.data)
      } else {
        setBookingState({
          loading: false,
          success: false,
          error: result.error || 'Booking failed',
          data: result.data
        })
        console.error('❌ Tennis booking failed:', result.error)
      }
    } catch (error) {
      setBookingState({
        loading: false,
        success: false,
        error: String(error),
        data: null
      })
      console.error('❌ Tennis booking error:', error)
    }
  }, [])

  const reset = useCallback(() => {
    setBookingState({
      loading: false,
      success: false,
      error: null,
      data: null
    })
  }, [])

  return {
    bookingState,
    bookTennis,
    reset
  }
}

// Example usage:
/*
import { useTennisBooking } from '@/hooks/useTennisBooking'

function BookingComponent() {
  const { bookingState, bookTennis, reset } = useTennisBooking()
  
  const handleBook = async () => {
    await bookTennis('your-jwt-token', {
      placeId: 801,
      placeUtilityId: 625,
      timeConstraintId: 575
    })
  }

  return (
    <div>
      <button onClick={handleBook} disabled={bookingState.loading}>
        {bookingState.loading ? 'Booking...' : 'Book Tennis'}
      </button>
      
      {bookingState.success && <p>✅ Booking successful!</p>}
      {bookingState.error && <p>❌ Error: {bookingState.error}</p>}
    </div>
  )
}
*/
