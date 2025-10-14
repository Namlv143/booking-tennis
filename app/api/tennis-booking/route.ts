import { NextResponse } from "next/server"
import crypto from "crypto"
import axios, { AxiosError, AxiosInstance } from "axios"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn"
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
const UTILITY_ID = 75
const CLASSIFY_ID = 118
const randomDelay = (min: any, max: any) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(ms, 'sdfsdf')
  return new Promise(resolve => setTimeout(resolve, ms));
};
// Optimized axios instance with connection pooling and timeouts
const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'user-agent': 'Dart/3.9 (dart:io)',
    'app-version-name': '1.5.6',
    'device-inf': 'PHY110 OPPO 35',
    'accept-language': 'vi',
    'device-id': '51a9e0d3fcb8574c',
    'host': 'vh.vinhomes.vn',
    'content-type': 'application/json; charset=UTF-8'
  },
  // Connection pooling for better performance
  maxRedirects: 3,
  validateStatus: (status) => status < 500 // Don't throw on 4xx errors
})

// Pre-computed constants for better performance
const ONE_DAY_MS = 86400000
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

// Optimized headers generation - reuse objects for better performance
const getMethodSpecificHeaders = (method: string): Record<string, string> => {
  if (method === 'POST') {
    return {
      'Connection': 'keep-alive',
      'accept-encoding': 'gzip deflate br'
    }
  }
  return {
    'accept-encoding': 'gzip'
  }
}

function getHeaders(method: string = 'GET', jwtToken: string): Record<string, string> {
  return {
    'x-vinhome-token': jwtToken,
    ...getMethodSpecificHeaders(method)
  }
}

// Optimized date functions using pre-computed constants
function getBookingDate(): number {
  return Date.now() + ONE_DAY_MS
}

function generateFromTime(bookingHour: number): number {
  const tomorrow = Date.now() + ONE_DAY_MS
  const tomorrowDate = new Date(tomorrow)
  tomorrowDate.setHours(bookingHour, 0, 0, 0)
  return tomorrowDate.getTime()
}

// Optimized checksum generation - avoid string interpolation for better performance
function generateChecksum(bookingData: BookingData): string {
  const booking = bookingData.bookingRequests[0]
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
  
  // Create hash directly from concatenated values for better performance
  const hash = crypto.createHash('sha256')
  hash.update(numericSum.toString())
  hash.update(SECRET_KEY)
  
  return hash.digest('hex')
}

// Pre-defined error response objects for better performance
const ERROR_RESPONSES = {
  NO_RESPONSE: { error: 'No response from server' },
  UNKNOWN: { error: 'Unknown error occurred' }
} as const

// Optimized server-side HTTP request function using pre-configured axios instance
async function makeServerRequest(method: string, endpoint: string, jwtToken: string, data?: any, params?: Record<string, any>): Promise<any> {
  const headers = getHeaders(method, jwtToken)

  try {
    const response = await httpClient({
      method,
      url: endpoint, // Using relative URL since baseURL is configured
      headers,
      data,
      params,
    })
    return response.data

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        // Server responded with error status - reuse object structure
        return { 
          error: `HTTP ${axiosError.response.status}`, 
          api_response: axiosError.response.data 
        }
      } else if (axiosError.request) {
        // Request made but no response - reuse pre-defined object
        return { ...ERROR_RESPONSES.NO_RESPONSE, details: axiosError.message }
      }
    }
    return { error: String(error) }
  }
}

// Pre-computed endpoints for better performance
const ENDPOINTS = {
  SLOT: `/api/vhr/utility/v0/utility/75/booking-time`,
  CLASSIFIES: `/api/vhr/utility/v0/utility/75/classifies`,
  PLACES: `/api/vhr/utility/v0/utility/75/places`,
  TICKET_INFO: "/api/vhr/utility/v0/utility/ticket-info",
  BOOKING: "/api/vhr/utility/v0/customer-utility/booking"
} as const
// Step 1: Get places - optimized parameter creation
async function getSlot(bookingDate: number, jwtToken: string): Promise<any> {
  const params = {
    bookingDate
  }
  
  return await makeServerRequest('GET', ENDPOINTS.SLOT, jwtToken, undefined, params)
}
// Step 1: Get places - optimized parameter creation
async function classifies(fromTime: number, timeConstraintId: number, jwtToken: string): Promise<any> {
  const params = {
    timeConstraintId,
    monthlyTicket: 'false',
    fromTime,
  }
  
  return await makeServerRequest('GET', ENDPOINTS.CLASSIFIES, jwtToken, undefined, params)
}
// Step 1: Get places - optimized parameter creation
async function getPlaces(fromTime: number, timeConstraintId: number, jwtToken: string): Promise<any> {
  const params = {
    classifyId: CLASSIFY_ID,
    fromTime,
    timeConstraintId,
    monthlyTicket: 'false'
  }
  
  return await makeServerRequest('GET', ENDPOINTS.PLACES, jwtToken, undefined, params)
}

