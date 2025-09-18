import { NextResponse } from 'next/server'
import { getVietnamTime } from '@/lib/booking-config'

export async function GET() {
  try {
    const vietnamTime = getVietnamTime()
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working!',
      timestamp: vietnamTime.toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
      source: 'Test API',
      status: 'Ready for cron job'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Test endpoint failed',
        error: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
