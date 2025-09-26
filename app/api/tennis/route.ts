import axios from "axios";
import { HttpsCookieAgent } from "http-cookie-agent/http";
import { CookieJar } from "tough-cookie";
import crypto from "crypto";
import { NextResponse } from "next/server";
import http from 'http';
const HttpAgent = require('agentkeepalive').HttpAgent;

const keepaliveAgent = new HttpAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});


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
async function generateChecksum(bookingData: any) {
 const booking = bookingData.bookingRequests[0];
 const numericSum =
  booking.utilityId +
  booking.placeId +
  booking.bookingDate +
  booking.timeConstraintId;
 const interpolatedString = `${numericSum}${SECRET_KEY}`;

 const encoder = new TextEncoder();
 const data = encoder.encode(interpolatedString);
 const hashBuffer = await crypto.subtle.digest("SHA-256", data);
 const hashArray = Array.from(new Uint8Array(hashBuffer));
 return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
 const { jwtToken, bookingDate, fromTime, bookingTarget, isHardcoded } = await req.json();
 const { placeId, placeUtilityId, timeConstraintId, classifyId } = bookingTarget;

 // Best Practice: Create a new session for each API call to keep user sessions isolated.
 const cookieJar = new CookieJar();
 const sessionClient = axios.create({
  httpAgent: keepaliveAgent,
  httpsAgent: new HttpsCookieAgent({ 
    cookies: { jar: cookieJar },
    // Tích hợp agentkeepalive vào bên trong HttpsCookieAgent
    ...keepaliveAgent.options 
}),  headers: {
   "user-agent": "Dart/3.7 (dart:io)",
   "app-version-name": "1.5.5",
   "device-inf": isHardcoded ? "Pixel 6 Google 35" : "PHY110 OPPO 35",
   "accept-language": "vi",
   "x-vinhome-token": isHardcoded ? hardcodedToken : jwtToken,
   "device-id": isHardcoded ? "d4cecbf3a4df9517" : "51a9e0d3fcb8574c",
   host: "vh.vinhomes.vn",
   "content-type": "application/json; charset=UTF-8",
   "accept-encoding": "gzip, deflate, br",
  },
 });

 try {

  // === Step 1: Get Time Slots to extract `fromTime` ===
  await sessionClient.get(
   `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time`,
   {
    params: { bookingDate },
   }
  );

  // === Step 2: Get Classifies (API call is required by the server) ===
  await sessionClient.get(
   `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies`,
   {
    params: {
     timeConstraintId: timeConstraintId,
     monthlyTicket: "false",
     fromTime,
    },
   }
  );

  // === Step 3: Get Places (API call is required by the server) ===
  await sessionClient.get(
   `${BASE_URL}/api/vhr/utility/v0/utility/${UTILITY_ID}/places`,
   {
    params: {
     classifyId: classifyId,
     fromTime,
     timeConstraintId: timeConstraintId,
     monthlyTicket: "false",
    },
   }
  );

  // === Step 4: Get Ticket Info (Final validation step) ===
  await sessionClient.get(
   `${BASE_URL}/api/vhr/utility/v0/utility/ticket-info`,
   {
    params: {
     bookingDate,
     placeUtilityId: placeUtilityId,
     timeConstraintId: timeConstraintId,
    },
   }
  );

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
  bookingData.cs = await generateChecksum(bookingData);

  const finalBookingResponse = await sessionClient.post(
   `${BASE_URL}/api/vhr/utility/v0/customer-utility/booking`,
   bookingData
  );

  // Extract only the serializable data from the axios response
  const responseData = {
   status: finalBookingResponse.status,
   statusText: finalBookingResponse.statusText,
   data: finalBookingResponse.data,
  };

  // Check if booking was successful
  const isSuccess =
   finalBookingResponse.status >= 200 && finalBookingResponse.status < 300;

  // ✅ Success!
  return NextResponse.json({
   success: isSuccess,
   message: isSuccess ? "Booking flow completed!" : "Booking request failed",
   data: responseData,
  });
 } catch (error: any) {
  console.error("Booking Flow Failed:", error);
  return NextResponse.json(
   {
    success: false,
    message: error.message || "An error occurred during booking",
    error: error.response?.data || error.message,
   },
   { status: 500 }
  );
 }
}
