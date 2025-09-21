# Tennis Booking API Documentation

This document outlines the API endpoints for the tennis court booking system.

## Parallel Tennis Booking API

### Endpoint: `/api/tennis-booking-parallel`

**Method:** `POST`

**Description:** Books multiple tennis courts in parallel and returns the first successful booking. This is an optimized approach to increase the chances of securing a booking when availability is limited.

**Request Body:**

```json
{
  "jwtToken": "your-jwt-token-here",
  "courtsToBook": [
    {
      "place_id": 801,
      "place_utility_id": 625,
      "time_constraint_id": 571,
      "name": "Court 1 (S1.01) at 6 PM"
    },
    {
      "place_id": 802,
      "place_utility_id": 626,
      "time_constraint_id": 571,
      "name": "Court 2 (S1.02) at 6 PM"
    }
  ]
}
```

**Parameters:**

- `jwtToken` (string, required): Your authentication token for the Vinhomes API
- `courtsToBook` (array, required): An array of court objects to attempt booking
  - `place_id` (number, required): The ID of the place
  - `place_utility_id` (number, required): The utility ID for the place
  - `time_constraint_id` (number, required): The ID for the time constraint
  - `name` (string, required): A descriptive name for the court and time slot

**Response:**

For successful bookings:

```json
{
  "success": true,
  "message": "Successfully booked Court 1 (S1.01) at 6 PM",
  "booking": {
    "place_id": 801,
    "place_utility_id": 625,
    "time_constraint_id": 571,
    "name": "Court 1 (S1.01) at 6 PM",
    "result": {
      "code": 200,
      "data": { ... },
      "message": "Success"
    }
  },
  "allResults": [...]
}
```

For failed bookings:

```json
{
  "success": false,
  "message": "All booking attempts failed",
  "results": [...]
}
```

## Example Usage

### Endpoint: `/api/tennis-booking-example`

**Method:** `GET`

**Description:** Demonstrates how to call the parallel booking API with example data.

**Response:** Same as the parallel booking API response.

## Implementation Details

The API implements a parallel booking strategy that:

1. Attempts to book multiple courts simultaneously
2. Follows the required sequence of API calls for each court:
   - Gets booking time information
   - Gets classification information
   - Gets place information
   - Gets ticket information
   - Makes the final booking request
3. Uses proper authentication and checksum generation
4. Returns the first successful booking if any

The implementation is based on the Python script `book_tennis.py` but optimized for Next.js and TypeScript.

