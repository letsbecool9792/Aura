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
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import subprocess
import json
import os
import uuid
from .models import DoctorSession, PatientVaultData
from django.views.decorators.http import require_http_methods
import sys

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

@csrf_exempt # For development only. Use token authentication for production.
def identify_medicine_view(request):
    if request.method != 'POST' or not request.FILES.get('image'):
        return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

    image_file = request.FILES['image']
    
    # Save the uploaded file to a temporary location
    temp_path = default_storage.save(f'tmp/{image_file.name}', ContentFile(image_file.read()))
    uploaded_file_path = os.path.join(settings.MEDIA_ROOT, temp_path)

    try:
        # Define paths for the subprocess
        # Assumes the 'ml' folder is at the same level as the 'backend' folder
        project_root = settings.BASE_DIR.parent
        script_path = os.path.join(project_root, 'ml', 'analyze_medicine.py')
        
        # Use sys.executable to ensure we use the same Python interpreter
        # that is running Django
        python_executable = sys.executable

        # Execute the script
        result = subprocess.run(
            [python_executable, script_path, uploaded_file_path],
            capture_output=True,
            text=True,
            check=True
        )
        response_data = json.loads(result.stdout)
        
    except subprocess.CalledProcessError as e:
        # Error from within the Python script
        error_details = e.stderr or result.stdout
        response_data = {'status': 'error', 'message': 'Analysis script failed', 'details': error_details}
    except Exception as e:
        response_data = {'status': 'error', 'message': str(e)}
    finally:
        # Clean up the temporary file
        default_storage.delete(temp_path)

    return JsonResponse(response_data)


# Vault System Views

@csrf_exempt
@api_view(['POST'])
def create_doctor_session(request):
    """Create a new doctor session and return session ID"""
    try:
        doctor_name = request.data.get('doctor_name', 'Anonymous Doctor')
        session = DoctorSession.objects.create(doctor_name=doctor_name)
        
        return Response({
            'session_id': str(session.session_id),
            'doctor_name': session.doctor_name,
            'created_at': session.created_at,
            'qr_url': f"{request.build_absolute_uri('/')[:-1]}/api/vault/upload/{session.session_id}/"
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@require_http_methods(["POST"])
def upload_patient_data(request, session_id):
    """Receive patient data for a specific doctor session"""
    try:
        # Find the session
        session = DoctorSession.objects.get(session_id=session_id, is_active=True)
        
        # Parse JSON data
        data = json.loads(request.body)
        
        # Create patient vault data
        patient_data = PatientVaultData.objects.create(
            session=session,
            name=data.get('name', ''),
            age=data.get('age', ''),
            symptoms=data.get('symptoms', ''),
            medical_history=data.get('medicalHistory', ''),
            current_medications=data.get('currentMedications', ''),
            allergies=data.get('allergies', ''),
            emergency_contact=data.get('emergencyContact', ''),
            additional_notes=data.get('additionalNotes', '')
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Patient data received successfully',
            'patient_id': patient_data.id,
            'timestamp': patient_data.timestamp
        })
        
    except DoctorSession.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid or expired session'
        }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@csrf_exempt
@api_view(['GET'])
def get_session_data(request, session_id):
    """Get all patient data for a specific doctor session"""
    try:
        session = DoctorSession.objects.get(session_id=session_id, is_active=True)
        patient_data_list = PatientVaultData.objects.filter(session=session).order_by('-timestamp')
        
        data = []
        for patient in patient_data_list:
            data.append({
                'id': patient.id,
                'name': patient.name,
                'age': patient.age,
                'symptoms': patient.symptoms,
                'medical_history': patient.medical_history,
                'current_medications': patient.current_medications,
                'allergies': patient.allergies,
                'emergency_contact': patient.emergency_contact,
                'additional_notes': patient.additional_notes,
                'timestamp': patient.timestamp
            })
        
        return Response({
            'session_id': str(session.session_id),
            'doctor_name': session.doctor_name,
            'patients': data
        }, status=status.HTTP_200_OK)
        
    except DoctorSession.DoesNotExist:
        return Response({
            'error': 'Session not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)