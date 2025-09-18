// Tennis booking automation configuration
export const BOOKING_CONFIG = {
  // Login credentials
  credentials: {
    phone: '0979251496',
    password: 'Nam@2025'
  },
  
  // Timing configuration
  timing: {
    // Cron schedule: 8:25 AM every day
    cronSchedule: '25 8 * * *',
    // Target booking time: 8:30 AM
    targetBookingTime: {
      hour: 8,
      minute: 30
    }
  },
  
  // API endpoints
  api: {
    baseUrl: 'https://vh.vinhomes.vn',
    login: '/api/vhr/auth/login',
    utilities: '/api/vhr/utility/v0/utility',
    booking: '/api/vhr/booking' // Update with actual booking endpoint
  },
  
  // Headers for API requests
  headers: {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
    'Accept-Language': 'vi',
    'App-Version-Name': '1.5.5',
    'Content-Type': 'application/json; charset=UTF-8',
    'Device-ID': '51a9e0d3fcb8574c',
    'Device-Inf': 'PHY110 OPPO 35',
    'Host': 'vh.vinhomes.vn',
    'User-Agent': 'Dart/3.7 (dart:io)'
  },
  
  // Booking preferences (update these based on your needs)
  bookingPreferences: {
    // Preferred court ID (update with actual court ID)
    preferredCourtId: 'court_1',
    // Preferred time slots (update with actual time slots)
    preferredTimeSlots: ['08:30', '09:00', '09:30'],
    // Booking duration in minutes
    duration: 60,
    // Retry attempts if booking fails
    maxRetries: 3
  }
} as const

// Timezone configuration (Vietnam timezone)
export const TIMEZONE = 'Asia/Ho_Chi_Minh'

// Helper function to get current time in Vietnam timezone
export function getVietnamTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

// Helper function to check if it's time for booking
export function isBookingTime(): boolean {
  const now = getVietnamTime()
  const targetHour = BOOKING_CONFIG.timing.targetBookingTime.hour
  const targetMinute = BOOKING_CONFIG.timing.targetBookingTime.minute
  
  return now.getHours() === targetHour && now.getMinutes() === targetMinute
}

// Helper function to calculate wait time until target booking time
export function getWaitTimeUntilBooking(): number {
  const now = getVietnamTime()
  const target = new Date(now)
  target.setHours(
    BOOKING_CONFIG.timing.targetBookingTime.hour,
    BOOKING_CONFIG.timing.targetBookingTime.minute,
    0,
    0
  )
  
  // If target time has passed today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1)
  }
  
  return target.getTime() - now.getTime()
}
