import { NextResponse } from "next/server";
import { bookTennis, TennisBookingRequest } from "@/lib/vinhomes-api";

/**
 * The main API handler for the booking flow.
 */

export async function POST(req: any) {
  try {
    const { jwtToken, bookingDate, fromTime, bookingTarget, isHardcoded } = await req.json();
    
    const bookingRequest: TennisBookingRequest = {
      jwtToken,
      bookingDate,
      fromTime,
      bookingTarget,
      isHardcoded
    };

    const result = await bookTennis(bookingRequest);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
  } catch (error: any) {
    console.error("Tennis booking API error:", error);
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
