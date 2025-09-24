const axios = require('axios');
const { withCookieJar } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const crypto = require('crypto');
const { HttpsAgent } = require('agentkeepalive');
require('dotenv').config(); // Still needed for the JWT_TOKEN

// --- CONFIGURATION ---
const BASE_URL = "https://vh.vinhomes.vn";

// --- SECRETS ---
const JWT_TOKEN = process.env.VINHOMES_JWT_TOKEN; // <-- Token is loaded from .env
const SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"; // <-- Secret Key is now hardcoded

// --- High-Performance HTTP Agent ---
const keepAliveAgent = new HttpsAgent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

function generateChecksum(utilityId, placeId, timeConstraintId, bookingDate) {
  
  // Convert all numbers to strings and concatenate them
  const interpolatedString = 
      String(utilityId) +
      String(placeId) +
      String(timeConstraintId) +
      String(bookingDate) +
      SECRET_KEY;
      
  return crypto.createHash('sha256').update(interpolatedString, 'utf-8').digest('hex');
}

function getBookingDate() {
  // Create a date object for the current time
  const tomorrow = new Date();

  // Set the date to tomorrow
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Set the time to exactly 08:30:00
  // The parameters are: (hours, minutes, seconds, milliseconds)
  tomorrow.setHours(8, 30, 0, 0);

  return tomorrow.getTime();
}

const generateFromTime = (hour, daysToAdd) => {
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    targetDate.setHours(hour, 0, 0, 0);
    return targetDate.getTime();
};

/**
 * The main booking flow function
 */
async function runBookingFlow() {
    console.log(`[${new Date().toISOString()}] Starting the booking process...`);

    if (!JWT_TOKEN) {
        console.error("❌ ERROR: JWT_TOKEN is missing. Check your .env file.");
        return;
    }

    const cookieJar = new CookieJar();
    const axiosInstance = axios.create({
        httpsAgent: keepAliveAgent,
        headers: {
            "user-agent": "Dart/3.7 (dart:io)",
            "app-version-name": "1.5.5",
            "device-inf": "PHY110 OPPO 35",
            "accept-language": "vi",
            "x-vinhome-token": JWT_TOKEN,
            "device-id": "51a9e0d3fcb8574c",
            "host": "vh.vinhomes.vn",
            "content-type": "application/json; charset=UTF-8",
            "accept-encoding": "gzip, deflate, br",
        }
    });
    const sessionClient = withCookieJar(axiosInstance, cookieJar);

    try {
        const bookingDate = getBookingDate();
        const fromTime = generateFromTime(18, 1);
        const timeConstraintId = 571;
        const classifyId = 118;
        const placeId = 802;
        const placeUtilityId = 626;

        console.log("  [Step 1/5] Getting booking times...");
        await sessionClient.get(`${BASE_URL}/api/vhr/utility/v0/utility/75/booking-time`, { params: { bookingDate } });

        console.log("  [Step 2/5] Getting classifies...");
        await sessionClient.get(`${BASE_URL}/api/vhr/utility/v0/utility/75/classifies`, { params: { timeConstraintId, monthlyTicket: "false", fromTime } });

        console.log("  [Step 3/5] Getting places...");
        await sessionClient.get(`${BASE_URL}/api/vhr/utility/v0/utility/75/places`, { params: { classifyId, fromTime, timeConstraintId, monthlyTicket: "false" } });

        console.log("  [Step 4/5] Getting ticket info...");
        await sessionClient.get(`${BASE_URL}/api/vhr/utility/v0/utility/ticket-info`, { params: { bookingDate, placeUtilityId, timeConstraintId } });

        console.log("  [Step 5/5] Submitting final booking...");
        const bookingData = {
            bookingRequests: [{
                bookingDate: bookingDate,
                placeId: placeId,
                timeConstraintId: timeConstraintId,
                utilityId: UTILITY_ID,
                residentTicket: 4,
                residentChildTicket: null,
                guestTicket: null,
                guestChildTicket: null,
            }],
            paymentMethod: null,
            vinClubPoint: null,
            deviceType: "ANDROID",
        };
        bookingData.cs = generateChecksum(utilityId, placeId, bookingDate, timeConstraintId);

        const finalBookingResponse = await sessionClient.post(`${BASE_URL}/api/vhr/utility/v0/customer-utility/booking`, bookingData);

        if (finalBookingResponse.status === 200 && finalBookingResponse.data?.code === 200) {
            console.log("\n✅ SUCCESS: Booking flow completed successfully!");
            console.log("Response:", JSON.stringify(finalBookingResponse.data, null, 2));
        } else {
            console.error("\n❌ FAILED: The server responded, but the booking was not successful.");
            console.error("Status:", finalBookingResponse.status);
            console.error("Response Data:", JSON.stringify(finalBookingResponse.data, null, 2));
        }
    } catch (error) {
        console.error("\n❌ FAILED: An unexpected error occurred during the booking flow.");
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

// Run the main function
runBookingFlow();