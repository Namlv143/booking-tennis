import crypto from "crypto";
import { NextResponse } from "next/server";


// --- CONFIGURATION - All data is pre-configured for maximum speed ---
const BASE_URL = "https://vh.vinhomes.vn";
const UTILITY_ID = 75;
// const PLACE_ID = 801;
// const PLACE_UTILITY_ID = 625;
// const CLASSIFY_ID = 118;
// const TIME_CONSTRAINT_ID = 571; // Pre-configured time slot

// --- SECRETS (Load from Environment Variables for security) ---
// IMPORTANT: Create a .env.local file for these values
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";

/**
 * Generates the required checksum for the booking payload.
 * @param {object} bookingData - The booking request data.
 * @returns {string} The SHA-256 checksum.
 */
function generateChecksum(bookingData: any) {
 const booking = bookingData.bookingRequests[0];
 const interpolatedString = 
    Number(booking.utilityId) +
    Number(booking.placeId) +
    Number(booking.bookingDate) +
    Number(booking.timeConstraintId) +
    SECRET_KEY;

const checksum = crypto.createHash('sha256').update(interpolatedString).digest('hex');
return checksum;
}
// const generateFromTime = (hour: number, daysToAdd: number): number => {
//  const now = Date.now();
//  const targetDate = new Date(now);
//  targetDate.setDate(targetDate.getDate() + daysToAdd);
//  targetDate.setHours(hour, 0, 0, 0);
//  return targetDate.getTime();
// };
// /**
//  * Generates the booking date timestamp for tomorrow.
//  * @returns {number} Timestamp in milliseconds.
//  */
// function getBookingDate() {
//  // Note: This calculates "tomorrow" based on the server's time.
//  // Ensure your server is set to a timezone that aligns with Vietnam's booking window (e.g., UTC).
//  const tomorrow = new Date();
//  tomorrow.setDate(tomorrow.getDate() + 1);
//  // Set to the beginning of the day in a way that the API expects
//  tomorrow.setHours(0, 0, 0, 0);
//  return tomorrow.getTime();
// }

/**
 * The main API handler for the booking flow.
 */

