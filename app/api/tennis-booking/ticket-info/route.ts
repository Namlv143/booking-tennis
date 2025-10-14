import { NextResponse } from "next/server"
import axios, { AxiosError, AxiosInstance } from "axios"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn"

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

// Headers generation
function getHeaders(jwtToken: string): Record<string, string> {
  return {
    'x-vinhome-token': jwtToken,
    'accept-encoding': 'gzip'
  }
}

// HTTP request function
async function makeServerRequest(method: string, endpoint: string, jwtToken: string, params?: Record<string, any>): Promise<any> {
  const headers = getHeaders(jwtToken)

  try {
    const response = await httpClient({
      method,
      url: endpoint,
      headers,
      params,
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

// Get ticket info function
async function getTicketInfo(bookingDate: number, placeUtilityId: number, timeConstraintId: number, jwtToken: string): Promise<any> {
  const params = {
    bookingDate,
    placeUtilityId,
    timeConstraintId
  }
  
  return await makeServerRequest('GET', `/api/vhr/utility/v0/utility/ticket-info`, jwtToken, params)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, placeUtilityId, timeConstraintId, bookingDate, classifyId } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", success: false },
        { status: 400 }
      )
    }

    if (!placeUtilityId) {
      return NextResponse.json(
        { error: "placeUtilityId is required", success: false },
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
    
    const result = await getTicketInfo(finalBookingDate, placeUtilityId, timeConstraintId, token)
    
    if (result.error) {
      return NextResponse.json(
        { error: "Ticket Info API failed", data: result, success: false },
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
