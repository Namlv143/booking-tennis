import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[TEST-TOKEN] Checking stored token...');
    
    const storedToken = process.env.VINHOMES_TOKEN;
    
    if (!storedToken) {
      console.log('[TEST-TOKEN] ❌ NO STORED TOKEN FOUND');
      console.log('[TEST-TOKEN] Available env vars:', Object.keys(process.env).filter(key => key.includes('VINHOMES')));
      
      return NextResponse.json({
        success: false,
        message: 'No stored token found',
        error: 'VINHOMES_TOKEN environment variable not set',
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('VINHOMES'))
      }, { status: 400 });
    }

    console.log('[TEST-TOKEN] ✅ STORED TOKEN FOUND - length:', storedToken.length);
    console.log('[TEST-TOKEN] Token prefix:', storedToken.substring(0, 10) + '...');
    
    return NextResponse.json({
      success: true,
      message: 'Stored token found and ready',
      tokenLength: storedToken.length,
      tokenPrefix: storedToken.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[TEST-TOKEN] ❌ Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking token',
      error: String(error)
    }, { status: 500 });
  }
}