export async function POST(req: any) {
 const hardcodedToken = process.env.HARDCODED_JWT_TOKEN;
 const { jwtToken, bookingDate, fromTime, bookingTarget, isHardcoded, sessionId } = await req.json();
 const { placeId, placeUtilityId, timeConstraintId, classifyId } = bookingTarget;

 // Use frontend session ID if provided, otherwise generate one
 const requestId = sessionId || `api_${Math.random().toString(36).substring(2, 15)}`;
 console.log(`[Request ${requestId}] Starting booking flow`);

 // Cookie storage for session management - ISOLATED per request
 const cookieStore = new Map<string, string>();

 // Helper function to parse and store cookies from response headers
 const storeCookiesFromResponse = (response: Response) => {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Split by comma, but be careful with date values that contain commas
    const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
    for (const cookie of cookies) {
      // Find the first semicolon to separate name=value from attributes
      const semicolonIndex = cookie.indexOf(';');
      const nameValue = semicolonIndex > 0 ? cookie.substring(0, semicolonIndex) : cookie;
      
      const equalIndex = nameValue.indexOf('=');
      if (equalIndex > 0) {
        const name = nameValue.substring(0, equalIndex).trim();
        const value = nameValue.substring(equalIndex + 1).trim();
        if (name && value) {
          cookieStore.set(name, value);
          console.log(`[Request ${requestId}] Stored cookie: ${name}=${value}`);
        }
      }
    }
  }
 };

 // Helper function to get cookies as string for requests
 const getCookieString = (): string => {
  const cookies = Array.from(cookieStore.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookies) {
    console.log(`[Request ${requestId}] Sending cookies: ${cookies}`);
  }
  return cookies;
 };

 // Helper function to make fetch requests with cookies
 const fetchWithCookies = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const cookieString = getCookieString();
  const headers = {
    "user-agent": "Dart/3.7 (dart:io)",
    "app-version-name": "1.5.5",
    "device-inf": isHardcoded ? "Pixel 6 Google 35" : "PHY110 OPPO 35",
    "accept-language": "vi",
    "x-vinhome-token": isHardcoded ? hardcodedToken : jwtToken,
    "device-id": isHardcoded ? "d4cecbf3a4df9517" : "51a9e0d3fcb8574c",
    "host": "vh.vinhomes.vn",
    "content-type": "application/json; charset=UTF-8",
    "accept-encoding": "gzip, deflate, br",
    "Accept": "*/*",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    ...(cookieString && { cookie: cookieString }),
    ...options.headers,
  };

  console.log(`[Request ${requestId}] Making request to: ${url}`);
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Store cookies from response
  storeCookiesFromResponse(response);
  return response;
 };

 try {
  // Function to log cookies for debugging
  // const logCookies = (step: string, response: Response) => {
  //   const setCookieHeader = response.headers.get('set-cookie');
  //   if (setCookieHeader) {
  //     console.log(`${step} - Received cookies:`, setCookieHeader);
  //   }
    
  //   // Log all cookies currently stored
  //   const cookieString = getCookieString();
  //   if (cookieString) {
  //     console.log(`${step} - Cookie store contents:`, cookieString);
  //   }
  // };

  // === Step 1: Get Time Slots to extract `fromTime` ===
  const timeSlotsUrl = new URL(`${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time`);
  timeSlotsUrl.searchParams.set('bookingDate', bookingDate.toString());
  
  const timeSlotsResponse = await fetchWithCookies(timeSlotsUrl.toString());

  // === Step 2: Get Classifies (API call is required by the server) ===
  const classifiesUrl = new URL(`${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies`);
  classifiesUrl.searchParams.set('timeConstraintId', timeConstraintId.toString());
  classifiesUrl.searchParams.set('monthlyTicket', 'false');
  classifiesUrl.searchParams.set('fromTime', fromTime.toString());
  
  await fetchWithCookies(classifiesUrl.toString());

  // === Step 3: Get Places (API call is required by the server) ===
  // console.log(`[Request ${requestId}] Step 3: Getting places`);
  // const placesUrl = new URL(`${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/places`);
  // placesUrl.searchParams.set('classifyId', classifyId.toString());
  // placesUrl.searchParams.set('fromTime', fromTime.toString());
  // placesUrl.searchParams.set('timeConstraintId', timeConstraintId.toString());
  // placesUrl.searchParams.set('monthlyTicket', 'false');
  
  // const placesResponse = await fetchWithCookies(placesUrl.toString());

  // === Step 4: Get Ticket Info (Final validation step) ===
  const ticketInfoUrl = new URL(`${BASE_URL}/api/vhr/utility/v0/utility/ticket-info`);
  ticketInfoUrl.searchParams.set('bookingDate', bookingDate.toString());
  ticketInfoUrl.searchParams.set('placeUtilityId', placeUtilityId.toString());
  ticketInfoUrl.searchParams.set('timeConstraintId', timeConstraintId.toString());
  
  await fetchWithCookies(ticketInfoUrl.toString());

  // === Step 5: Make Final Booking ===
  const bookingData: any = {
   bookingRequests: [
    {
     bookingDate: bookingDate,
     placeId: placeId,
     timeConstraintId: timeConstraintId,
     utilityId: UTILITY_ID,
     residentTicket: 4,
     residentChildTicket: null,
     guestTicket: null,
     guestChildTicket: null,
    },
   ],
   paymentMethod: null,
   vinClubPoint: null,
   deviceType: "ANDROID",
   
  };
  bookingData.cs = `${generateChecksum(bookingData)}`;

  const finalBookingResponse = await fetchWithCookies(
   `${BASE_URL}/api/vhr/utility/v0/customer-utility/booking`,
   {
    method: 'POST',
    body: JSON.stringify(bookingData),
   }
  );

  // Extract response data
  const responseData = await finalBookingResponse.json();

  // Check if booking was successful
  const isSuccess = finalBookingResponse.status >= 200 && finalBookingResponse.status < 300;
  
  console.log(`[Request ${requestId}] Booking completed - Success: ${isSuccess}`);
  
  // ✅ Success!
  return NextResponse.json({
   success: isSuccess,
   message: isSuccess ? "Booking flow completed!" : 'fAILED',
   data: responseData,
   error: {
    message: responseData?.message,
   },
  });
 } catch (error: any) {
  console.error(`[Request ${requestId}] Booking Flow Failed:`, error);
  return NextResponse.json(
   {
    success: false,
    message: error.message || "An error occurred during booking",
    error: error.message,
   },
   { status: 500 }
  );
 }
}
