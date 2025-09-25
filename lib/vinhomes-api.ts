import axios, { AxiosInstance, AxiosResponse } from 'axios'
import crypto from "crypto"

// Types for better type safety
interface LoginRequest {
  username: string
  password: string
}

interface CustomerInfo {
  id: number
  userLoginVin3sId: number
  userName: string
  fullName: string
  email: string | null
  mobile: string
  apartmentId: number
  apartmentCode: string
  address: string | null
  birthDate: number
  isMaster: string
  leasing: boolean
  secondaryResidentBlock: boolean
  blockType: string
  areaId: number
  sapAreaId: number
  areaName: string
  sapBlockId: number
  blockId: number
  blockName: string
  sapFloorId: number
  floorId: number
  floorName: string
  menuAppCodes: string[]
  role: string | null
  apartmentStatus: string
  apartmentType: string
  avatarUrl: string | null
  accountingCode: string
  gender: string
  status: string
  humanStatus: string
  appLanguage: string
  isEnableNoti: boolean
  residentApartmentId: number
  uploadedLogs: any
}

interface LoginResponseData {
  accessToken: string
  tokenType: string
  refreshToken: string
  customerInfo: CustomerInfo
}

interface LoginApiResponse {
  message: string | null
  code: string
  data: LoginResponseData
}

interface UserMeResponse {
  data?: any
  error?: string
}

interface EditorConfigResponse {
  data?: any
  error?: string
}

// Tennis booking related interfaces
interface BookingTarget {
  placeId: number
  placeUtilityId: number
  timeConstraintId: number
  classifyId: number
}

interface BookingRequest {
  bookingDate: number
  placeId: number
  timeConstraintId: number
  utilityId: number
  residentTicket: number
  residentChildTicket: number | null
  guestTicket: number | null
  guestChildTicket: number | null
}

interface TennisBookingRequest {
  jwtToken: string
  bookingDate: number
  fromTime: number
  bookingTarget: BookingTarget
  isHardcoded?: boolean
}

interface TennisBookingResponse {
  success: boolean
  message: string
  data?: {
    status: number
    statusText: string
    data: any
  }
  error?: any
}

// Constants
const BASE_URL = "https://vh.vinhomes.vn"
const UTILITY_ID = 75
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"

