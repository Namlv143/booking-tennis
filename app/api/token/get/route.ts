import { NextResponse } from "next/server"
import { ServerTokenService } from "@/lib/server-token-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      )
    }

    const token = ServerTokenService.getToken(username)
    const hasToken = ServerTokenService.hasToken(username)

    return NextResponse.json({
      success: true,
      hasToken,
      token,
      message: hasToken ? "Token found" : "No token found"
    })
  } catch (error) {
    console.error("Token get error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to get token" },
      { status: 500 }
    )
  }
}
