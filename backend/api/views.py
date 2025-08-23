import requests
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def home(request):
    return HttpResponse("Healthcare API - Hospital and Doctor Finder")

@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        "status": "healthy",
        "message": "Healthcare API is running",
        "django_version": "5.1.7"
    })

@api_view(['POST'])
def find_hospitals(request):
    """
    Find nearby hospitals using Google Places API
    Expected payload: {"latitude": float, "longitude": float, "radius": int (optional)}
    """
    try:
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        radius = request.data.get('radius', 5000)  # Default 5km radius
        
        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Google Places API Nearby Search
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f"{latitude},{longitude}",
            'radius': radius,
            'type': 'hospital',
            'key': settings.GOOGLE_PLACES_API_KEY
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            logger.error(f"Google Places API error: {response.status_code}")
            return Response(
                {"error": "Failed to fetch hospital data"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        data = response.json()
        
        if data.get('status') != 'OK':
            logger.error(f"Google Places API status: {data.get('status')}")
            return Response(
                {"error": f"Google Places API error: {data.get('status')}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Format the response
        hospitals = []
        for place in data.get('results', []):
            hospital = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'latitude': place.get('geometry', {}).get('location', {}).get('lat'),
                'longitude': place.get('geometry', {}).get('location', {}).get('lng'),
                'opening_hours': place.get('opening_hours', {}).get('open_now'),
                'price_level': place.get('price_level'),
                'types': place.get('types', []),
                'photos': [photo.get('photo_reference') for photo in place.get('photos', [])][:3]  # First 3 photos
            }
            hospitals.append(hospital)
        
        return Response({
            'hospitals': hospitals,
            'count': len(hospitals),
            'next_page_token': data.get('next_page_token')
        })
        
    except Exception as e:
        logger.error(f"Error in find_hospitals: {str(e)}")
        return Response(
            {"error": "Internal server error"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def find_doctors(request):
    """
    Find nearby doctors using Google Places API
    Expected payload: {"latitude": float, "longitude": float, "radius": int (optional)}
    """
    try:
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        radius = request.data.get('radius', 5000)  # Default 5km radius
        
        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Google Places API Nearby Search
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            'location': f"{latitude},{longitude}",
            'radius': radius,
            'type': 'doctor',
            'key': settings.GOOGLE_PLACES_API_KEY
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            logger.error(f"Google Places API error: {response.status_code}")
            return Response(
                {"error": "Failed to fetch doctor data"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        data = response.json()
        
        if data.get('status') != 'OK':
            logger.error(f"Google Places API status: {data.get('status')}")
            return Response(
                {"error": f"Google Places API error: {data.get('status')}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Format the response
        doctors = []
        for place in data.get('results', []):
            doctor = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'latitude': place.get('geometry', {}).get('location', {}).get('lat'),
                'longitude': place.get('geometry', {}).get('location', {}).get('lng'),
                'opening_hours': place.get('opening_hours', {}).get('open_now'),
                'price_level': place.get('price_level'),
                'types': place.get('types', []),
                'photos': [photo.get('photo_reference') for photo in place.get('photos', [])][:3]  # First 3 photos
            }
            doctors.append(doctor)
        
        return Response({
            'doctors': doctors,
            'count': len(doctors),
            'next_page_token': data.get('next_page_token')
        })
        
    except Exception as e:
        logger.error(f"Error in find_doctors: {str(e)}")
        return Response(
            {"error": "Internal server error"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )