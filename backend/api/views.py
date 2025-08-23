import requests
import jwt
from datetime import datetime, timedelta
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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

@api_view(['POST'])
def google_auth(request):
    """
    Handle Google OAuth2 authentication
    Expected payload: {"token": "google_id_token", "role": "patient|doctor"}
    """
    try:
        token = request.data.get('token')
        role = request.data.get('role', 'patient')
        
        if not token:
            return Response(
                {"error": "Google ID token is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the Google ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
                
        except ValueError as e:
            logger.error(f"Invalid Google token: {str(e)}")
            return Response(
                {"error": "Invalid Google token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Extract user information from Google token
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if len(name.split(' ')) > 1 else '',
            }
        )
        
        # Create JWT token for the user
        payload = {
            'user_id': user.id,
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'role': role,
            'google_id': google_id,
            'picture': picture,
            'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
        }
        
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        return Response({
            'success': True,
            'token': jwt_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': role,
                'picture': picture,
                'is_new_user': created
            }
        })
        
    except Exception as e:
        logger.error(f"Error in google_auth: {str(e)}")
        return Response(
            {"error": "Authentication failed"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def verify_token(request):
    """
    Verify JWT token and return user information
    Expected payload: {"token": "jwt_token"}
    """
    try:
        token = request.data.get('token')
        
        if not token:
            return Response(
                {"error": "Token is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            return Response({
                'success': True,
                'user': {
                    'id': payload.get('user_id'),
                    'email': payload.get('email'),
                    'name': payload.get('name'),
                    'role': payload.get('role'),
                    'picture': payload.get('picture'),
                }
            })
            
        except jwt.ExpiredSignatureError:
            return Response(
                {"error": "Token has expired"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return Response(
                {"error": "Invalid token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
    except Exception as e:
        logger.error(f"Error in verify_token: {str(e)}")
        return Response(
            {"error": "Token verification failed"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def auth_success(request):
    """Success callback for OAuth flow"""
    return JsonResponse({
        'success': True,
        'message': 'Authentication successful'
    })

@api_view(['GET'])
def auth_logout(request):
    """Logout callback"""
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    })