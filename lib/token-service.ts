// Client-side token management service using localStorage
export interface TokenData {
  token: string
  expires: number
  username: string
}

export class TokenService {
  private static readonly STORAGE_KEY = 'vinhomes_tokens'

  /**
   * Store token in localStorage
   */
  static storeToken(username: string, token: string): void {
    try {
      // Extract expiration from JWT token
      let expires: number
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        expires = payload.exp * 1000 // Convert to milliseconds
      } catch (error) {
        console.warn('Failed to parse token expiration, using 24-hour default')
        expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours default
      }

      const tokenData: TokenData = {
        token,
        expires,
        username
      }

      // Get existing tokens
      const existingTokens = this.getAllTokens()
      existingTokens[username] = tokenData

      // Store back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingTokens))
      
      console.log(`[TokenService] Token stored for user: ${username}, expires: ${new Date(expires).toISOString()}`)
    } catch (error) {
      console.error('[TokenService] Failed to store token:', error)
    }
  }

  /**
   * Get valid token for username
   */
  static getToken(username: string): string | null {
    try {
      const tokens = this.getAllTokens()
      const tokenData = tokens[username]

      if (!tokenData) {
        console.log(`[TokenService] No token found for user: ${username}`)
        return null
      }

      // Check if token is expired
      if (Date.now() > tokenData.expires) {
        this.clearToken(username)
        console.log(`[TokenService] Token expired for user: ${username}`)
        return null
      }

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
   * Check if token exists and is valid
   */
  static hasValidToken(username: string): boolean {
    return this.getToken(username) !== null
  }

  /**
   * Get token expiration info
   */
  static getTokenInfo(username: string): { token: string; expires: Date; isValid: boolean } | null {
    try {
      const tokens = this.getAllTokens()
      const tokenData = tokens[username]

      if (!tokenData) return null

      const isValid = Date.now() <= tokenData.expires
      return {
        token: tokenData.token,
        expires: new Date(tokenData.expires),
        isValid
      }
    } catch (error) {
      console.error('[TokenService] Failed to get token info:', error)
      return null
    }
  }

  /**
   * Clean up expired tokens
   */
  static cleanupExpiredTokens(): void {
    try {
      const tokens = this.getAllTokens()
      const now = Date.now()
      let cleaned = false

      Object.keys(tokens).forEach(username => {
        if (now > tokens[username].expires) {
          delete tokens[username]
          cleaned = true
        }
      })

      if (cleaned) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens))
        console.log('[TokenService] Expired tokens cleaned up')
      }
    } catch (error) {
      console.error('[TokenService] Failed to cleanup expired tokens:', error)
    }
  }
}

// Auto-cleanup expired tokens when module loads
if (typeof window !== 'undefined') {
  TokenService.cleanupExpiredTokens()
}
