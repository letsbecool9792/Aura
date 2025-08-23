# Healthcare Finder - Hospital & Doctor Locator

A comprehensive healthcare finder application with Django REST API backend, React Native mobile app, and React web portal.

## 🏗️ Project Structure

```
Aura/
├── backend/               # Django REST API
├── patient-app/          # React Native Expo app
├── doctor-site/          # Vite React web app
└── ml/                   # Machine Learning components
```

## 🗝️ API Key Setup

### Google Places & Maps API Key

You need to get API keys from Google Cloud Console:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable the following APIs**:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API (optional)
4. **Create credentials (API Key)**:
   - Go to "Credentials" section
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. **Secure your API key** (Important!):
   - Click on the API key to edit
   - Add restrictions:
     - For development: Add your IP address
     - For production: Add your domain names
     - Restrict to specific APIs: Places API, Maps JavaScript API

### Environment Configuration

#### Backend (.env file in `/backend/`)
```env
GOOGLE_PLACES_API_KEY=your_actual_google_places_api_key_here
```

#### Frontend (.env file in `/doctor-site/`) - NOT NEEDED
```
The doctor-site no longer requires environment variables as maps functionality has been removed.
```

#### React Native (update the API_BASE_URL in index.tsx)
```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:8000'; // Replace with your machine's IP
```

## 🚀 Setup Instructions

### 1. Backend Setup (Django)

```bash
cd backend

# Install Python dependencies
pip install djangorestframework django-cors-headers python-dotenv requests

# Create and configure .env file
echo "GOOGLE_PLACES_API_KEY=your_api_key_here" > .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

The Django API will be available at `http://localhost:8000/`

### 2. React Native App Setup

```bash
cd patient-app

# Install dependencies
npm install expo-location react-native-maps axios

# Update API_BASE_URL in app/index.tsx with your machine's IP
# Replace 'http://192.168.1.100:8000' with your actual IP

# Start the development server
npm start
```

### 3. React Web App Setup

```bash
cd doctor-site

# No additional dependencies needed - uses only React + Tailwind

# Start development server
npm run dev
```

The doctor portal will be available at `http://localhost:5173/`

## 📱 Features

### React Native Patient App
- **Location Permission**: Requests GPS access
- **Find Hospitals**: Search nearby hospitals with red markers
- **Find Doctors**: Search nearby doctors with blue markers
- **Interactive Map**: Shows user location as blue dot
- **Marker Details**: Tap markers to see name, address, rating, and status
- **Real-time Updates**: Live location-based search

### React Web Doctor Portal
- **Professional Dashboard**: Clean, medical-focused interface
- **Multi-tab Navigation**: Dashboard, Patients, Appointments, Settings
- **Statistics Overview**: Patient count, appointments, pending reviews
- **Activity Tracking**: Recent patient interactions and appointments
- **Responsive Design**: Works on desktop and tablet
- **Future-ready**: Structure prepared for additional healthcare features

### Django REST API
- **Secure Endpoints**:
  - `POST /api/find_hospitals/` - Find nearby hospitals
  - `POST /api/find_doctors/` - Find nearby doctors
- **Google Places Integration**: Real-time data from Google Places API
- **Error Handling**: Comprehensive error management
- **CORS Support**: Configured for frontend integration

## 🛠️ API Usage

### Find Hospitals
```bash
curl -X POST http://localhost:8000/api/find_hospitals/ \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "radius": 5000}'
```

### Find Doctors
```bash
curl -X POST http://localhost:8000/api/find_doctors/ \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "radius": 5000}'
```

### Response Format
```json
{
  "hospitals": [
    {
      "place_id": "ChIJ...",
      "name": "City Hospital",
      "address": "123 Main St, City",
      "rating": 4.2,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "opening_hours": true,
      "types": ["hospital", "health"],
      "photos": ["photo_ref1", "photo_ref2"]
    }
  ],
  "count": 1
}
```

## 🔧 Configuration

### Important IP Configuration for React Native

For React Native to connect to your Django server:

1. **Find your machine's IP address**:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Update React Native app**:
   - Edit `patient-app/app/index.tsx`
   - Change `API_BASE_URL` to `http://YOUR_IP:8000`

3. **Update Django CORS settings**:
   - The `CORS_ALLOW_ALL_ORIGINS = True` setting allows all origins for development
   - For production, update `CORS_ALLOWED_ORIGINS` with specific domains

## 🎯 Usage Flow

1. **Start Django server**: `python manage.py runserver`
2. **Configure API keys** in `.env` files
3. **Start React Native**: `npm start` in patient-app
4. **Start React web app**: `npm run dev` in doctor-site
5. **Grant location permissions** when prompted
6. **Click "Find Hospitals"** or **"Find Doctors"**
7. **View results** on interactive maps

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Restrict API keys** to specific domains/IPs in production
- **Use HTTPS** in production environments
- **Implement rate limiting** for API endpoints
- **Add authentication** for production use

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to find hospitals"**:
   - Check internet connection
   - Verify API key is valid
   - Ensure location permissions are granted

2. **"Location not available"**:
   - Enable GPS/location services
   - Grant location permissions to the app
   - Try refreshing the app

3. **React Native connection issues**:
   - Verify API_BASE_URL uses correct IP address
   - Ensure Django server is running
   - Check firewall settings

4. **Map not loading**:
   - Verify Google Maps API key
   - Check browser console for errors
   - Ensure Maps JavaScript API is enabled

## 📄 License

This project is built for educational/healthcare purposes.