from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/health/', views.health_check, name='health_check'),
    path('api/find_hospitals/', views.find_hospitals, name='find_hospitals'),
    path('api/find_doctors/', views.find_doctors, name='find_doctors'),
    path('api/auth/google/', views.google_auth, name='google_auth'),
    path('api/auth/verify/', views.verify_token, name='verify_token'),
    path('api/auth/success/', views.auth_success, name='auth_success'),
    path('api/auth/logout/', views.auth_logout, name='auth_logout'),
    path('api/identify-medicine/', views.identify_medicine_view, name='identify_medicine'),
    
    # Vault System URLs
    path('api/vault/create-session/', views.create_doctor_session, name='create_doctor_session'),
    path('api/vault/upload/<uuid:session_id>/', views.upload_patient_data, name='upload_patient_data'),
    path('api/vault/session/<uuid:session_id>/', views.get_session_data, name='get_session_data'),
]
