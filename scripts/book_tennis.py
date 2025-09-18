#!/usr/bin/env python3

import requests
import json
import hashlib
from datetime import datetime, timezone, timedelta
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

class VinhomesTennisBooking:
    def __init__(self, place_id: int, place_utility_id: int):
        self.base_url = "https://vh.vinhomes.vn"
        self.session = requests.Session()
        
        # Authentication - Securely read the token from environment variables
        self.jwt_token = os.environ.get('VINHOMES_TOKEN_REFERENCE')
        if not self.jwt_token:
            raise ValueError("VINHOMES_TOKEN_REFERENCE secret not found in environment variables.")
        self.secret_key = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
        
        # --- Configurable Court Data (passed during initialization) ---
        self.place_id = place_id
        self.place_utility_id = place_utility_id
        
        # --- Static Booking Data ---
        self.utility_id = 75
        self.classify_id = 118
        self.time_constraint_id = 571  # Pre-configured time slot
        self.from_time = None  # Will be extracted from API
        self.booking_date = None  # Will be set when needed
    
    def _get_headers(self, method: str) -> dict:
        """Minimal required headers"""
        headers = {
            'user-agent': 'Dart/3.7 (dart:io)',
            'app-version-name': '1.5.5',
            'device-inf': 'PHY110 OPPO 35',
            'accept-language': 'vi',
            'x-vinhome-token': self.jwt_token,
            'device-id': '51a9e0d3fcb8574c',
            'host': 'vh.vinhomes.vn',
            'content-type': 'application/json; charset=UTF-8'
        }
        if method == 'POST':
            headers['Connection'] = 'keep-alive'
        return headers
    
    def _get_booking_date(self) -> int:
        """Generate booking date (tomorrow)"""
        now = datetime.now(timezone.utc)
        vietnam_time = now + timedelta(hours=7)
        booking_date = vietnam_time + timedelta(days=1)
        return int(booking_date.timestamp() * 1000)
    
    def _generate_checksum(self, booking_data: dict) -> str:
        """Generate checksum for booking"""
        booking = booking_data['bookingRequests'][0]
        numeric_sum = (booking['utilityId'] + booking['placeId'] + 
                      booking['bookingDate'] + booking['timeConstraintId'])
        interpolated_string = f"{numeric_sum}{self.secret_key}"
        return hashlib.sha256(interpolated_string.encode('utf-8')).hexdigest()
    
    def _make_request(self, method: str, endpoint: str, data: dict = None, params: dict = None) -> dict:
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers(method)
        try:
            if method == 'GET':
                response = self.session.get(url, params=params, headers=headers, timeout=10)
            else:
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            error_message = f"Request for place_id {self.place_id} failed: {e}"
            if e.response is not None:
                error_message += f" | Response: {e.response.text}"
            return {"error": error_message}

    def execute_booking_flow(self) -> dict:
        """Execute complete booking flow for one court, ensuring all steps are called."""
        self.booking_date = self._get_booking_date()

        # Step 1: Get time slots
        params_time = {'bookingDate': self.booking_date}
        endpoint_time = f"/api/vhr/utility/v0/utility/{self.utility_id}/booking-time"
        response_time = self._make_request('GET', endpoint_time, params=params_time)
        if 'error' in response_time:
            return {"error": f"Step 1 (get_time_slots) failed for place_id {self.place_id}: {response_time['error']}"}
        
        target_slot = next((s for s in response_time.get('data', []) if s.get('id') == self.time_constraint_id), None)
        if not target_slot:
            return {"error": f"Time slot {self.time_constraint_id} not found for place_id {self.place_id}"}
        self.from_time = target_slot.get('fromTime')
        
        # --- Explicitly call all intermediate steps to mimic full user flow ---
        
        # Step 2: Get classifies
        params_classifies = {'timeConstraintId': self.time_constraint_id, 'monthlyTicket': 'false', 'fromTime': self.from_time}
        endpoint_classifies = f"/api/vhr/utility/v0/utility/{self.utility_id}/classifies"
        response_classifies = self._make_request('GET', endpoint_classifies, params=params_classifies)
        if 'error' in response_classifies:
            return {"error": f"Step 2 (get_classifies) failed for place_id {self.place_id}: {response_classifies['error']}"}

        # Step 3: Get places
        params_places = {'classifyId': self.classify_id, 'fromTime': self.from_time, 'timeConstraintId': self.time_constraint_id, 'monthlyTicket': 'false'}
        endpoint_places = f"/api/vhr/utility/v0/utility/{self.utility_id}/places"
        response_places = self._make_request('GET', endpoint_places, params=params_places)
        if 'error' in response_places:
            return {"error": f"Step 3 (get_places) failed for place_id {self.place_id}: {response_places['error']}"}

        # Step 4: Get ticket info
        params_ticket = {'bookingDate': self.booking_date, 'placeUtilityId': self.place_utility_id, 'timeConstraintId': self.time_constraint_id}
        endpoint_ticket = "/api/vhr/utility/v0/utility/ticket-info"
        response_ticket = self._make_request('GET', endpoint_ticket, params=params_ticket)
        if 'error' in response_ticket:
            return {"error": f"Step 4 (get_ticket_info) failed for place_id {self.place_id}: {response_ticket['error']}"}

        # Step 5: Make final booking
        booking_data = {
            "bookingRequests": [{"bookingDate": self.booking_date, "placeId": self.place_id, "timeConstraintId": self.time_constraint_id, "utilityId": self.utility_id, "residentTicket": 4, "residentChildTicket": None, "guestTicket": None, "guestChildTicket": None}],
            "paymentMethod": None, "vinClubPoint": None, "deviceType": "ANDROID"
        }
        booking_data['cs'] = self._generate_checksum(booking_data)
        endpoint_booking = "/api/vhr/utility/v0/customer-utility/booking"
        return self._make_request('POST', endpoint_booking, data=booking_data)

