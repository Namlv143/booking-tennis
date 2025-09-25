// Tennis Booking API Bypass Solution
const crypto = require('crypto');
const axios = require('axios');

/**
 * Vinhomes Tennis Booking API Client with Anti-Bot Protection Bypass
 */
class VinhomesTennisBookingClient {
  /**
   * Initialize the client
   * @param {string} accessToken - JWT access token
   * @param {string} deviceId - Optional device ID (will generate one if not provided)
   */
  constructor(accessToken, deviceId = null) {
    this.baseUrl = 'https://vh.vinhomes.vn/api/vhr';
    this.accessToken = accessToken;
    this.deviceId = deviceId || this._generateDeviceId();
  }

  /**
   * Generate a random device ID
   * @returns {string} - A device ID
   * @private
   */
  _generateDeviceId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Calculate checksum for request validation
   * @param {Object} bookingData - The booking data
   * @returns {string} - Calculated checksum
   * @private
   */
  _calculateChecksum(bookingData) {
    // Using the confirmed checksum algorithm from reverse engineering
    
    // Extract key components from the booking request
    const { bookingRequests } = bookingData;
    if (!bookingRequests || !bookingRequests.length) {
      throw new Error('Invalid booking data structure');
    }
    
    // Get the first booking request
    const firstRequest = bookingRequests[0];
    
    // Extract required values
    const utilityId = firstRequest.utilityId || 75; // Tennis court ID
    const placeId = firstRequest.placeId;
    
    // Convert bookingDate to timestamp if it's in YYYY-MM-DD format
    let bookingTimestamp = firstRequest.bookingDate;
    if (typeof bookingTimestamp === 'string' && bookingTimestamp.includes('-')) {
      bookingTimestamp = new Date(bookingTimestamp).getTime();
    }
    
    const timeConstraintId = firstRequest.timeConstraintId;
    
    // Create the interpolated string with the secret key
    const interpolatedString = 
      Number(utilityId) +
      Number(placeId) +
      Number(bookingTimestamp) +
      Number(timeConstraintId) +
      "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
    
    // Calculate SHA-256 hash
    return crypto.createHash('sha256')
      .update(interpolatedString)
      .digest('hex');
  }

  /**
   * Get required headers for API requests
   * @returns {Object} - Headers object
   * @private
   */
  _getHeaders() {
    // Combine app-specific headers with real browser headers for better Cloudflare bypass
    return {
      // Authentication headers
      'Authorization': `Bearer ${this.accessToken}`,
      'x-vinhomes-token': this.accessToken,
      
      // App-specific headers
      'app-version-name': '1.5.5',
      'device-inf': 'Pixel 6 Google 35',
      'device-id': this.deviceId,
      
      // Real browser headers to bypass Cloudflare
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json; charset=UTF-8',
      'Origin': 'https://vh.vinhomes.vn',
      'Referer': 'https://vh.vinhomes.vn/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'host': 'vh.vinhomes.vn'
    };
  }

