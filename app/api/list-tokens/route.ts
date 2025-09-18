import { NextResponse } from "next/server"
import { TokenService } from "@/lib/token-service"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[List Tokens] Getting all stored tokens...')

    // Get all tokens
    const allTokens = TokenService.getAllTokens()
    const usernames = TokenService.getAllUsernames()

    console.log(`[List Tokens] Found ${usernames.length} stored tokens`)

    // Prepare response data
    const tokenList = usernames.map(username => {
      const tokenData = allTokens[username]
      return {
        username,
        hasToken: !!tokenData?.token,
        tokenLength: tokenData?.token?.length || 0,
        tokenPreview: tokenData?.token ? tokenData.token.substring(0, 20) + "..." : null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Found ${usernames.length} stored tokens`,
      totalTokens: usernames.length,
      tokens: tokenList
    })

  } catch (error) {
    console.error('[List Tokens] Error:', error)
    return NextResponse.json({
      success: false,
      message: "Error listing tokens",
      error: String(error)
    }, { status: 500 })
  }
}
