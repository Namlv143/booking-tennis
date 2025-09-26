import { NextResponse } from "next/server"

// Types for better type safety
interface UserMeResponse {
  data?: any
  error?: string
}

class VinhomesUserMeService {
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

  // Public method to call user/me API
  async callUserMe(token: string): Promise<UserMeResponse> {
    try {
      const url = `${VinhomesUserMeService.BASE_URL}/api/vhr/customer/v0/user/me`
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
}

export async function POST(request: Request) {
  try {
    // Get token from request body
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      )
    }

    const userMeService = new VinhomesUserMeService()
    const userMe = await userMeService.callUserMe(token)

    if (userMe.error) {
      return NextResponse.json(
        { message: userMe.error },
        { status: 400 }
      )
    }

    return NextResponse.json(userMe)
  } catch (error) {
    console.error("[v0] User/me API error:", error)
    return NextResponse.json(
      {
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
