import { NextResponse } from "next/server"

// Types for better type safety
interface UtilityResponse {
  data?: any
  error?: string
}

class VinhomesUtilityService {
  // Static constants - configuration that doesn't change
  private static readonly BASE_URL = "https://vh.vinhomes.vn"

  // Private utility methods
  private getHeaders(token: string): Record<string, string> {
    const headers: Record<string, string> = {
      "accept-encoding": "gzip",
      "accept-language": "vi",
      "app-version-name": "1.5.5",
      "content-type": "application/json; charset=UTF-8",
      "device-id": "51a9e0d3fcb8574c",
      "device-inf": "PHY110 OPPO 35",
      host: "vh.vinhomes.vn",
      "user-agent": "Dart/3.7 (dart:io)",
      "x-vinhome-token": token,
    }

    return headers
  }

  // Public method to call utility API
  async callUtility(token: string): Promise<UtilityResponse> {
    try {
      const url = `${VinhomesUtilityService.BASE_URL}/api/vhr/utility/v0/utility`
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
}

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

    const utilityService = new VinhomesUtilityService()
    const utility = await utilityService.callUtility(token)

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
