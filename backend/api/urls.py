from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/health/', views.health_check, name='health_check'),
    path('api/find_hospitals/', views.find_hospitals, name='find_hospitals'),
    path('api/find_doctors/', views.find_doctors, name='find_doctors'),
]
