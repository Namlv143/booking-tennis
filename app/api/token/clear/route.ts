import { NextResponse } from "next/server"
import { ServerTokenService } from "@/lib/server-token-service"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      )
    }

    ServerTokenService.clearToken(username)

    return NextResponse.json({
      success: true,
      message: "Token cleared successfully"
    })
  } catch (error) {
    console.error("Token clear error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to clear token" },
      { status: 500 }
    )
  }
}
