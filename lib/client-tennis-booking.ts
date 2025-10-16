// Client-Side Tennis Booking Service
// Runs in browser with user's Vietnam IP - bypasses geographic detection!

import crypto from 'crypto-js'

// Types for better type safety
interface BookingRequest {
  bookingDate: number
  placeId: number
  timeConstraintId: number
  utilityId: number
  residentTicket: number
  residentChildTicket?: number | null
  guestTicket?: number | null
  guestChildTicket?: number | null
}

interface BookingData {
  bookingRequests: BookingRequest[]
  paymentMethod?: string | null
  vinClubPoint?: number | null
  deviceType: string
  cs?: string
}

interface TennisBookingResponse {
  data?: any
  error?: string
  success?: boolean
}

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn"
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"

// Pre-configured constants for maximum speed
const UTILITY_ID = 75
const CLASSIFY_ID = 118
const DEFAULT_PLACE_ID = 801
const DEFAULT_PLACE_UTILITY_ID = 625
const DEFAULT_TIME_CONSTRAINT_ID = 575

// Pre-computed time constants
const VIETNAM_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Ultra-fast headers - will use user's Vietnam IP automatically
function getHeaders(method: string = 'GET', jwtToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    'user-agent': 'Dart/3.7 (dart:io)',
    'app-version-name': '1.5.5',
    'device-inf': 'PHY110 OPPO 35',
    'accept-language': 'vi',
    'device-id': '51a9e0d3fcb8574c',
    'host': 'vh.vinhomes.vn',
    'content-type': 'application/json; charset=UTF-8',
    'x-vinhome-token': jwtToken
  }

  if (method === 'POST') {
    headers['Connection'] = 'keep-alive'
    headers['accept-encoding'] = 'gzip deflate br'
  } else {
    headers['accept-encoding'] = 'gzip'
  }

  return headers
}

// Ultra-fast date functions
function getBookingDate(): number {
  return Date.now() + VIETNAM_OFFSET + ONE_DAY
}

function generateFromTime(): number {
  const now = Date.now()
  const vietnamNow = now + VIETNAM_OFFSET
  const tomorrow = vietnamNow + ONE_DAY
  
  const tomorrowDate = new Date(tomorrow)
  tomorrowDate.setHours(18, 0, 0, 0)
  
  return tomorrowDate.getTime()
}

function generateChecksum(bookingData: BookingData): string {
  const booking = bookingData.bookingRequests[0]
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
  const interpolatedString = `${numericSum}${SECRET_KEY}`
  
  return crypto.SHA256(interpolatedString).toString()
}

// Client-side HTTP request function
async function makeClientRequest(method: string, endpoint: string, jwtToken: string, data?: any, params?: Record<string, string>): Promise<any> {
  let url = `${BASE_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const headers = getHeaders(method, jwtToken)

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      mode: 'cors', // Enable CORS
      cache: 'no-store',
      credentials: 'omit',
    }

    if (method === 'POST' && data) {
      fetchOptions.body = JSON.stringify(data)
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      const errorText = await response.text()
      return { error: `HTTP ${response.status}`, api_response: errorText }
    }

    return await response.json()

  } catch (error) {
    return { error: String(error) }
  }
}

// // Step 1: Get time slots (skip API call for speed)
// async function getTimeSlots(): Promise<TennisBookingResponse> {
//   return { success: true }
// }

// Step 2: Get places
async function getPlaces(fromTime: number, timeConstraintId: number, jwtToken: string): Promise<TennisBookingResponse> {
  const params = {
    classifyId: CLASSIFY_ID.toString(),
    fromTime: fromTime.toString(),
    timeConstraintId: timeConstraintId.toString(),
    monthlyTicket: 'false'
  }
  
  const endpoint = `/api/vhr/utility/v0/utility/${UTILITY_ID}/places`
  const result = await makeClientRequest('GET', endpoint, jwtToken, undefined, params)
  
  return { success: !result.error, data: result, error: result.error }
}

// Step 3: Get ticket info
async function getTicketInfo(bookingDate: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string): Promise<TennisBookingResponse> {
  const params = {
    bookingDate: bookingDate.toString(),
    placeUtilityId: placeUtilityId.toString(),
    timeConstraintId: timeConstraintId.toString()
  }
  
  const endpoint = "/api/vhr/utility/v0/utility/ticket-info"
  const result = await makeClientRequest('GET', endpoint, jwtToken, undefined, params)
  
  return { success: !result.error, data: result, error: result.error }
}

// Pre-computed templates for speed
const BOOKING_TEMPLATE = {
  paymentMethod: null,
  vinClubPoint: null,
  deviceType: "ANDROID"
}

const BOOKING_REQUEST_BASE = {
  utilityId: UTILITY_ID,
  residentTicket: 4,
  residentChildTicket: null,
  guestTicket: null,
  guestChildTicket: null
}

// Step 4: Make booking
async function makeBooking(bookingDate: number, placeId: number, timeConstraintId: number, jwtToken: string): Promise<TennisBookingResponse> {
  const bookingData: BookingData = {
    bookingRequests: [{
      ...BOOKING_REQUEST_BASE,
      bookingDate: bookingDate,
      placeId: placeId,
      timeConstraintId: timeConstraintId
    }],
    ...BOOKING_TEMPLATE
  }

  bookingData.cs = generateChecksum(bookingData)

  const endpoint = "/api/vhr/utility/v0/customer-utility/booking"
  const result = await makeClientRequest('POST', endpoint, jwtToken, bookingData)
  return { success: !result.error, data: result, error: result.error }
}

// Main client-side booking function
export async function executeClientBooking(
  jwtToken: string, 
  bookingParams?: { placeId?: number, placeUtilityId?: number, timeConstraintId?: number }
): Promise<TennisBookingResponse> {
  try {
    const bookingDate = getBookingDate()
    const fromTime = generateFromTime()
    
    // Use provided params or defaults
    const placeId = bookingParams?.placeId || DEFAULT_PLACE_ID
    const placeUtilityId = bookingParams?.placeUtilityId || DEFAULT_PLACE_UTILITY_ID
    const timeConstraintId = bookingParams?.timeConstraintId || DEFAULT_TIME_CONSTRAINT_ID

    // Parallel execution for maximum speed
    const placesResult = await getPlaces(fromTime, timeConstraintId, jwtToken)

    // if (timeSlotsResult.error) {
    //   return { error: "Step 1 (get_time_slots) failed", data: timeSlotsResult }
    // }

    if (placesResult.error) {
      return { error: "Step 3 (get_places) failed", data: placesResult }
    }

    // Get ticket info
    const ticketInfoResult = await getTicketInfo(bookingDate, placeUtilityId, timeConstraintId, jwtToken)
    if (ticketInfoResult.error) {
      return { error: "Step 4 (get_ticket_info) failed", data: ticketInfoResult }
    }

    // Make final booking
    const bookingResult = await makeBooking(bookingDate, placeId, timeConstraintId, jwtToken)
    
    return bookingResult

  } catch (error) {
    return { error: String(error), success: false }
  }
}

// Export for easy usage
const clientTennisBooking = {
  executeClientBooking,
  getPlaces,
  getTicketInfo,
  makeBooking
}

export default clientTennisBooking
