#!/usr/bin/env python3
# requirements: requests

import requests
import json
import hashlib
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

class VinhomesTennisBooking:
    """
    Manages the complete, sequential booking flow for a single tennis court.
    """
    def __init__(self, place_id: int, place_utility_id: int, time_constraint_id: int):
        self.base_url = "https://vh.vinhomes.vn"
        self.session = requests.Session()
        
        # --- NEW TOKEN IS NOW HARDCODED HERE ---
        self.jwt_token = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxODI2NSIsInN1YiI6IjA5NzkyNTE0OTYiLCJhdWQiOiJvYXV0aCIsImlhdCI6MTc1ODMwNDgwNSwiZXhwIjoxNzU4MzkxMjA1fQ.WYQqDM411KP-OgVSnWzMnbCdzOPdhPPSqOaE6UO8eck7qqjkXaVy1vGy6rERlZE8_gLeN6-UWbfUj3x-O3Kv6Q"
        
        # The secret key used for generating the final checksum.
        self.secret_key = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
        
        # --- Court and Time Slot Details ---
        self.place_id = place_id
        self.place_utility_id = place_utility_id
        self.time_constraint_id = time_constraint_id
        
        # --- Static Booking Data (Confirmed during analysis) ---
        self.utility_id = 75
        self.classify_id = 118
        
        # --- Dynamic Data (Set during the flow) ---
        self.booking_date = None
    
    def _get_headers(self) -> dict:
        """Constructs the required headers for each API request."""
        return {
            'user-agent': 'Dart/3.7 (dart:io)',
            'app-version-name': '1.5.5',
            'device-inf': 'PHY110 OPPO 35',
            'accept-language': 'vi',
            'x-vinhome-token': self.jwt_token,
            'device-id': '51a9e0d3fcb8574c',
            'host': 'vh.vinhomes.vn',
            'content-type': 'application/json; charset=UTF-8'
        }
    
    def _get_booking_date(self) -> int:
        """
        Gets the timestamp for tomorrow at the current time.
        """
        now = datetime.now(timezone.utc)
        booking_date = now + timedelta(days=1)
        return int(booking_date.timestamp() * 1000)

    def _generate_from_time(self, hour: int, days_to_add: int) -> int:
        """
        Generates a timestamp for a specific hour on a future day.
        """
        target_date = datetime.now(timezone.utc)
        target_date += timedelta(days=days_to_add)
        # To get a specific hour in Vietnam (UTC+7), we subtract 7 from the UTC hour.
        vietnam_hour_in_utc = hour - 7
        target_date = target_date.replace(hour=vietnam_hour_in_utc, minute=0, second=0, microsecond=0)
        return int(target_date.timestamp() * 1000)

    def _generate_checksum(self, booking_data: dict) -> str:
        """Generates the SHA256 checksum required for the final booking POST request."""
        booking = booking_data['bookingRequests'][0]
        numeric_sum = (booking['utilityId'] + booking['placeId'] + 
                      booking['bookingDate'] + booking['timeConstraintId'])
        interpolated_string = f"{numeric_sum}{self.secret_key}"
        return hashlib.sha256(interpolated_string.encode('utf-8')).hexdigest()
    
    def _make_request(self, method: str, endpoint: str, data: dict = None, params: dict = None) -> dict:
        """A helper function to make HTTP requests and handle errors."""
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, headers=headers, timeout=10)
            else:
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            error_message = f"Request for place_id {self.place_id} failed: {e}"
            if e.response is not None: error_message += f" | Response: {e.response.text}"
            return {"error": error_message}

    def execute_booking_flow(self) -> dict:
        """
        Executes the mandatory, sequential API calls with the corrected timestamp logic.
        """
        booking_date = self._get_booking_date()
        from_time = self._generate_from_time(18, 1) # For 18:00 (6 PM) tomorrow

        # --- Sequentially update the server-side session state ---
        self._make_request('GET', f"/api/vhr/utility/v0/utility/{self.utility_id}/booking-time", params={'bookingDate': booking_date})
        self._make_request('GET', f"/api/vhr/utility/v0/utility/{self.utility_id}/classifies", params={'timeConstraintId': self.time_constraint_id, 'monthlyTicket': 'false', 'fromTime': from_time})
        self._make_request('GET', f"/api/vhr/utility/v0/utility/{self.utility_id}/places", params={'classifyId': self.classify_id, 'timeConstraintId': self.time_constraint_id, 'monthlyTicket': 'false', 'fromTime': from_time})
        self._make_request('GET', "/api/vhr/utility/v0/utility/ticket-info", params={'bookingDate': booking_date, 'placeUtilityId': self.place_utility_id, 'timeConstraintId': self.time_constraint_id})

        # --- Construct and send the final booking request ---
        booking_data = {
            "bookingRequests": [{"bookingDate": booking_date, "placeId": self.place_id, "timeConstraintId": self.time_constraint_id, "utilityId": self.utility_id, "residentTicket": 4, "residentChildTicket": None, "guestTicket": None, "guestChildTicket": None}],
            "paymentMethod": None, "vinClubPoint": None, "deviceType": "ANDROID"
        }
        booking_data['cs'] = self._generate_checksum(booking_data)
        
        return self._make_request('POST', "/api/vhr/utility/v0/customer-utility/booking", data=booking_data)

# --- THE MAIN EXECUTION LOGIC ---

def book_court(court_info: dict) -> dict:
    print(f"🚀 Preparing booking for: {court_info['name']}")
    try:
        booking_instance = VinhomesTennisBooking(
            place_id=court_info['place_id'],
            place_utility_id=court_info['place_utility_id'],
            time_constraint_id=court_info['time_constraint_id']
        )
        result = booking_instance.execute_booking_flow()
        return {**court_info, 'result': result}
    except Exception as e:
        return {**court_info, 'result': {'error': str(e)}}

def main():
    print("🎾 Starting booking race for multiple tennis courts...")
    
    # --- DEFINE THE COURTS AND TIME SLOTS TO BOOK HERE ---
    courts_to_book = [
        {'place_id': 802, 'place_utility_id': 626, 'time_constraint_id': 571, 'name': 'Court 1 (S1.02) at 6 PM'},
        {'place_id': 801, 'place_utility_id': 625, 'time_constraint_id': 571, 'name': 'Court 2 (S1.01) at 6 PM'}
    ]

    one_booking_succeeded = False
    with ThreadPoolExecutor(max_workers=len(courts_to_book)) as executor:
        future_to_court = {executor.submit(book_court, court): court for court in courts_to_book}
        
        for future in as_completed(future_to_court):
            court_name = future_to_court[future]['name']
            
            if one_booking_succeeded:
                print(f"🏁 Another booking for {court_name} finished, but we already have a success.")
                continue

            try:
                res = future.result()
                result_data = res.get('result', {})

                if result_data.get('code') == 200 and not result_data.get('error'):
                    print(f"\n✅ SUCCESS for {court_name}! A court has been booked.")
                    print(json.dumps(result_data, indent=2))
                    one_booking_succeeded = True
                else:
                    print(f"❌ FAILED for {court_name}: {result_data.get('message', result_data.get('error', 'Unknown error'))}")
            except Exception as e:
                print(f"❌ An exception occurred while processing result for {court_name}: {e}")
    
    print("\n--- Booking Race Finished ---")
    if one_booking_succeeded:
        print("🏆 At least one booking was successful. Exiting with success status.")
        exit(0)
    else:
        print("💔 All booking attempts failed. Exiting with error status.")
        exit(1)

if __name__ == "__main__":
    main()