def book_court(court_info: dict) -> dict:
    """Wrapper function to instantiate and run a booking for a single court."""
    print(f"🚀 Preparing booking for: {court_info['name']} (Place ID: {court_info['place_id']})")
    try:
        booking_instance = VinhomesTennisBooking(
            place_id=court_info['place_id'],
            place_utility_id=court_info['place_utility_id']
        )
        result = booking_instance.execute_booking_flow()
        return {**court_info, 'result': result}
    except Exception as e:
        return {**court_info, 'result': {'error': str(e)}}

def main():
    """Execute booking flow for multiple courts in parallel."""
    print("🎾 Starting parallel booking for multiple tennis courts...")

    # --- DEFINE THE COURTS TO BOOK HERE ---
    courts_to_book = [
        {'place_id': 802, 'place_utility_id': 626, 'name': 'Court 1 (S1.02)'},
        {'place_id': 801, 'place_utility_id': 625, 'name': 'Court 2 (S1.01)'}
    ]

    all_results = []
    # Use a ThreadPoolExecutor to run booking for all courts at the same time
    with ThreadPoolExecutor(max_workers=len(courts_to_book)) as executor:
        future_to_court = {executor.submit(book_court, court): court for court in courts_to_book}
        for future in as_completed(future_to_court):
            all_results.append(future.result())

    print("\n--- All Booking Results ---")
    overall_success = False
    for res in all_results:
        court_name = res['name']
        result_data = res['result']
        
        print(f"\nCourt: {court_name}")
        print(json.dumps(result_data, indent=2))
        
        if result_data.get('code') == 200 and not result_data.get('error'):
            print(f"✅ SUCCESS for {court_name}!")
            overall_success = True
        else:
            print(f"❌ FAILED for {court_name}: {result_data.get('message', result_data.get('error', 'Unknown error'))}")

    if not overall_success:
        # Exit with a non-zero status code to make the GitHub Action fail if no bookings succeed
        print("\nNo bookings were successful. Exiting with error.")
        exit(1)

if __name__ == "__main__":
    main()