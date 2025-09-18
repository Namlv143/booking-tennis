#!/usr/bin/env python3

import requests
import json
import hashlib
from datetime import datetime, timezone, timedelta

class VinhomesTennisBooking:
    def __init__(self):
        self.base_url = "https://vh.vinhomes.vn"
        self.session = requests.Session()
        
        # Authentication
        self.jwt_token = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIxODI2NSIsInN1YiI6IjA5NzkyNTE0OTYiLCJhdWQiOiJvYXV0aCIsImlhdCI6MTc1ODA5ODg4NiwiZXhwIjoxNzU4MTg1Mjg2fQ.3n0wf4LoM4ZuOCMNaLdOpBCavvcx05XD1u4GhVKzZkd-cXIl_XXnvPa_WB_6kN_9gXLW3X1CZLlqIqg0bnoWEA"
        self.secret_key = "tqVtg9GqwUiKbHqkSG4BpMyXPu3BbpUHmzOqgEQa1KYJZ1Ckv8@@@"
        
        # Pre-configured data for maximum performance - set all data from start
        self.utility_id = 75
        self.place_id = 801
        self.place_utility_id = 625
        self.classify_id = 118
        self.time_constraint_id = 575  # Pre-configured time slot
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
            headers['accept-encoding'] = 'gzip, deflate, br'
        else:
            headers['accept-encoding'] = 'gzip'
        
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
            
            if response.status_code != 200:
                return {"error": f"HTTP {response.status_code}"}
            
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def get_time_slots(self) -> dict:
        """Step 1: Get time slots - extract fromTime, use pre-configured data"""
        self.booking_date = self._get_booking_date()
        params = {'bookingDate': self.booking_date}
        endpoint = f"/api/vhr/utility/v0/utility/{self.utility_id}/booking-time"
        
        response = self._make_request('GET', endpoint, params=params)
        if 'error' in response:
            return response
        
        # Extract fromTime from API response for id=575
        time_slots = response.get('data', [])
        target_slot = next((slot for slot in time_slots if slot.get('id') == self.time_constraint_id), None)
        
        if not target_slot:
            return {"error": f"Time slot id={self.time_constraint_id} not found"}
        
        # Set extracted fromTime for subsequent calls
        self.from_time = target_slot.get('fromTime')
        return {"success": True}
    
    def get_classifies(self) -> dict:
        """Step 2: Get classifies - API call only, use pre-configured data"""
        params = {
            'timeConstraintId': self.time_constraint_id,
            'monthlyTicket': 'false',
            'fromTime': self.from_time
        }
        endpoint = f"/api/vhr/utility/v0/utility/{self.utility_id}/classifies"
        
        response = self._make_request('GET', endpoint, params=params)
        if 'error' in response:
            return response
        
        # Skip data processing - use pre-configured data
        return {"success": True}
    
    def get_places(self) -> dict:
        """Step 3: Get places - API call only, use pre-configured data"""
        params = {
            'classifyId': self.classify_id,
            'fromTime': self.from_time,
            'timeConstraintId': self.time_constraint_id,
            'monthlyTicket': 'false'
        }
        endpoint = f"/api/vhr/utility/v0/utility/{self.utility_id}/places"
        
        response = self._make_request('GET', endpoint, params=params)
        if 'error' in response:
            return response
        
        # Skip data processing - use pre-configured data
        return {"success": True}
    
    def get_ticket_info(self) -> dict:
        """Step 4: Get ticket information - API call only, use pre-configured data"""
        params = {
            'bookingDate': self.booking_date,
            'placeUtilityId': self.place_utility_id,
            'timeConstraintId': self.time_constraint_id
        }
        endpoint = "/api/vhr/utility/v0/utility/ticket-info"
        
        response = self._make_request('GET', endpoint, params=params)
        if 'error' in response:
            return response
        
        # Skip data processing - use pre-configured data
        return {"success": True}
    
    def make_booking(self) -> dict:
        """Step 5: Make final booking - use pre-configured data"""
        booking_data = {
            "bookingRequests": [{
                "bookingDate": self.booking_date,
                "placeId": self.place_id,
                "timeConstraintId": self.time_constraint_id,
                "utilityId": self.utility_id,
                "residentTicket": 4,
                "residentChildTicket": None,
                "guestTicket": None,
                "guestChildTicket": None
            }],
            "paymentMethod": None,
            "vinClubPoint": None,
            "deviceType": "ANDROID"
        }
        
        # Add checksum
        booking_data['cs'] = self._generate_checksum(booking_data)
        
        endpoint = "/api/vhr/utility/v0/customer-utility/booking"
        return self._make_request('POST', endpoint, data=booking_data)
    
    def execute_booking_flow(self) -> dict:
        """Execute complete booking flow - ultra fast with pre-configured data"""
        # Step 1: Get time slots
        if 'error' in self.get_time_slots():
            return {"error": "Step 1 failed"}
        
        # Step 2: Get classifies
        if 'error' in self.get_classifies():
            return {"error": "Step 2 failed"}
        
        # Step 3: Get places
        if 'error' in self.get_places():
            return {"error": "Step 3 failed"}
        
        # Step 4: Get ticket info
        if 'error' in self.get_ticket_info():
            return {"error": "Step 4 failed"}
        
        # Step 5: Make booking
        return self.make_booking()

def main():
    """Execute ultra-fast booking flow"""
    
    booking = VinhomesTennisBooking()
    result = booking.execute_booking_flow()
    
    if result.get('code') is None or result.get('code') == 200:
        print("\n✅ SUCCESS: Booking flow completed!")
    else:
        print(f"\n❌ FAILED: {result.get('message', 'Unknown error')}")

if __name__ == "__main__":
    main()