  /**
   * Book a tennis court
   * @param {string} bookingDate - Booking date in YYYY-MM-DD format
   * @param {string|number} placeId - Place ID
   * @param {string|number} timeConstraintId - Time constraint ID
   * @param {number} residentTicket - Number of resident tickets (default: 4)
   * @returns {Promise<Object>} - Booking response
   */
  async bookTennisCourt(bookingDate, placeId, timeConstraintId, residentTicket = 4) {
    try {
      // Create the booking request structure
      const bookingData = {
        bookingRequests: [
          {
            bookingDate,
            placeId,
            timeConstraintId,
            utilityId: 75, // Tennis court ID
            residentTicket,
            residentChildTicket: null,
            guestTicket: null,
            guestChildTicket: null
          }
        ],
        paymentMethod: null,
        vinClubPoint: null,
        deviceType: "ANDROID"
      };
      
      // Calculate and add the checksum
      bookingData.cs = this._calculateChecksum(bookingData);
      
      // Make the booking request
      const url = `${this.baseUrl}/utility/v0/customer-utility/booking`;
      const headers = this._getHeaders();
      
      const response = await axios.post(url, bookingData, { headers });
      
      // Check if we got an anti-bot protection error (1321)
      if (response.data && response.data.code === '1321') {
        console.log('Anti-bot protection triggered. Retrying with modified request...');
        
        // Modify the request to bypass protection
        return await this._retryWithBypass(bookingData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error booking tennis court:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Retry the booking request with modified parameters to bypass protection
   * @param {Object} originalBookingData - The original booking data
   * @returns {Promise<Object>} - Booking response
   * @private
   */
  async _retryWithBypass(originalBookingData) {
    try {
      // Create a modified copy of the booking data
      const modifiedBookingData = JSON.parse(JSON.stringify(originalBookingData));
      
      // Add additional fields to bypass protection
      modifiedBookingData.deviceInfo = {
        deviceId: this.deviceId,
        osVersion: 'Android 14',
        appVersion: '1.5.5',
        model: 'Pixel 6',
        manufacturer: 'Google',
        platform: 'android'
      };
      
      // Add timestamp to prevent replay attacks
      modifiedBookingData.timestamp = Date.now();
      
      // Add fingerprint data that might be used for bot detection
      modifiedBookingData.fingerprint = {
        screenWidth: 1080,
        screenHeight: 2400,
        deviceMemory: 8,
        hardwareConcurrency: 8,
        timezone: "Asia/Ho_Chi_Minh",
        language: "vi-VN",
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      };
      
      // Get the first booking request
      const firstRequest = modifiedBookingData.bookingRequests[0];
      
      // Extract required values for checksum calculation
      const utilityId = firstRequest.utilityId || 75;
      const placeId = firstRequest.placeId;
      let bookingTimestamp = firstRequest.bookingDate;
      if (typeof bookingTimestamp === 'string' && bookingTimestamp.includes('-')) {
        bookingTimestamp = new Date(bookingTimestamp).getTime();
      }
      const timeConstraintId = firstRequest.timeConstraintId;
      
      // Recalculate checksum
      const interpolatedString = 
        Number(utilityId) +
        Number(placeId) +
        Number(bookingTimestamp) +
        Number(timeConstraintId) +
        "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
      
      modifiedBookingData.cs = crypto.createHash('sha256')
        .update(interpolatedString)
        .digest('hex');
      
      // Add headers to bypass Cloudflare protection
      const headers = this._getHeaders();
      
      // Add browser fingerprinting headers
      headers['x-app-id'] = 'com.vinhomes.resident';
      headers['x-source'] = 'mobile_app';
      headers['x-timestamp'] = Date.now().toString();
      
      // Add cookie-like headers that Cloudflare might expect
      headers['Cookie'] = `cf_clearance=${crypto.randomBytes(16).toString('hex')}; _ga=GA1.1.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now()/1000 - Math.random() * 10000000)}`;
      
      // Generate a nonce for request signing
      const nonce = crypto.randomBytes(8).toString('hex');
      headers['x-nonce'] = nonce;
      
      // Create a signature using HMAC-SHA256
      const message = `${headers['x-timestamp']}${this.deviceId}${nonce}`;
      const signature = crypto.createHmac('sha256', 'vinhomes_mobile_app')
        .update(message)
        .digest('base64');
      headers['x-signature'] = signature;
      
      // Add random request ID to mimic app behavior
      headers['x-request-id'] = crypto.randomUUID();
      
      // Make the modified booking request
      const url = `${this.baseUrl}/utility/v0/customer-utility/booking`;
      const response = await axios.post(url, modifiedBookingData, { headers });
      
      return response.data;
    } catch (error) {
      console.error('Error in retry attempt:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
}

// Example usage
async function bookTennis() {
  try {
    // Initialize with your access token
    const client = new VinhomesTennisBookingClient('YOUR_ACCESS_TOKEN');
    
    // Book a tennis court
    const result = await client.bookTennisCourt(
      '2025-09-26',  // bookingDate
      '123',         // placeId
      '456',         // timeConstraintId
      4              // residentTicket
    );
    
    console.log('Booking result:', result);
  } catch (error) {
    console.error('Booking failed:', error);
  }
}

module.exports = VinhomesTennisBookingClient;
