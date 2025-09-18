// Client-side token management service using localStorage
export interface TokenData {
  token: string
  username: string
}

export class TokenService {
  private static readonly STORAGE_KEY = 'vinhomes_tokens'

  /**
   * Store token in localStorage (no expiration)
   */
  static storeToken(username: string, token: string): void {
    try {
      const tokenData: TokenData = {
        token,
        username
      }

      // Get existing tokens
      const existingTokens = this.getAllTokens()
      existingTokens[username] = tokenData

      // Store back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTokens))
      
      console.log(`[TokenService] Token stored for user: ${username} (no expiration)`)
    } catch (error) {
      console.error('[TokenService] Failed to store token:', error)
    }
  }

  /**
   * Get token for username (no expiration check)
   */
  static getToken(username: string): string | null {
    try {
      const tokens = this.getAllTokens()
      const tokenData = tokens[username]

      if (!tokenData) {
        console.log(`[TokenService] No token found for user: ${username}`)
        return null
      }

      // Return token without expiration check
      return tokenData.token
    } catch (error) {
      console.error('[TokenService] Failed to get token:', error)
      return null
    }
  }

  /**
   * Get all stored tokens
   */
  static getAllTokens(): Record<string, TokenData> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('[TokenService] Failed to get all tokens:', error)
      return {}
    }
  }

  /**
   * Get all usernames with tokens (for debugging)
   */
  static getAllUsernames(): string[] {
    try {
      const tokens = this.getAllTokens()
      return Object.keys(tokens)
    } catch (error) {
      console.error('[TokenService] Failed to get usernames:', error)
      return []
    }
  }

  /**
   * Clear token for specific user
   */
  static clearToken(username: string): void {
    try {
      const tokens = this.getAllTokens()
      delete tokens[username]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens))
      console.log(`[TokenService] Token cleared for user: ${username}`)
    } catch (error) {
      console.error('[TokenService] Failed to clear token:', error)
    }
  }

  /**
   * Clear all tokens
   */
  static clearAllTokens(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('[TokenService] All tokens cleared')
    } catch (error) {
      console.error('[TokenService] Failed to clear all tokens:', error)
    }
  }

  /**
   * Check if token exists
   */
  static hasValidToken(username: string): boolean {
    return this.getToken(username) !== null
  }

  /**
   * Get token info (no expiration)
   */
  static getTokenInfo(username: string): { token: string; isValid: boolean } | null {
    try {
      const tokens = this.getAllTokens()
      const tokenData = tokens[username]

      if (!tokenData) return null

      return {
        token: tokenData.token,
        isValid: true // Always valid since no expiration
      }
    } catch (error) {
      console.error('[TokenService] Failed to get token info:', error)
      return null
    }
  }

  /**
   * Clean up expired tokens (no-op since tokens don't expire)
   */
  static cleanupExpiredTokens(): void {
    // No-op since tokens don't expire
    console.log('[TokenService] Token cleanup skipped (tokens don\'t expire)')
  }
}

// Auto-cleanup when module loads (no-op since tokens don't expire)
if (typeof window !== 'undefined') {
  TokenService.cleanupExpiredTokens()
}