// Step 2: Get ticket info - optimized parameter creation
async function getTicketInfo(bookingDate: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string): Promise<any> {
  const params = {
    bookingDate,
    placeUtilityId,
    timeConstraintId
  }
  
  return await makeServerRequest('GET', ENDPOINTS.TICKET_INFO, jwtToken, undefined, params)
}

// Pre-defined booking template for better performance
const BOOKING_TEMPLATE = {
  paymentMethod: null,
  vinClubPoint: null,
  deviceType: "ANDROID"
} as const

// Step 3: Make booking - optimized data creation
async function makeBooking(bookingDate: number, placeId: number, timeConstraintId: number, jwtToken: string): Promise<any> {
  const bookingData: BookingData = {
    bookingRequests: [{
      bookingDate,
      placeId,
      timeConstraintId,
      utilityId: UTILITY_ID,
      residentTicket: 4,
      residentChildTicket: null,
      guestTicket: null,
      guestChildTicket: null,
    }],
    ...BOOKING_TEMPLATE
  }

  bookingData.cs = generateChecksum(bookingData)

  return await makeServerRequest('POST', ENDPOINTS.BOOKING, jwtToken, bookingData)
}

// Pre-defined error responses for common failures
const STEP_ERRORS = {
  SLOT: (data: any) => ({ error: "Step 1 (get_slot) failed", data, success: false }),
  CLASSIFIES: (data: any) => ({ error: "Step 2 (get_classifies) failed", data, success: false }),
  PLACES: (data: any) => ({ error: "Step 3 (get_places) failed", data, success: false }),
  TICKET_INFO: (data: any) => ({ error: "Step 4 (get_ticket_info) failed", data, success: false }),
  BOOKING: (data: any) => ({ error: "Booking failed", data, success: false }),
  GENERIC: (error: string) => ({ error, success: false })
} as const

// Main server-side booking function - optimized error handling
async function executeServerBooking(
  jwtToken: string, 
  bookingParams: { placeId: number, placeUtilityId: number, timeConstraintId: number, bookingHour: number }
): Promise<any> {
  try {
    const { placeId, placeUtilityId, timeConstraintId, bookingHour } = bookingParams
    const bookingDate = getBookingDate()
    const fromTime = generateFromTime(bookingHour)
    // Execute booking steps with optimized error checking
    const slotResult = await getSlot(bookingDate, jwtToken)
    if (slotResult.error) {
      return STEP_ERRORS.SLOT(slotResult)
    }

    await randomDelay(300, 400)
    const classifiesResult = await classifies(fromTime, timeConstraintId, jwtToken)
    if (classifiesResult.error) {
      return STEP_ERRORS.CLASSIFIES(classifiesResult)
    }
    await randomDelay(300, 400)
    const placesResult = await getPlaces(fromTime, timeConstraintId, jwtToken)
   
    if (placesResult.error) {
      return STEP_ERRORS.PLACES(placesResult)
    }
    await randomDelay(300, 400)
    const ticketInfoResult = await getTicketInfo(bookingDate, placeUtilityId, timeConstraintId, jwtToken)
    if (ticketInfoResult.error) {
      return STEP_ERRORS.TICKET_INFO(ticketInfoResult)
    }
    await randomDelay(300, 400)
    const bookingResult = await makeBooking(bookingDate, placeId, timeConstraintId, jwtToken)
    
    if (bookingResult.error) {
      return STEP_ERRORS.BOOKING(bookingResult)
    }

    return { success: true, data: bookingResult }

  } catch (error) {
    return STEP_ERRORS.GENERIC(String(error))
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, placeId, placeUtilityId, timeConstraintId, bookingHour } = body
    const result = await executeServerBooking(token, { placeId, placeUtilityId, timeConstraintId, bookingHour })
    const status = result.success ? 200 : 400
    return NextResponse.json(result, { status })

  } catch (error) {
    // Pre-construct error response for 500 errors
    return NextResponse.json(
      STEP_ERRORS.GENERIC(String(error)),
      { status: 500 }
    )
  }
}