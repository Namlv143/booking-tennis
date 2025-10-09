import { NextResponse } from "next/server"
import crypto from "crypto"

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
const JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIyMTUxNjUiLCJzdWIiOiIwMzM2MzQ4MzE2IiwiYXVkIjoib2F1dGgiLCJpYXQiOjE3NTk5ODMyNTAsImV4cCI6MTc2MDA2OTY1MH0.3WJo8bGQqe1NhNfrOapsP-nXM_752dB4-WoVVJGgjoWt8e3EFLintB9Gz1sqXbF9se1_OF_A8BrG_SRgEDLswA"
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"

// Pre-configured data for maximum performance
const UTILITY_ID = 75
const CLASSIFY_ID = 118

// Default values (can be overridden by request params)
const DEFAULT_PLACE_ID = 801
const DEFAULT_PLACE_UTILITY_ID = 625
const DEFAULT_TIME_CONSTRAINT_ID = 575

// Ultra-fast headers with client-provided JWT token
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

// Optimized date functions with pre-computed offset
const VIETNAM_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function getBookingDate(): number {
  // Ultra-fast: Direct calculation without multiple Date objects
  return Date.now() + VIETNAM_OFFSET + ONE_DAY
}

function generateFromTime(): number {
  // Ultra-fast: Calculate tomorrow 18:00 Vietnam time directly
  const now = Date.now()
  const vietnamNow = now + VIETNAM_OFFSET
  const tomorrow = vietnamNow + ONE_DAY
  
  // Set to 18:00 (6 PM) - more efficient calculation
  const tomorrowDate = new Date(tomorrow)
  tomorrowDate.setHours(18, 0, 0, 0)
  
  return tomorrowDate.getTime()
}

function generateChecksum(bookingData: BookingData): string {
  // Generate checksum for booking
  const booking = bookingData.bookingRequests[0]
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
  const interpolatedString = `${numericSum}${SECRET_KEY}`
  
  return crypto.createHash('sha256').update(interpolatedString, 'utf-8').digest('hex')
}

async function makeRequest(method: string, endpoint: string, jwtToken: string, data?: any, params?: Record<string, string>): Promise<any> {
  let url = `${BASE_URL}${endpoint}`
  
  // Add query parameters if provided - faster than URL constructor
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  const headers = getHeaders(method, jwtToken)

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      // Minimal options for maximum speed
      cache: "no-store",
      credentials: "omit",
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

// Step 1: Get time slots - use pre-configured data
async function getTimeSlots(): Promise<TennisBookingResponse> {
  // Skip API call - using pre-configured data for speed
  return { success: true }
}

// Step 3: Get places - API call with dynamic data
async function getPlaces(fromTime: number, timeConstraintId: number, jwtToken: string): Promise<TennisBookingResponse> {
  const params = {
    classifyId: CLASSIFY_ID.toString(),
    fromTime: fromTime.toString(),
    timeConstraintId: timeConstraintId.toString(),
    monthlyTicket: 'false'
  }
  
  const endpoint = `/api/vhr/utility/v0/utility/${UTILITY_ID}/places`
  const result = await makeRequest('GET', endpoint, jwtToken, undefined, params)
  
  return { success: !result.error, data: result, error: result.error }
}

// Step 4: Get ticket information - API call with dynamic data
async function getTicketInfo(bookingDate: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string): Promise<TennisBookingResponse> {
  const params = {
    bookingDate: bookingDate.toString(),
    placeUtilityId: placeUtilityId.toString(),
    timeConstraintId: timeConstraintId.toString()
  }
  
  const endpoint = "/api/vhr/utility/v0/utility/ticket-info"
  const result = await makeRequest('GET', endpoint, jwtToken, undefined, params)
  
  return { success: !result.error, data: result, error: result.error }
}

// Pre-computed booking template for speed
const BOOKING_TEMPLATE = {
  paymentMethod: null,
  vinClubPoint: null,
  deviceType: "ANDROID"
}

// Base booking request template - placeId and timeConstraintId will be dynamic
const BOOKING_REQUEST_BASE = {
  utilityId: UTILITY_ID,
  residentTicket: 4,
  residentChildTicket: null,
  guestTicket: null,
  guestChildTicket: null
}

// Step 5: Make final booking - with dynamic parameters
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

  // Add checksum
  bookingData.cs = generateChecksum(bookingData)

  const endpoint = "/api/vhr/utility/v0/customer-utility/booking"
  const result = await makeRequest('POST', endpoint, jwtToken, bookingData)
  return { success: !result.error, data: result, error: result.error }
}

// Ultra-fast execution flow with client JWT token
async function executeBookingFlow(jwtToken: string, bookingParams?: { placeId: number, placeUtilityId: number, timeConstraintId: number }): Promise<TennisBookingResponse> {
  try {
    const bookingDate = getBookingDate()
    const fromTime = generateFromTime()
    
    // Use provided params or defaults
    const placeId = bookingParams?.placeId || DEFAULT_PLACE_ID
    const placeUtilityId = bookingParams?.placeUtilityId || DEFAULT_PLACE_UTILITY_ID
    const timeConstraintId = bookingParams?.timeConstraintId || DEFAULT_TIME_CONSTRAINT_ID

    // Parallel execution for time slots and places
    const [timeSlotsResult, placesResult] = await Promise.all([
      getTimeSlots(),
      getPlaces(fromTime, timeConstraintId, jwtToken)
    ])

    // Check results from parallel execution
    if (timeSlotsResult.error) {
      return { error: "Step 1 (get_time_slots) failed", data: timeSlotsResult }
    }

    if (placesResult.error) {
      return { error: "Step 3 (get_places) failed", data: placesResult }
    }

    // Sequential execution for ticket info
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

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Parse request body for booking parameters and JWT token
    let bookingParams;
    let jwtToken = JWT_TOKEN; // Default fallback
    try {
      const reqBody = await request.json()
      bookingParams = reqBody.bookingParams
      jwtToken = bookingParams.jwtToken || JWT_TOKEN // Use client token or fallback

    } catch {
      // If no body or invalid JSON, use defaults
      bookingParams = undefined
    }

    // Execute ultra-fast booking flow with client token
    const result = await executeBookingFlow(jwtToken, bookingParams)

    if (result.error) {
      return NextResponse.json(
        { error: result?.data?.api_response, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: "ultra-fast"
  })
}
