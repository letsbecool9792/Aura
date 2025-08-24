# Add to api/models.py

from django.db import models
import uuid

class DoctorSession(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    doctor_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Session {self.session_id} - {self.doctor_name}"

class PatientVaultData(models.Model):
    session = models.ForeignKey(DoctorSession, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.CharField(max_length=10)
    symptoms = models.TextField()
    medical_history = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    allergies = models.CharField(max_length=500, blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    additional_notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - Session {self.session.session_id}"
