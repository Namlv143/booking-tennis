import { NextResponse } from "next/server";

// --- INTERFACES ---
interface BookingDetails {
  jwtToken: string;
  placeId: number;
  placeUtilityId: number;
  timeConstraintId: number;
  classifyId: number;
}

interface BookingPayload {
  bookingRequests: {
    bookingDate: number;
    placeId: number;
    timeConstraintId: number;
    utilityId: number;
    residentTicket: number;
    residentChildTicket: null;
    guestTicket: null;
    guestChildTicket: null;
  }[];
  paymentMethod: null;
  vinClubPoint: null;
  deviceType: string;
  cs?: string;
}

// --- CONSTANTS ---
const BASE_URL = "https://vh.vinhomes.vn";
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
const UTILITY_ID = 75;
const RESIDENT_TICKET_COUNT = 4;
const DEVICE_TYPE = "ANDROID";

// --- OPTIMIZED FUNCTIONS ---

// Cache headers object to avoid recreation
const getHeaders = (jwtToken: string): Record<string, string> => {
  return {
    "user-agent": "Dart/3.7 (dart:io)",
    "app-version-name": "1.5.5",
    "device-inf": "PHY110 OPPO 35",
    "accept-language": "vi",
    "x-vinhome-token": jwtToken,
    "device-id": "51a9e0d3fcb8574c",
    host: "vh.vinhomes.vn",
    "content-type": "application/json; charset=UTF-8",
    "accept-encoding": "gzip",
  };
};

// Optimized date calculations with caching
let _cachedBookingDate: number | null = null;
let _cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

const getBookingDate = (): number => {
  const now = Date.now();
  
  // Return cached value if still valid
  if (_cachedBookingDate && (now - _cacheTimestamp) < CACHE_DURATION) {
    return _cachedBookingDate;
  }
  
  // Get current date and adjust to Vietnam time (UTC+7)
  const vietnamTime = new Date(now + 7 * 60 * 60 * 1000);
  
  // Get tomorrow's date
  const tomorrow = new Date(vietnamTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set time to 8:30 AM specifically (original design)
  tomorrow.setHours(8, 30, 0, 0);
  
  _cachedBookingDate = tomorrow.getTime();
  _cacheTimestamp = now;
  
  return _cachedBookingDate;
};

const generateFromTime = (hour: number, daysToAdd: number): number => {
  const now = Date.now();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(hour, 0, 0, 0);
  return targetDate.getTime();
};

// Pre-create TextEncoder instance to avoid recreation
const textEncoder = new TextEncoder();

const generateChecksum = async (payload: BookingPayload): Promise<string> => {
  const booking = payload.bookingRequests[0];
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId;
  const interpolatedString = `${numericSum}${SECRET_KEY}`;
  
  // Use pre-created encoder (performance optimization)
  const data = textEncoder.encode(interpolatedString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Exact same logic as original - Array.from().map().join()
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Optimized fetch with proper error handling and timeout
const makeStateUpdateCall = async (
  endpoint: string, 
  params: Record<string, any>, 
  jwtToken: string,
  timeoutMs: number = 5000
): Promise<void> => {
  const url = new URL(endpoint, BASE_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { 
      method: 'GET', 
      headers: getHeaders(jwtToken), 
      cache: 'no-store',
      signal: controller.signal
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // Only log errors, not successful requests
      console.error(`❌ ${endpoint}: ${response.status} - ${errorText}`);
      throw new Error(`State update call failed for ${endpoint}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // No success logging for performance
  } catch (error) {
    // Only log the actual error, not redundant info
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const executeBookingFlow = async (details: BookingDetails): Promise<any> => {
  const bookingDate = getBookingDate();
  const fromTime = generateFromTime(18, 1);
  const { timeConstraintId, classifyId, placeUtilityId, placeId, jwtToken } = details;
  
  // SAFE SEQUENTIAL: Server expects step-by-step session state updates
  // These calls update server-side session state and must be done in order
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time`, { bookingDate }, jwtToken);
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies`, { timeConstraintId, monthlyTicket: false, fromTime }, jwtToken);
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/places`, { classifyId, timeConstraintId, monthlyTicket: false, fromTime }, jwtToken);
  await makeStateUpdateCall('/api/vhr/utility/v0/utility/ticket-info', { bookingDate, placeUtilityId, timeConstraintId }, jwtToken);

  // Pre-build payload structure
  const payload: BookingPayload = {
    bookingRequests: [{
      bookingDate,
      placeId,
      timeConstraintId,
      utilityId: UTILITY_ID,
      residentTicket: RESIDENT_TICKET_COUNT,
      residentChildTicket: null, 
      guestTicket: null, 
      guestChildTicket: null,
    }],
    paymentMethod: null, 
    vinClubPoint: null, 
    deviceType: DEVICE_TYPE,
  };
  
  // Generate checksum
  payload.cs = await generateChecksum(payload);
  
  // Final booking request with timeout and better error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(
      new URL('/api/vhr/utility/v0/customer-utility/booking', BASE_URL), 
      { 
        method: 'POST', 
        headers: getHeaders(jwtToken), 
        body: JSON.stringify(payload), 
        cache: 'no-store',
        signal: controller.signal
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Final booking failed with status ${response.status}: ${errorText}`);
    }
    
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- OPTIMIZED POST HANDLER ---
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Early validation and parsing
    const body = await request.json();
    // Minimal logging for performance
    
    // Fast validation
    const { jwtToken, bookingTarget } = body;
    if (!jwtToken || !bookingTarget) {
      return NextResponse.json(
        { message: "Missing required fields: jwtToken or bookingTarget" }, 
        { status: 400 }
      );
    }

    // Pre-validate required booking target fields
    const requiredFields = ['placeId', 'placeUtilityId', 'timeConstraintId', 'classifyId'];
    for (const field of requiredFields) {
      if (bookingTarget[field] === undefined || bookingTarget[field] === null) {
        return NextResponse.json(
          { message: `Missing required booking target field: ${field}` }, 
          { status: 400 }
        );
      }
    }
    
    const bookingDetails: BookingDetails = {
      jwtToken,
      placeId: bookingTarget.placeId,
      placeUtilityId: bookingTarget.placeUtilityId,
      timeConstraintId: bookingTarget.timeConstraintId,
      classifyId: bookingTarget.classifyId,
    };

    const results = await executeBookingFlow(bookingDetails);
    
    const processingTime = Date.now() - startTime;
    // Only log completion time, not detailed results for performance

    return NextResponse.json({
      ...results,
      _metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    console.error(`❌ Error in POST handler after ${processingTime}ms:`, errorMessage);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        statusCode = 504; // Gateway Timeout
      } else if (error.message.includes('State update call failed')) {
        statusCode = 502; // Bad Gateway
      } else if (error.message.includes('Final booking failed')) {
        statusCode = 503; // Service Unavailable
      }
    }
    
    return NextResponse.json({ 
      message: "Internal server error: " + errorMessage,
      _metadata: {
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    }, { status: statusCode });
  }
}