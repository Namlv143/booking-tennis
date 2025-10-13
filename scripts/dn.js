#!/usr/bin/env node

const crypto = require('crypto');
const axios = require('axios');

// Configuration constants
const BASE_URL = "https://vh.vinhomes.vn";
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
const UTILITY_ID = 75;
const CLASSIFY_ID = 118;

// Optimized axios instance with connection pooling and timeouts
const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'user-agent': 'Dart/3.9 (dart:io)',
    'app-version-name': '1.5.6',
    'device-inf': 'PHY110 OPPO 35',
    'accept-language': 'vi',
    'device-id': '51a9e0d3fcb8574c',
    'host': 'vh.vinhomes.vn',
    'content-type': 'application/json; charset=UTF-8'
  },
  maxRedirects: 3,
  validateStatus: (status) => status < 500
});

// Pre-computed constants
const ONE_DAY_MS = 86400000;

// Helper functions
const getMethodSpecificHeaders = (method) => {
  if (method === 'POST') {
    return {
      'Connection': 'keep-alive',
      'accept-encoding': 'gzip deflate br'
    };
  }
  return {
    'accept-encoding': 'gzip'
  };
};

function getHeaders(method = 'GET', jwtToken) {
  return {
    'x-vinhome-token': jwtToken,
    ...getMethodSpecificHeaders(method)
  };
}

function getBookingDate() {
  return Date.now() + ONE_DAY_MS;
}

function generateFromTime(bookingHour) {
  const tomorrow = Date.now() + ONE_DAY_MS;
  const tomorrowDate = new Date(tomorrow);
  tomorrowDate.setHours(bookingHour, 0, 0, 0);
  return tomorrowDate.getTime();
}

function generateChecksum(bookingData) {
  const booking = bookingData.bookingRequests[0];
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId;
  
  const hash = crypto.createHash('sha256');
  hash.update(numericSum.toString());
  hash.update(SECRET_KEY);
  
  return hash.digest('hex');
}

// HTTP request handler
async function makeServerRequest(method, endpoint, jwtToken, data, params) {
  const headers = getHeaders(method, jwtToken);

  try {
    const response = await httpClient({
      method,
      url: endpoint,
      headers,
      data,
      params,
    });
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return { 
          error: `HTTP ${error.response.status}`, 
          api_response: error.response.data 
        };
      } else if (error.request) {
        return { error: 'No response from server', details: error.message };
      }
    }
    return { error: String(error) };
  }
}

// Endpoints
const ENDPOINTS = {
  SLOT: `/api/vhr/utility/v0/utility/75/booking-time`,
  CLASSIFIES: `/api/vhr/utility/v0/utility/75/classifies`,
  PLACES: `/api/vhr/utility/v0/utility/75/places`,
  TICKET_INFO: "/api/vhr/utility/v0/utility/ticket-info",
  BOOKING: "/api/vhr/utility/v0/customer-utility/booking"
};

// API functions
async function getSlot(bookingDate, jwtToken) {
  const params = { bookingDate };
  return await makeServerRequest('GET', ENDPOINTS.SLOT, jwtToken, undefined, params);
}

async function classifies(fromTime, timeConstraintId, jwtToken) {
  const params = {
    timeConstraintId,
    monthlyTicket: 'false',
    fromTime,
  };
  return await makeServerRequest('GET', ENDPOINTS.CLASSIFIES, jwtToken, undefined, params);
}

async function getPlaces(fromTime, timeConstraintId, jwtToken) {
  const params = {
    classifyId: CLASSIFY_ID,
    fromTime,
    timeConstraintId,
    monthlyTicket: 'false'
  };
  return await makeServerRequest('GET', ENDPOINTS.PLACES, jwtToken, undefined, params);
}

async function getTicketInfo(bookingDate, placeUtilityId, timeConstraintId, jwtToken) {
  const params = {
    bookingDate,
    placeUtilityId,
    timeConstraintId
  };
  return await makeServerRequest('GET', ENDPOINTS.TICKET_INFO, jwtToken, undefined, params);
}

async function makeBooking(bookingDate, placeId, timeConstraintId, jwtToken) {
  const bookingData = {
    bookingRequests: [{
      bookingDate,
      placeId,
      timeConstraintId,
      utilityId: UTILITY_ID,
      residentTicket: 4,
      residentChildTicket: null,
      guestTicket: null,
      guestChildTicket: null,
    }],
    paymentMethod: null,
    vinClubPoint: null,
    deviceType: "ANDROID"
  };

  bookingData.cs = generateChecksum(bookingData);

  return await makeServerRequest('POST', ENDPOINTS.BOOKING, jwtToken, bookingData);
}

