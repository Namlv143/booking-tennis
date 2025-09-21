import { NextResponse } from "next/server";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- INTERFACES AND THE BOOKING CLASS ---
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

class VinhomesTennisBooking {
  // Static constants
  private static readonly BASE_URL = "https://vh.vinhomes.vn";
  private static readonly SECRET_KEY = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@";
  // Changed to public static for access from GET handler
  public static readonly UTILITY_ID = 75;
  public static readonly RESIDENT_TICKET_COUNT = 4;
  public static readonly DEVICE_TYPE = "ANDROID";

  private readonly details: BookingDetails;

  constructor(details: BookingDetails) {
    this.details = details;
  }

  private getHeaders(): Record<string, string> {
    return {
      "user-agent": "Dart/3.7 (dart:io)",
      "app-version-name": "1.5.5",
      "device-inf": "PHY110 OPPO 35",
      "accept-language": "vi",
      "x-vinhome-token": this.details.jwtToken,
      "device-id": "51a9e0d3fcb8574c",
      host: "vh.vinhomes.vn",
      "content-type": "application/json; charset=UTF-8",
      "accept-encoding": "gzip",
    };
  }
  
  // Changed to public for access from GET handler
  public getBookingDate(): number {
    // Get current date and adjust to Vietnam time (UTC+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    
    // Get tomorrow's date
    const tomorrow = new Date(vietnamTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set time to 8:30 AM specifically
    tomorrow.setHours(8, 30, 0, 0);
    
    return tomorrow.getTime();
  }

  // Changed to public for access from GET handler
  public generateFromTime(hour: number, daysToAdd: number): number {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    targetDate.setHours(hour, 0, 0, 0);
    return targetDate.getTime();
  }

  private async generateChecksum(payload: BookingPayload): Promise<string> {
    const booking = payload.bookingRequests[0];
    const numericSum = booking.utilityId + booking.placeId + booking.bookingDate + booking.timeConstraintId;
    const interpolatedString = `${numericSum}${VinhomesTennisBooking.SECRET_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(interpolatedString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  private async makeStateUpdateCall(endpoint: string, params: Record<string, any>): Promise<void> {
    const url = new URL(endpoint, VinhomesTennisBooking.BASE_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
    const response = await fetch(url, { method: 'GET', headers: this.getHeaders(), cache: 'no-store' });
    console.log("🧪 [endpoint]", endpoint, "url:", url);
    if (!response.ok) {
      throw new Error(`State update call failed for ${endpoint} with status ${response.status}`);
    }
  }

  async executeBookingFlow(): Promise<any> {
    const bookingDate = this.getBookingDate();
    const fromTime = this.generateFromTime(18, 1);
    const { timeConstraintId, classifyId, placeUtilityId, placeId } = this.details;
    await this.makeStateUpdateCall(`/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/booking-time`, { bookingDate })
    await this.makeStateUpdateCall(`/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/classifies`, { timeConstraintId, monthlyTicket: false, fromTime });
    await this.makeStateUpdateCall(`/api/vhr/utility/v0/utility/${VinhomesTennisBooking.UTILITY_ID}/places`, { classifyId, timeConstraintId, monthlyTicket: false, fromTime });
    await this.makeStateUpdateCall('/api/vhr/utility/v0/utility/ticket-info', { bookingDate, placeUtilityId, timeConstraintId });

    const payload: BookingPayload = {
      bookingRequests: [{
        bookingDate,
        placeId,
        timeConstraintId,
        utilityId: VinhomesTennisBooking.UTILITY_ID,
        residentTicket: VinhomesTennisBooking.RESIDENT_TICKET_COUNT,
        residentChildTicket: null, guestTicket: null, guestChildTicket: null,
      }],
      paymentMethod: null, vinClubPoint: null, deviceType: VinhomesTennisBooking.DEVICE_TYPE,
    };
    payload.cs = await this.generateChecksum(payload);
    
    const response = await fetch(
        new URL('/api/vhr/utility/v0/customer-utility/booking', VinhomesTennisBooking.BASE_URL), 
        { method: 'POST', headers: this.getHeaders(), body: JSON.stringify(payload), cache: 'no-store' }
    );
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Final booking failed with status ${response.status}: ${errorText}`);
    }
    return response.json();
  }
}

// --- GET HANDLER TO PREPARE BOOKING VALUES AHEAD OF TIME ---
export async function GET() {
  try {
    // Create temporary instance to use public methods
    const tempBooker = new VinhomesTennisBooking({} as BookingDetails);
    
    // Pre-calculate the values needed for booking
    const bookingDate = tempBooker.getBookingDate();
    const fromTime = tempBooker.generateFromTime(18, 1);
    
    // Format dates for readability
    const readableBookingDate = new Date(bookingDate).toISOString();
    const readableFromTime = new Date(fromTime).toISOString();
    
    // Return all pre-calculated values
    return NextResponse.json({
      bookingDate,
      fromTime,
      readableValues: {
        bookingDate: readableBookingDate,
        fromTime: readableFromTime
      },
      utilityId: VinhomesTennisBooking.UTILITY_ID,
      residentTicketCount: VinhomesTennisBooking.RESIDENT_TICKET_COUNT,
      deviceType: VinhomesTennisBooking.DEVICE_TYPE,
      message: "Pre-calculated values ready for booking"
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Error preparing booking values:", errorMessage);
    return NextResponse.json({ message: "Error preparing booking values: " + errorMessage }, { status: 500 });
  }
}

// --- POST HANDLER USING Promise.allSettled FOR A FULL REPORT ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🧪 [CARD 6] Reverse booking body:", body);
    const { jwtToken, bookingTargets } = body;
    if (!jwtToken || !Array.isArray(bookingTargets) || bookingTargets.length === 0) {
        return NextResponse.json({ message: "Invalid request body. 'jwtToken' and a 'bookingTargets' array are required." }, { status: 400 });
    }

    const bookingPromises = [];

    for (const target of bookingTargets) {
      const bookingDetails: BookingDetails = {
          jwtToken,
          placeId: target.placeId,
          placeUtilityId: target.placeUtilityId,
          timeConstraintId: target.timeConstraintId,
          classifyId: target.classifyId,
      };

      const bookingInstance = new VinhomesTennisBooking(bookingDetails);
      bookingPromises.push(bookingInstance.executeBookingFlow());
      
      await delay(100); // Stagger the start times
    }
    
    // Wait for ALL booking flows to complete (either succeed or fail)
    const results = await Promise.allSettled(bookingPromises);

    // Map the results to a clean response format for a full report
    const responseData = results.map((result, index) => {
        const target = bookingTargets[index];
        if (result.status === 'fulfilled') {
            return {
                placeId: target.placeId,
                status: 'success',
                data: result.value
            };
        } else {
            return {
                placeId: target.placeId,
                status: 'failed',
                error: result.reason instanceof Error ? result.reason.message : String(result.reason)
            };
        }
    });

    return NextResponse.json(responseData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("❌ Top-level error in POST handler:", errorMessage);
    return NextResponse.json({ message: "Internal server error: " + errorMessage }, { status: 500 });
  }
}