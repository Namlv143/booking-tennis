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

// Pre-computed constants

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

// Get places function
async function getPlaces(fromTime: number, timeConstraintId: number, jwtToken: string, classifyId: number, utilityId: number): Promise<any> {
  const params = {
    classifyId,
    fromTime,
    timeConstraintId,
    monthlyTicket: false
  }
  
  return await makeServerRequest('GET', `/api/vhr/utility/v0/utility/${utilityId}/places`, jwtToken, params)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, timeConstraintId, fromTime, classifyId, utilityId } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", success: false },
        { status: 400 }
      )
    }

    if (!timeConstraintId) {
      return NextResponse.json(
        { error: "timeConstraintId is required", success: false },
        { status: 400 }
      )
    }
    
    const result = await getPlaces(fromTime, timeConstraintId, token, classifyId, utilityId)
    
    if (result.error) {
      return NextResponse.json(
        { error: "Places API failed", data: result, success: false },
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
