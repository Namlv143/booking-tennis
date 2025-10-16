import { NextResponse } from "next/server"
import axios, { AxiosError, AxiosInstance } from "axios"

// Types for better type safety
interface UtilityResponse {
  data?: any
  error?: string
}

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn"

// Optimized axios instance with connection pooling and timeouts
const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'user-agent': 'Dart/3.7 (dart:io)',
    'app-version-name': '1.5.5',
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

// Pre-defined error response objects for better performance
const ERROR_RESPONSES = {
  NO_RESPONSE: { error: 'No response from server' },
  UNKNOWN: { error: 'Unknown error occurred' }
} as const

// Optimized headers generation
function getHeaders(jwtToken: string): Record<string, string> {
  return {
    'x-vinhome-token': jwtToken,
    'accept-encoding': 'gzip'
  }
}

// Optimized server-side HTTP request function using pre-configured axios instance
async function makeServerRequest(endpoint: string, jwtToken: string): Promise<any> {
  const headers = getHeaders(jwtToken)

  try {
    const response = await httpClient({
      method: 'GET',
      url: endpoint, // Using relative URL since baseURL is configured
      headers,
    })
    return response.data

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response) {
        // Server responded with error status
        return { 
          error: `HTTP ${axiosError.response.status}`, 
          api_response: axiosError.response.data 
        }
      } else if (axiosError.request) {
        // Request made but no response
        return { ...ERROR_RESPONSES.NO_RESPONSE, details: axiosError.message }
      }
    }
    return { error: String(error) }
  }
}

// Public function to call utility API
async function callUtility(token: string): Promise<UtilityResponse> {
  try {
    console.log("[v0] Calling utility API...")
    
    const data = await makeServerRequest('/api/vhr/utility/v0/utility', token)
    
    if (data.error) {
      console.log("[v0] Utility API error:", data.error)
      return { error: data.error }
    }

    console.log("[v0] Utility API success")
    return { data }
  } catch (error) {
    console.error("[v0] Utility API failed:", error)
    return { error: String(error) }
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Get token from query parameter (passed from frontend)
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      )
    }

    const utility = await callUtility(token)

    if (utility.error) {
      return NextResponse.json(
        { message: utility.error },
        { status: 400 }
      )
    }

    return NextResponse.json(utility)
  } catch (error) {
    console.error("[v0] Utility API error:", error)
    return NextResponse.json(
      {
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
