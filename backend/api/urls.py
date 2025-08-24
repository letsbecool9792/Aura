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
]
