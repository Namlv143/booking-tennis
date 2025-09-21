import { NextResponse } from "next/server";

// Comment out Edge runtime for now as it's causing headers issues
// export const runtime = 'edge';

// --- INTERFACES ---
interface BookingDetails {
  jwtToken: string;
  placeId: number;
  placeUtilityId: number;
  timeConstraintId: number;
  classifyId: number;
}

interface BookingTarget {
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

// --- FUNCTIONS ---
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

const getBookingDate = (): number => {
  // Get current date and adjust to Vietnam time (UTC+7)
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  
  // Get tomorrow's date
  const tomorrow = new Date(vietnamTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set time to 8:30 AM specifically
  tomorrow.setHours(8, 30, 0, 0);
  
  return tomorrow.getTime();
};

const generateFromTime = (hour: number, daysToAdd: number): number => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(hour, 0, 0, 0);
  return targetDate.getTime();
};

const generateChecksum = async (payload: BookingPayload): Promise<string> => {
  const booking = payload.bookingRequests[0];
  const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId;
  const interpolatedString = `${numericSum}${SECRET_KEY}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(interpolatedString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const makeStateUpdateCall = async (endpoint: string, params: Record<string, any>, jwtToken: string): Promise<void> => {
  try {
    const url = new URL(endpoint, BASE_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
    
    // Create headers object explicitly
    const headers = getHeaders(jwtToken);
    
    // Log request details for debugging
    console.log(`Making request to ${url.toString()} with headers:`, JSON.stringify(headers));
    
    const response = await fetch(url.toString(), { 
      method: 'GET', 
      headers: headers, 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No response text');
      console.error(`Failed API call to ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`State update call failed for ${endpoint} with status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error in makeStateUpdateCall for ${endpoint}:`, error);
    throw error;
  }
};

const executeBookingFlow = async (details: BookingDetails): Promise<any> => {
  const bookingDate = getBookingDate();
  const fromTime = generateFromTime(18, 1);
  const { timeConstraintId, classifyId, placeUtilityId, placeId, jwtToken } = details;
  
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/booking-time`, { bookingDate }, jwtToken);
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/classifies`, { timeConstraintId, monthlyTicket: false, fromTime }, jwtToken);
  await makeStateUpdateCall(`/api/vhr/utility/v0/utility/${UTILITY_ID}/places`, { classifyId, timeConstraintId, monthlyTicket: false, fromTime }, jwtToken);
  await makeStateUpdateCall('/api/vhr/utility/v0/utility/ticket-info', { bookingDate, placeUtilityId, timeConstraintId }, jwtToken);

  const payload: BookingPayload = {
    bookingRequests: [{
      bookingDate,
      placeId,
      timeConstraintId,
      utilityId: UTILITY_ID,
      residentTicket: RESIDENT_TICKET_COUNT,
      residentChildTicket: null, guestTicket: null, guestChildTicket: null,
    }],
    paymentMethod: null, vinClubPoint: null, deviceType: DEVICE_TYPE,
  };
  
  payload.cs = await generateChecksum(payload);
  
  try {
    const bookingUrl = new URL('/api/vhr/utility/v0/customer-utility/booking', BASE_URL);
    const headers = getHeaders(jwtToken);
    
    console.log("Making final booking request with payload:", JSON.stringify(payload));
    console.log("Using headers:", JSON.stringify(headers));
    
    const response = await fetch(bookingUrl.toString(), { 
      method: 'POST', 
      headers: headers, 
      body: JSON.stringify(payload), 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No response text');
      console.error("Final booking failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Final booking failed with status ${response.status}: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log("Booking response:", JSON.stringify(responseData));
    return responseData;
  } catch (error) {
    console.error("Error in final booking:", error);
    throw error;
  }
};

// --- POST HANDLER ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🧪 [CARD 6] Reverse booking body:", body);
    const { jwtToken, bookingTarget } = body;
    
    const bookingDetails: BookingDetails = {
      jwtToken,
      placeId: bookingTarget.placeId,
      placeUtilityId: bookingTarget.placeUtilityId,
      timeConstraintId: bookingTarget.timeConstraintId,
      classifyId: bookingTarget.classifyId,
    };

    const results = await executeBookingFlow(bookingDetails);

    return NextResponse.json(results);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Top-level error in POST handler:", errorMessage);
    return NextResponse.json({ message: "Internal server error: " + errorMessage }, { status: 500 });
  }
}