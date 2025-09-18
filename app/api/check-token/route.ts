import { NextResponse } from "next/server"
import { TokenService } from "@/lib/token-service"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || '0979251496'

    console.log(`[Check Token] Checking token for username: ${username}`)

    // Check if token exists
    const token = TokenService.getToken(username)
    
    if (!token) {
      console.log(`[Check Token] No token found for user: ${username}`)
      return NextResponse.json({
        success: false,
        message: "No token found",
        hasToken: false,
        username
      })
    }

    // Get token info
    const tokenInfo = TokenService.getTokenInfo(username)
    
    console.log(`[Check Token] Token found for user: ${username}`)
    
    return NextResponse.json({
      success: true,
      message: "Token found",
      hasToken: true,
      username,
      tokenInfo: {
        isValid: tokenInfo?.isValid || false,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "..."
      }
    })

  } catch (error) {
    console.error('[Check Token] Error:', error)
    return NextResponse.json({
      success: false,
      message: "Error checking token",
      error: String(error)
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    const targetUsername = username || '0979251496'

    console.log(`[Check Token POST] Checking token for username: ${targetUsername}`)

    // Check if token exists
    const token = TokenService.getToken(targetUsername)
    
    if (!token) {
      console.log(`[Check Token POST] No token found for user: ${targetUsername}`)
      return NextResponse.json({
        success: false,
        message: "No token found",
        hasToken: false,
        username: targetUsername
      })
    }

    // Validate token by calling user/me API
    try {
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://vh.vinhomes.vn'}/api/vhr/customer/v0/user/me`, {
        method: "GET",
        headers: {
          "accept-encoding": "gzip",
          "accept-language": "vi",
          "app-version-name": "1.5.5",
          "content-type": "application/json; charset=UTF-8",
          "device-id": "51a9e0d3fcb8574c",
          "device-inf": "PHY110 OPPO 35",
          "host": "vh.vinhomes.vn",
          "user-agent": "Dart/3.7 (dart:io)",
          "x-vinhome-token": token
        },
        cache: "no-store",
        credentials: "omit",
        mode: "cors"
      })

      const isValid = validationResponse.ok
      const userData = isValid ? await validationResponse.json() : null

      console.log(`[Check Token POST] Token validation result: ${isValid ? 'VALID' : 'INVALID'}`)

      return NextResponse.json({
        success: true,
        message: isValid ? "Token is valid" : "Token is invalid",
        hasToken: true,
        isValid,
        username: targetUsername,
        tokenInfo: {
          isValid,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + "...",
          userData: userData?.data || null
        }
      })

    } catch (validationError) {
      console.error('[Check Token POST] Token validation failed:', validationError)
      return NextResponse.json({
        success: false,
        message: "Token validation failed",
        hasToken: true,
        isValid: false,
        username: targetUsername,
        error: String(validationError)
      })
    }

  } catch (error) {
    console.error('[Check Token POST] Error:', error)
    return NextResponse.json({
      success: false,
      message: "Error checking token",
      error: String(error)
    }, { status: 500 })
  }
}
