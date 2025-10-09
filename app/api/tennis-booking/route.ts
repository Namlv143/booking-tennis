import { NextResponse } from "next/server"

// Simplified server endpoint - main booking logic moved to client-side
// Client requests use user's Vietnam IP automatically!

const JWT_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIyMTUxNjUiLCJzdWIiOiIwMzM2MzQ4MzE2IiwiYXVkIjoib2F1dGgiLCJpYXQiOjE3NTk5ODMyNTAsImV4cCI6MTc2MDA2OTY1MH0.3WJo8bGQqe1NhNfrOapsP-nXM_752dB4-WoVVJGgjoWt8e3EFLintB9Gz1sqXbF9se1_OF_A8BrG_SRgEDLswA"

// Configuration for client-side booking
const CONFIG = {
  baseUrl: "https://vh.vinhomes.vn",
  utilityId: 75,
  classifyId: 118,
  defaultPlaceId: 801,
  defaultPlaceUtilityId: 625,
  defaultTimeConstraintId: 575,
  secretKey: "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET: Provide configuration and token for client-side booking
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Client-side booking enabled - uses user's Vietnam IP",
    config: CONFIG,
    jwtToken: JWT_TOKEN
  })
}

// POST: Optional endpoint for server-side booking (fallback)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // If client specifically requests server-side booking
    if (body.useServerSide) {
      return NextResponse.json({
        error: "Server-side booking disabled. Use client-side booking for Vietnam IP.",
        suggestion: "Import { executeClientBooking } from '@/lib/client-tennis-booking'",
        success: false
      }, { status: 400 })
    }

    // Otherwise, provide configuration for client-side usage
    return NextResponse.json({
      config: CONFIG,
      jwtToken: JWT_TOKEN,
      message: "Use client-side booking service"
    })

  } catch (error) {
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    )
  }
}