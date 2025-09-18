// Client-side service to interact with server-side token storage
export interface TokenResponse {
  success: boolean
  hasToken: boolean
  token?: string
  message: string
}

export interface ValidationResponse {
  success: boolean
  isValid: boolean
  username?: string
  message: string
}

export class ClientTokenService {
  /**
   * Store token on server
   */
  static async storeToken(username: string, token: string): Promise<boolean> {
    try {
      const response = await fetch("/api/token/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, token }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("[ClientTokenService] Failed to store token:", error)
      return false
    }
  }

  /**
   * Get token from server
   */
  static async getToken(username: string): Promise<TokenResponse> {
    try {
      const response = await fetch(`/api/token/get?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error("[ClientTokenService] Failed to get token:", error)
      return {
        success: false,
        hasToken: false,
        message: "Failed to get token"
      }
    }
  }

  /**
   * Validate token on server
   */
  static async validateToken(token: string): Promise<ValidationResponse> {
    try {
      const response = await fetch("/api/token/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("[ClientTokenService] Failed to validate token:", error)
      return {
        success: false,
        isValid: false,
        message: "Failed to validate token"
      }
    }
  }

  /**
   * Clear token from server
   */
  static async clearToken(username: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/token/clear?username=${encodeURIComponent(username)}`, {
        method: "DELETE",
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("[ClientTokenService] Failed to clear token:", error)
      return false
    }
  }

  /**
   * Check if user has valid token on server
   */
  static async hasValidToken(username: string): Promise<boolean> {
    try {
      const result = await this.getToken(username)
      return result.success && result.hasToken
    } catch (error) {
      console.error("[ClientTokenService] Failed to check token:", error)
      return false
    }
  }

  /**
   * Get token and validate it
   */
  static async getValidToken(username: string): Promise<string | null> {
    try {
      const tokenResult = await this.getToken(username)
      
      if (!tokenResult.success || !tokenResult.hasToken || !tokenResult.token) {
        return null
      }

      // Validate the token
      const validationResult = await this.validateToken(tokenResult.token)
      
      if (!validationResult.success || !validationResult.isValid) {
        // Token is invalid, clear it
        await this.clearToken(username)
        return null
      }

      return tokenResult.token
    } catch (error) {
      console.error("[ClientTokenService] Failed to get valid token:", error)
      return null
    }
  }
}
