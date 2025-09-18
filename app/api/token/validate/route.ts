import { NextResponse } from "next/server"
import { ServerTokenService } from "@/lib/server-token-service"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      )
    }

    const validation = ServerTokenService.validateToken(token)

    return NextResponse.json({
      success: true,
      isValid: validation.isValid,
      username: validation.username,
      message: validation.isValid ? "Token is valid" : "Token is invalid"
    })
  } catch (error) {
    console.error("Token validate error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to validate token" },
      { status: 500 }
    )
  }
}
