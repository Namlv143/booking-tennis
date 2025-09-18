import { NextResponse } from "next/server"
import { ServerTokenService } from "@/lib/server-token-service"

export async function POST(request: Request) {
  try {
    const { username, token } = await request.json()

    if (!username || !token) {
      return NextResponse.json(
        { success: false, message: "Username and token are required" },
        { status: 400 }
      )
    }

    // Store token on server
    ServerTokenService.storeToken(username, token)

    return NextResponse.json({
      success: true,
      message: "Token stored successfully"
    })
  } catch (error) {
    console.error("Token store error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to store token" },
      { status: 500 }
    )
  }
}
