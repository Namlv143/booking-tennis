import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
// Define runtime configuration for Edge Function
export const runtime = 'edge'

export async function GET() {
  try {
    console.log('[TEST] Manual booking test triggered')
    
    // Call the cron booking endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/cron/booking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Test booking triggered',
      result: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[TEST] Test booking error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Test booking failed',
        error: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
