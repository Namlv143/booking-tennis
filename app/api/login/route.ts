import { NextResponse } from "next/server"

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

interface EditorConfigResponse {
  data?: any
  error?: string
}

interface UserMeResponse {
  data?: any
  error?: string
}

interface UtilityResponse {
  data?: any
  error?: string
}

interface LoginResult {
  status: number
  statusText: string
  headers: Record<string, string>
  data: LoginApiResponse
  success: boolean
  editorConfig?: EditorConfigResponse
  userMe?: UserMeResponse
  utility?: UtilityResponse
}

class VinhomesLoginService {
  // Static constants - configuration that doesn't change
  private static readonly BASE_URL = "https://vh.vinhomes.vn"
  private static readonly LOGIN_ENDPOINT = "/api/vhr/iam/v0/security/oauth-login"

  // Private utility methods
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "accept-encoding": "gzip",
      "accept-language": "vi",
      "app-version-name": "1.5.5",
      "content-type": "application/json; charset=UTF-8",
      "device-id": "51a9e0d3fcb8574c",
      "device-inf": "PHY110 OPPO 35",
      host: "vh.vinhomes.vn",
      "user-agent": "Dart/3.7 (dart:io)",
    }

    if (token) {
      headers["x-vinhome-token"] = token
    }

    return headers
  }

  private async makeLoginRequest(loginData: LoginRequest): Promise<LoginResult> {
    const url = `${VinhomesLoginService.BASE_URL}${VinhomesLoginService.LOGIN_ENDPOINT}`
    const headers = this.getHeaders()

    console.log("[v0] Login API - Starting request")
    console.log("[v0] URL:", url)
    console.log("[v0] Headers:", headers)
    console.log("[v0] Payload:", { username: loginData.username, password: "***" })

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(loginData),
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        keepalive: false,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("[v0] Response body:", responseText)

      let responseData: LoginApiResponse
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: null, code: "500", data: { rawResponse: responseText } as any }
      }

      const result: LoginResult = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok,
      }

      // Note: Token storage is now handled client-side
      return result
    } catch (error) {
      console.error("[v0] Login API error:", error)
      throw error
    }
  }

  // Additional API calls after successful login
  private async callUtility(token: string): Promise<UtilityResponse> {
    try {
      const url = `${VinhomesLoginService.BASE_URL}/api/vhr/utility/v0/utility`
      const headers = this.getHeaders(token)

      console.log("[v0] Calling utility API...")

      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Utility API error:", response.status, errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const data = await response.json()
      console.log("[v0] Utility API success")
      return { data }
    } catch (error) {
      console.error("[v0] Utility API failed:", error)
      return { error: String(error) }
    }
  }

  private async callEditorConfig(token: string): Promise<EditorConfigResponse> {
    try {
      const url = `${VinhomesLoginService.BASE_URL}/api/vhr/customer/v0/editor-config/`
      const headers = this.getHeaders(token)

      console.log("[v0] Calling editor-config API...")
      
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Editor-config API error:", response.status, errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const data = await response.json()
      console.log("[v0] Editor-config API success")
      return { data }
    } catch (error) {
      console.error("[v0] Editor-config API failed:", error)
      return { error: String(error) }
    }
  }

  private async callUserMe(token: string): Promise<UserMeResponse> {
    try {
      const url = `${VinhomesLoginService.BASE_URL}/api/vhr/customer/v0/user/me`
      const headers = this.getHeaders(token)

      console.log("[v0] Calling user/me API...")
      
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "omit",
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        keepalive: false,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] User/me API error:", response.status, errorText)
        return { error: `HTTP ${response.status}: ${errorText}` }
      }

      const data = await response.json()
      console.log("[v0] User/me API success")
      return { data }
    } catch (error) {
      console.error("[v0] User/me API failed:", error)
      return { error: String(error) }
    }
  }

  // Public method - main login execution with additional API calls
  async login(loginData: LoginRequest): Promise<LoginResult> {
    const loginResult = await this.makeLoginRequest(loginData)
    
    // If login successful, call additional APIs
    if (loginResult.success && loginResult.data?.data?.accessToken) {
      const token = loginResult.data.data.accessToken
      
      console.log("[v0] Login successful, calling additional APIs...")

      // Call all three APIs in parallel for better performance
      const [editorConfig, userMe] = await Promise.all([
        this.callEditorConfig(token),
        this.callUserMe(token),
      ])

      // Add results to login response
      loginResult.editorConfig = editorConfig
      loginResult.userMe = userMe
      
      console.log("[v0] Additional API calls completed")
    }
    
    return loginResult
  }
}

export async function POST(request: Request) {
  try {
    const { username, password }: LoginRequest = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      )
    }

    const loginService = new VinhomesLoginService()
    const result = await loginService.login({ username, password })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return NextResponse.json(
      {
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}

// Export login service
export { VinhomesLoginService }