// Combined approach with normal distribution and occasional longer pauses
const smartDelay = (baseMs = 200, variationMs = 100) => {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const randNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // 5% chance of much longer pause (simulating thinking/distraction)
  const extraPause = Math.random() < 0.05 ? Math.random() * 1000 : 0;
  
  const ms = Math.max(50, baseMs + variationMs * randNormal + extraPause);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Main booking function
async function executeBooking(jwtToken, bookingParams) {
  try {
    const { placeId, placeUtilityId, timeConstraintId, bookingHour } = bookingParams;
    const bookingDate = getBookingDate();
    const fromTime = generateFromTime(bookingHour);

    console.log('Booking date:', bookingDate);
    console.log('From time:', fromTime);

    // Step 1: Get slot
    
    const slotResult = await getSlot(bookingDate, jwtToken);
    if (slotResult.error) {
      return { error: "Step 1 (get_slot) failed", data: slotResult, success: false };
    }
    console.log('[1/5] Getted slot...');
    await smartDelay(200, 100);

    // Step 2: Get classifies
    const classifiesResult = await classifies(fromTime, timeConstraintId, jwtToken);
    if (classifiesResult.error) {
      return { error: "Step 2 (get_classifies) failed", data: classifiesResult, success: false };
    }
    console.log('[2/5] Getted classifies...');

    await smartDelay(150, 80);

    // Step 3: Get places
    const placesResult = await getPlaces(fromTime, timeConstraintId, jwtToken);
    if (placesResult.error) {
      return { error: "Step 3 (get_places) failed", data: placesResult, success: false };
    }
    console.log('[3/5] Getted places...');

    await smartDelay(200, 400);

    // Step 4: Get ticket info
    const ticketInfoResult = await getTicketInfo(bookingDate, placeUtilityId, timeConstraintId, jwtToken);
    if (ticketInfoResult.error) {
      return { error: "Step 4 (get_ticket_info) failed", data: ticketInfoResult, success: false };
    }
    console.log('[4/5] Getted ticket info...');

    await smartDelay(150, 300);

    // Step 5: Make booking
    console.log('[5/5] Making booking...');
    const bookingResult = await makeBooking(bookingDate, placeId, timeConstraintId, jwtToken);
    if (bookingResult.error) {
      return { error: "Booking failed", data: bookingResult, success: false };
    }

    return { success: true, data: bookingResult };

  } catch (error) {
    return { error: String(error), success: false };
  }
}

// Booking presets for easy access
const PRESETS = {
  's168': {
    name: 'S168',
    placeId: 801,
    placeUtilityId: 625,
    timeConstraintId: 575,
    bookingHour: 18
  },
  's268': {
    name: 'S268',
    placeId: 802,
    placeUtilityId: 626,
    timeConstraintId: 575,
    bookingHour: 18
  },
  's189': {
    name: 'S189',
    placeId: 801,
    placeUtilityId: 625,
    timeConstraintId: 575,
    bookingHour: 20
  },
  's289': {
    name: 'S289',
    placeId: 802,
    placeUtilityId: 626,
    timeConstraintId: 576,
    bookingHour: 20
  },
  's110': {
    name: 'S110',
    placeId: 801,
    placeUtilityId: 625,
    timeConstraintId: 571,
    bookingHour: 10
  }
};

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  // Check if using preset (format: <token> <preset_name>)
  let config;
  if (args.length === 2 && PRESETS[args[1].toLowerCase()]) {
    const preset = PRESETS[args[1].toLowerCase()];
    console.log(`  Place ID: ${preset.placeId}`);
    console.log(`  Place Utility ID: ${preset.placeUtilityId}`);
    console.log(`  Time Constraint ID: ${preset.timeConstraintId}`);
    console.log(`  Booking Hour: ${preset.bookingHour}:00`);    
    config = {
      token: args[0],
      ...preset
    };
  } else {
    // Parse command line arguments or use environment variables
    config = {
      token: args[0] || process.env.JWT_TOKEN,
      placeId: parseInt(args[1]) || parseInt(process.env.PLACE_ID),
      placeUtilityId: parseInt(args[2]) || parseInt(process.env.PLACE_UTILITY_ID),
      timeConstraintId: parseInt(args[3]) || parseInt(process.env.TIME_CONSTRAINT_ID),
      bookingHour: parseInt(args[4]) || parseInt(process.env.BOOKING_HOUR) || 6
    };
  }

  const result = await executeBooking(config.token, {
    placeId: config.placeId,
    placeUtilityId: config.placeUtilityId,
    timeConstraintId: config.timeConstraintId,
    bookingHour: config.bookingHour
  });

  console.log('=== Result ===');
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('🎾 Booking successful! 🎾');
    process.exit(0);
  } else {
    console.log('❌ Booking failed!');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use as a module
module.exports = {
  executeBooking,
  getSlot,
  classifies,
  getPlaces,
  getTicketInfo,
  makeBooking
};

