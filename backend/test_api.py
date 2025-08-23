#!/usr/bin/env python3
"""
Test script for the Healthcare Finder API
Run this after setting up your Google Places API key in the .env file
"""

import requests
import json

# Test coordinates (New York City)
TEST_LATITUDE = 40.7128
TEST_LONGITUDE = -74.0060
API_BASE_URL = "http://127.0.0.1:8000"

def test_api_endpoint(endpoint, data):
    """Test an API endpoint with given data"""
    print(f"\n🔍 Testing {endpoint}...")
    
    try:
        response = requests.post(f"{API_BASE_URL}{endpoint}", json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            count = result.get('count', 0)
            places = result.get('hospitals', result.get('doctors', []))
            
            print(f"✅ Success! Found {count} places")
            
            if places:
                print("\n📍 Sample results:")
                for i, place in enumerate(places[:3]):  # Show first 3 results
                    print(f"  {i+1}. {place.get('name', 'N/A')}")
                    print(f"     Address: {place.get('address', 'N/A')}")
                    print(f"     Rating: {place.get('rating', 'N/A')}")
                    print(f"     Status: {'Open' if place.get('opening_hours') else 'Closed' if place.get('opening_hours') is False else 'Unknown'}")
                    print()
            else:
                print("ℹ️  No places found in the area")
                
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    print("🏥 Healthcare Finder API Test")
    print("="*50)
    
    # Test data
    test_data = {
        "latitude": TEST_LATITUDE,
        "longitude": TEST_LONGITUDE,
        "radius": 5000
    }
    
    print(f"📍 Test Location: {TEST_LATITUDE}, {TEST_LONGITUDE} (NYC)")
    print(f"🔍 Search Radius: 5km")
    
    # Test hospitals endpoint
    test_api_endpoint("/api/find_hospitals/", test_data)
    
    # Test doctors endpoint  
    test_api_endpoint("/api/find_doctors/", test_data)
    
    print("\n" + "="*50)
    print("🎯 Test completed!")
    print("\nNext steps:")
    print("1. If you see 'Google Places API error', add your API key to backend/.env")
    print("2. If you see 'Connection Error', start Django server: python manage.py runserver")
    print("3. If tests pass, try the React Native and React web apps!")

if __name__ == "__main__":
    main()
