import { NextResponse } from "next/server"
import crypto from "crypto"
import axios, { AxiosError, AxiosInstance } from "axios"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn"
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
const UTILITY_ID = 75

// Optimized axios instance
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
  maxRedirects: 3,
  validateStatus: (status) => status < 500
})

// Interfaces
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

// Headers generation
function getHeaders(jwtToken: string): Record<string, string> {
  return {
    'x-vinhome-token': jwtToken,
    'Connection': 'keep-alive',
    'accept-encoding': 'gzip deflate br'
  }
}

// Checksum generation
function generateChecksum(bookingData: BookingData): string {
  const booking = bookingData.bookingRequests[0]
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId
  
  const hash = crypto.createHash('sha256')
  hash.update(numericSum.toString())
  hash.update(SECRET_KEY)
  
  return hash.digest('hex')
}

// HTTP request function
async function makeServerRequest(method: string, endpoint: string, jwtToken: string, data?: any): Promise<any> {
  const headers = getHeaders(jwtToken)

  try {
    const response = await httpClient({
      method,
      url: endpoint,
      headers,
      data,
    })
    return response.data

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        return { 
          error: `HTTP ${axiosError.response.status}`, 
          api_response: axiosError.response.data 
        }
      } else if (axiosError.request) {
        return { error: 'No response from server', details: axiosError.message }
      }
    }
    return { error: String(error) }
  }
}

// Pre-defined booking template
const BOOKING_TEMPLATE = {
  paymentMethod: null,
  vinClubPoint: null,
  deviceType: "ANDROID"
} as const

// Make booking function
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

  return await makeServerRequest('POST', "/api/vhr/utility/v0/customer-utility/booking", jwtToken, bookingData)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, placeId, timeConstraintId, bookingDate } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", success: false },
        { status: 400 }
      )
    }

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required", success: false },
        { status: 400 }
      )
    }

    if (!timeConstraintId) {
      return NextResponse.json(
        { error: "timeConstraintId is required", success: false },
        { status: 400 }
      )
    }

    // Use provided booking date or calculate tomorrow
    const finalBookingDate = bookingDate
    
    const result = await makeBooking(finalBookingDate, placeId, timeConstraintId, token)
    
    if (result.error) {
      return NextResponse.json(
        { error: "Booking API failed", data: result, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    )
  }
}
