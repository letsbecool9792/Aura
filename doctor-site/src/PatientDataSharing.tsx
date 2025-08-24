import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface PatientData {
  id: number;
  name: string;
  age: string;
  symptoms: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
  emergency_contact: string;
  additional_notes: string;
  timestamp: string;
}

interface SessionData {
  session_id: string;
  doctor_name: string;
  patients: PatientData[];
}

const PatientDataSharing: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [doctorName, setDoctorName] = useState('Dr. John Smith');

  const BACKEND_URL = 'https://aura-krw4.onrender.com'; // Updated to deployed backend

  const createSession = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/vault/create-session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_name: doctorName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(data.qr_url);
      setQrCodeUrl(qrCodeDataUrl);
      
      // Start polling for patient data
      startPolling(data.session_id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/vault/session/${sessionId}/`);
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Clean up interval when component unmounts or session changes
    return () => clearInterval(interval);
  };

  const resetSession = () => {
    setSessionId('');
    setQrCodeUrl('');
    setSessionData(null);
    setError('');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          📱 Patient Data Sharing
        </h2>
        <p className="text-gray-600 mb-6">
          Generate a QR code for patients to scan and share their health information instantly.
        </p>

        {!sessionId ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter doctor name"
              />
            </div>
            
            <button
              onClick={createSession}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating Session...' : 'Generate QR Code'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-4">QR Code for Patients</h3>
              {qrCodeUrl && (
                <div className="space-y-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto w-48 h-48 border-2 border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Patients can scan this QR code with the Aura app to share their health information
                  </p>
                  <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                    Session ID: {sessionId}
                  </div>
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🟢 Session Active
                </h3>
                <p className="text-green-700">
                  Doctor: {doctorName}
                </p>
                <p className="text-green-700 text-sm">
                  Waiting for patient data...
                </p>
              </div>
              
              <button
                onClick={resetSession}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Patient Data Display */}
      {sessionData && sessionData.patients.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Received Patient Data ({sessionData.patients.length})
          </h3>
          
          <div className="space-y-6">
            {sessionData.patients.map((patient) => (
              <div
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {patient.name} (Age: {patient.age})
                  </h4>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(patient.timestamp)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Current Symptoms:</strong>
                    <p className="text-gray-900 mt-1">{patient.symptoms || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Medical History:</strong>
                    <p className="text-gray-900 mt-1">{patient.medical_history || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Current Medications:</strong>
                    <p className="text-gray-900 mt-1">{patient.current_medications || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Allergies:</strong>
                    <p className="text-gray-900 mt-1">{patient.allergies || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Emergency Contact:</strong>
                    <p className="text-gray-900 mt-1">{patient.emergency_contact || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Additional Notes:</strong>
                    <p className="text-gray-900 mt-1">{patient.additional_notes || 'Not provided'}</p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Add to Records
                  </button>
                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDataSharing;