// Create axios instance with interceptors
const createAxiosInstance = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      "accept-encoding": "gzip",
      "accept-language": "vi",
      "app-version-name": "1.5.5",
      "content-type": "application/json; charset=UTF-8",
      "device-id": "51a9e0d3fcb8574c",
      "device-inf": "PHY110 OPPO 35",
      "user-agent": "Dart/3.7 (dart:io)",
    },
  })

  // Add request interceptor for logging
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log(`[VinhomesAPI] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error('[VinhomesAPI] Request error:', error)
      return Promise.reject(error)
    }
  )

  // Add response interceptor for logging
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(`[VinhomesAPI] Response ${response.status} for ${response.config.url}`)
      return response
    },
    (error) => {
      console.error('[VinhomesAPI] Response error:', error.response?.status, error.message)
      return Promise.reject(error)
    }
  )

  return axiosInstance
}

// Get headers for API requests
const getHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "accept-encoding": "gzip",
    "accept-language": "vi",
    "app-version-name": "1.5.5",
    "content-type": "application/json; charset=UTF-8",
    "device-id": "51a9e0d3fcb8574c",
    "device-inf": "PHY110 OPPO 35",
    "user-agent": "Dart/3.7 (dart:io)",
  }

  if (token) {
    headers["x-vinhome-token"] = token
  }

  return headers
}

/**
 * Generates the required checksum for the booking payload.
 * @param bookingData - The booking request data.
 * @returns The SHA-256 checksum.
 */
const generateChecksum = async (bookingData: any): Promise<string> => {
  const booking = bookingData.bookingRequests[0]
  const numericSum =
    booking.utilityId +
    booking.placeId +
    booking.bookingDate +
    booking.timeConstraintId
  const interpolatedString = `${numericSum}${SECRET_KEY}`
  const checksum = crypto.createHash('sha256').update(interpolatedString, 'utf-8').digest('hex');
  return checksum
}

/**
 * Login to Vinhomes API
 * @param loginData - Login credentials
 * @returns Promise with login response
 */
const login = async (loginData: LoginRequest): Promise<LoginApiResponse> => {
  try {
    console.log("[VinhomesAPI] Starting login request")
    
    const axiosInstance = createAxiosInstance()
    const response: AxiosResponse<LoginApiResponse> = await axiosInstance.post(
      "/api/vhr/iam/v0/security/oauth-login",
      loginData,
      {
        headers: getHeaders(),
      }
    )

    console.log("[VinhomesAPI] Login successful")
    return response.data
  } catch (error: any) {
    console.error("[VinhomesAPI] Login failed:", error)
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Login failed"
    )
  }
}

/**
 * Get user information
 * @param token - Authentication token
 * @returns Promise with user data
 */
const getUserMe = async (token: string): Promise<UserMeResponse> => {
  try {
    console.log("[VinhomesAPI] Calling user/me API")
    
    const axiosInstance = createAxiosInstance()
    const response: AxiosResponse<any> = await axiosInstance.get(
      "/api/vhr/customer/v0/user/me",
      {
        headers: getHeaders(token),
      }
    )

    console.log("[VinhomesAPI] User/me API success")
    return { data: response.data }
  } catch (error: any) {
    console.error("[VinhomesAPI] User/me API failed:", error)
    return { 
      error: error.response?.data?.message || 
             error.message || 
             "User/me API failed" 
    }
  }
}

/**
 * Get editor configuration
 * @param token - Authentication token
 * @returns Promise with editor config data
 */
const getEditorConfig = async (token: string): Promise<EditorConfigResponse> => {
  try {
    console.log("[VinhomesAPI] Calling editor-config API")
    
    const axiosInstance = createAxiosInstance()
    const response: AxiosResponse<any> = await axiosInstance.get(
      "/api/vhr/customer/v0/editor-config/",
      {
        headers: getHeaders(token),
      }
    )

    console.log("[VinhomesAPI] Editor-config API success")
    return { data: response.data }
  } catch (error: any) {
    console.error("[VinhomesAPI] Editor-config API failed:", error)
    return { 
      error: error.response?.data?.message || 
             error.message || 
             "Editor-config API failed" 
    }
  }
}

/**
 * Login and get additional user data
 * @param loginData - Login credentials
 * @returns Promise with login and user data
 */
const loginWithAdditionalData = async (loginData: LoginRequest): Promise<{
  login: LoginApiResponse
  userMe?: UserMeResponse
}> => {
  try {
    // First, perform login
    const loginResult = await login(loginData)
    
    if (!loginResult.data?.accessToken) {
      throw new Error("No access token received from login")
    }

    const token = loginResult.data.accessToken
    console.log("[VinhomesAPI] Login successful, calling additional APIs...")

    // Call additional APIs in parallel
    const userMe = await getUserMe(token)

    return {
      login: loginResult,
      userMe,
    }
  } catch (error: any) {
    console.error("[VinhomesAPI] Login with additional data failed:", error)
    throw error
  }
}

/**
 * Books a tennis court using the Vinhomes API (Postman Collection Runner style)
 * @param bookingRequest - The tennis booking request data
 * @returns Promise with booking result
 */
const bookTennis = async (bookingRequest: any): Promise<any> => {
  try {
    console.log("[VinhomesAPI] Starting tennis booking request (Postman Collection Runner style)")
    
    const { jwtToken, bookingDate, bookingTarget, cs } = bookingRequest
    const { placeId, placeUtilityId, timeConstraintId } = bookingTarget

    // Create a persistent session with cookie jar (like Postman Collection Runner)
    const sessionClient = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      withCredentials: true, // Enable cookie handling
      headers: {
        "User-Agent": "Dart/3.7 (dart:io)", // Capitalized to prevent browser override
        "app-version-name": "1.5.5",
        "device-inf": "PHY110 OPPO 35",
        "accept-language": "vi",
        "x-vinhome-token": jwtToken,
        "device-id": "51a9e0d3fcb8574c",
        "host": "vh.vinhomes.vn",
        "content-type": "application/json; charset=UTF-8",
        "accept-encoding": "gzip, deflate, br",
        "connection": "keep-alive",
        // Additional headers to prevent browser interference
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "referer": "https://vh.vinhomes.vn/",
      },
    })

    // Cookie storage for session persistence (like Postman)
    let storedCookies: string[] = []

    // Helper function to extract and store cookies from response headers
    const extractAndStoreCookies = (response: AxiosResponse) => {
      const setCookieHeaders = response.headers['set-cookie']
      if (setCookieHeaders) {
        storedCookies = [...storedCookies, ...setCookieHeaders]
        console.log(`[VinhomesAPI] Stored ${setCookieHeaders.length} cookies from response`)
      }
    }

    // Helper function to add stored cookies to request headers
    const addStoredCookies = (config: any) => {
      if (storedCookies.length > 0) {
        config.headers = {
          ...config.headers,
          'Cookie': storedCookies.join('; ')
        }
        console.log(`[VinhomesAPI] Added ${storedCookies.length} stored cookies to request`)
      }
      return config
    }

    // Add request interceptor to include stored cookies
    sessionClient.interceptors.request.use(addStoredCookies)

    // Add response interceptor to extract and store cookies
    sessionClient.interceptors.response.use(
      (response) => {
        extractAndStoreCookies(response)
        return response
      },
      (error) => {
        if (error.response) {
          extractAndStoreCookies(error.response)
        }
        return Promise.reject(error)
      }
    )

    // Step 1: Get Time Slots (delay=0 - immediate execution)
    console.log("[VinhomesAPI] Step 1: Getting booking times...")
    const timeSlotsResponse = await sessionClient.get(
      `/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time`,
      {
        params: { bookingDate },
      }
    )
    console.log(`[VinhomesAPI] Step 1 completed - Status: ${timeSlotsResponse.status}`)

    // // Step 2: Get Classifies
    // console.log("[VinhomesAPI] Step 2: Getting classifies...")
    // const classifiesResponse = await sessionClient.get(
    //   `/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies`,
    //   {
    //     params: {
    //       timeConstraintId: timeConstraintId,
    //       monthlyTicket: false,
    //       fromTime: fromTime,
    //     },
    //   }
    // )
    // console.log(`[VinhomesAPI] Step 2 completed - Status: ${classifiesResponse.status}`)

    // // Step 3: Get Places
    // console.log("[VinhomesAPI] Step 3: Getting places...")
    // const placesResponse = await sessionClient.get(
    //   `/api/vhr/utility/v0/utility/${UTILITY_ID}/places`,
    //   {
    //     params: {
    //       classifyId: classifyId,
    //       timeConstraintId: timeConstraintId,
    //       monthlyTicket: false,
    //       fromTime: fromTime,
    //     },
    //   }
    // )
    // console.log(`[VinhomesAPI] Step 3 completed - Status: ${placesResponse.status}`)

    // Step 4: Get Ticket Info (Final validation step)
    console.log("[VinhomesAPI] Step 4: Getting ticket info...")
    const ticketInfoResponse = await sessionClient.get(
      `/api/vhr/utility/v0/utility/ticket-info`,
      {
        params: {
          bookingDate,
          placeUtilityId: placeUtilityId,
          timeConstraintId: timeConstraintId,
        },
      }
    )
    console.log(`[VinhomesAPI] Step 4 completed - Status: ${ticketInfoResponse.status}`)

    // Step 5: Make Final Booking
    console.log("[VinhomesAPI] Step 5: Making final booking...")
    const bookingData: any = {
      bookingRequests: [
        {
          bookingDate: bookingDate,
          placeId: placeId,
          timeConstraintId: timeConstraintId,
          utilityId: UTILITY_ID,
          residentTicket: 4,
          residentChildTicket: null,
          guestTicket: null,
          guestChildTicket: null,
        },
      ],
      paymentMethod: null,
      vinClubPoint: null,
      deviceType: "ANDROID",
      cs: cs,
    }
    

    const finalBookingResponse = await sessionClient.post(
      `/api/vhr/utility/v0/customer-utility/booking`,
      bookingData
    )

    // Extract only the serializable data from the axios response
    const responseData = {
      status: finalBookingResponse.status,
      statusText: finalBookingResponse.statusText,
      data: finalBookingResponse.data,
      headers: finalBookingResponse.headers,
      cookies: storedCookies, // Include stored cookies in response
    }

    // Check if booking was successful
    const isSuccess = finalBookingResponse.status >= 200 && finalBookingResponse.status < 300

    console.log(`[VinhomesAPI] Tennis booking completed - Success: ${isSuccess}, Status: ${finalBookingResponse.status}`)
    console.log(`[VinhomesAPI] Total cookies stored: ${storedCookies.length}`)
    
    return {
      success: isSuccess,
      message: isSuccess ? "Booking flow completed successfully!" : "Booking request failed",
      data: responseData,
    }
  } catch (error: any) {
    console.error("[VinhomesAPI] Tennis booking failed:", error)
    return {
      success: false,
      message: error.message || "An error occurred during booking",
      error: error.response?.data || error.message,
    }
  }
}

/**
 * Client-side tennis booking function that makes direct requests from browser
 * This bypasses the API route and makes requests directly to Vinhomes API
 * @param bookingRequest - The tennis booking request data
 * @returns Promise with booking result
 */
const bookTennisClient = async (bookingRequest: any): Promise<any> => {
  try {
    console.log("[VinhomesAPI] Starting client-side tennis booking request")
    
    const { jwtToken, bookingDate, bookingTarget, cs } = bookingRequest
    const { placeId, placeUtilityId, timeConstraintId } = bookingTarget

    // Cookie storage for session persistence
    let storedCookies: string[] = []

    // Helper function to make requests with proper headers
    const makeRequest = async (url: string, options: RequestInit = {}) => {
      const headers = new Headers({
        "User-Agent": "Dart/3.7 (dart:io)",
        "app-version-name": "1.5.5",
        "device-inf": "PHY110 OPPO 35",
        "accept-language": "vi",
        "x-vinhome-token": jwtToken,
        "device-id": "51a9e0d3fcb8574c",
        "host": "vh.vinhomes.vn",
        "content-type": "application/json; charset=UTF-8",
        "accept-encoding": "gzip, deflate, br",
        "connection": "keep-alive",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://vh.vinhomes.vn/",
        // Add stored cookies
        ...(storedCookies.length > 0 && { "Cookie": storedCookies.join('; ') })
      })

      // Merge with provided options
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...Object.fromEntries(headers.entries()),
          ...options.headers
        },
        credentials: 'include', // Include cookies
        mode: 'cors',
        cache: 'no-store'
      }

      const response = await fetch(url, requestOptions)
      
      // Extract and store cookies from response
      const setCookieHeaders = response.headers.get('set-cookie')
      if (setCookieHeaders) {
        const cookies = setCookieHeaders.split(',').map(cookie => cookie.trim())
        storedCookies = [...storedCookies, ...cookies]
        console.log(`[VinhomesAPI] Stored ${cookies.length} cookies from response`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    }

    // // Step 1: Get Time Slots
    // console.log("[VinhomesAPI] Step 1: Getting booking times...")
    // const timeSlotsUrl = `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time?bookingDate=${bookingDate}`
    // await makeRequest(timeSlotsUrl)
    // console.log("[VinhomesAPI] Step 1 completed")

    // // Step 2: Get Classifies
    // console.log("[VinhomesAPI] Step 2: Getting classifies...")
    // const classifiesUrl = `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies?timeConstraintId=${timeConstraintId}&monthlyTicket=false&fromTime=${bookingDate}`
    // await makeRequest(classifiesUrl)
    // console.log("[VinhomesAPI] Step 2 completed")

    // // Step 3: Get Places
    // console.log("[VinhomesAPI] Step 3: Getting places...")
    // const placesUrl = `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/places?classifyId=${bookingTarget.classifyId}&timeConstraintId=${timeConstraintId}&monthlyTicket=false&fromTime=${bookingDate}`
    // await makeRequest(placesUrl)
    // console.log("[VinhomesAPI] Step 3 completed")

    // // Step 4: Get Ticket Info
    // console.log("[VinhomesAPI] Step 4: Getting ticket info...")
    // const ticketInfoUrl = `${BASE_URL}/api/vhr/utility/v0/utility/ticket-info?bookingDate=${bookingDate}&placeUtilityId=${placeUtilityId}&timeConstraintId=${timeConstraintId}`
    // const finalResponse = await makeRequest(ticketInfoUrl)
    // console.log("[VinhomesAPI] Step 4 completed")

    //Step 5: Make Final Booking
    console.log("[VinhomesAPI] Step 5: Making final booking...")
    const bookingData = {
      bookingRequests: [{
        bookingDate: bookingDate,
        placeId: placeId,
        timeConstraintId: timeConstraintId,
        utilityId: UTILITY_ID,
        residentTicket: 4,
        residentChildTicket: null,
        guestTicket: null,
        guestChildTicket: null,
      }],
      paymentMethod: null,
      vinClubPoint: null,
      deviceType: "ANDROID",
      cs: cs
    }

    const bookingUrl = `${BASE_URL}/api/vhr/utility/v0/customer-utility/booking`
    const finalResponse = await makeRequest(bookingUrl, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    })

    const responseData = await finalResponse.json()
    console.log(`[VinhomesAPI] Tennis booking completed - Status: ${finalResponse.status}`)
    console.log(`[VinhomesAPI] Total cookies stored: ${storedCookies.length}`)
    

    return {
      success: finalResponse.ok,
      message: finalResponse.ok ? "Booking flow completed successfully!" : "Booking request failed",
      data: {
        status: finalResponse.status,
        statusText: finalResponse.statusText,
        data: responseData,
        cookies: storedCookies
      }
    }
  } catch (error: any) {
    console.error("[VinhomesAPI] Client-side tennis booking failed:", error)
    return {
      success: false,
      message: error.message || "An error occurred during booking",
      error: error.message
    }
  }
}

// Export functions and types
export {
  login,
  getUserMe,
  getEditorConfig,
  loginWithAdditionalData,
  bookTennis,
  bookTennisClient,
  generateChecksum,
  getHeaders,
  createAxiosInstance,
  BASE_URL,
  UTILITY_ID,
  SECRET_KEY
}

export type { 
  LoginRequest, 
  LoginApiResponse, 
  UserMeResponse, 
  EditorConfigResponse, 
  CustomerInfo,
  BookingTarget,
  BookingRequest,
  TennisBookingRequest,
  TennisBookingResponse
}
