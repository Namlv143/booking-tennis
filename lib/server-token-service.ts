// Server-side token management service
export interface ServerTokenData {
  token: string
  username: string
  createdAt: number
  lastAccessed: number
}

// In-memory token storage (in production, use Redis or database)
const tokenStorage = new Map<string, ServerTokenData>()

export class ServerTokenService {
  /**
   * Store token on server
   */
  static storeToken(username: string, token: string): void {
    const tokenData: ServerTokenData = {
      token,
      username,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    }
    
    tokenStorage.set(username, tokenData)
    console.log(`[ServerTokenService] Token stored for user: ${username}`)
  }

  /**
   * Get token from server
   */
  static getToken(username: string): string | null {
    const tokenData = tokenStorage.get(username)
    
    if (!tokenData) {
      console.log(`[ServerTokenService] No token found for user: ${username}`)
      return null
    }

    // Update last accessed time
    tokenData.lastAccessed = Date.now()
    tokenStorage.set(username, tokenData)
    
    return tokenData.token
  }

  /**
   * Check if token exists on server
   */
  static hasToken(username: string): boolean {
    return tokenStorage.has(username)
  }

  /**
   * Get token info
   */
  static getTokenInfo(username: string): ServerTokenData | null {
    return tokenStorage.get(username) || null
  }

  /**
   * Clear token from server
   */
  static clearToken(username: string): void {
    tokenStorage.delete(username)
    console.log(`[ServerTokenService] Token cleared for user: ${username}`)
  }

  /**
   * Clear all tokens
   */
  static clearAllTokens(): void {
    tokenStorage.clear()
    console.log(`[ServerTokenService] All tokens cleared`)
  }

  /**
   * Validate token and return user info
   */
  static validateToken(token: string): { isValid: boolean; username?: string } {
    for (const [username, tokenData] of tokenStorage.entries()) {
      if (tokenData.token === token) {
        // Update last accessed time
        tokenData.lastAccessed = Date.now()
        tokenStorage.set(username, tokenData)
        
        return { isValid: true, username }
      }
    }
    
    return { isValid: false }
  }

  /**
   * Get all tokens (for debugging)
   */
  static getAllTokens(): Record<string, ServerTokenData> {
    return Object.fromEntries(tokenStorage.entries())
  }

  /**
   * Clean up old tokens (optional - for memory management)
   */
  static cleanupOldTokens(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [username, tokenData] of tokenStorage.entries()) {
      if (now - tokenData.lastAccessed > maxAge) {
        tokenStorage.delete(username)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ServerTokenService] Cleaned up ${cleaned} old tokens`)
    }
  }
}
