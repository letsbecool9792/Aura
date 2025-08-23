import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, FlatList, Platform } from "react-native";
import * as Location from 'expo-location';
import axios from 'axios';

interface PlaceData {
  place_id: string;
  name: string;
  address: string;
  rating: number;
  latitude: number;
  longitude: number;
  opening_hours: boolean | null;
  types: string[];
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Using IP address for tunnel mode - accessible from Expo Go
const API_BASE_URL = 'http://10.161.37.152:8000';

export default function Index() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [hospitals, setHospitals] = useState<PlaceData[]>([]);
  const [doctors, setDoctors] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<PlaceData | null>(null);
  const [activeSearch, setActiveSearch] = useState<'hospitals' | 'doctors' | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby hospitals and doctors.');
        return;
      }
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${API_BASE_URL}/api/health/`);
      const response = await axios.get(`${API_BASE_URL}/api/health/`, { timeout: 10000 });
      console.log('Connection test successful:', response.data);
      Alert.alert('Success', `Connected to Django server!\nStatus: ${response.data.status}\nMessage: ${response.data.message}`);
    } catch (error: any) {
      console.error('Connection test failed:', error);
      let errorMessage = `Cannot reach Django server at ${API_BASE_URL}`;
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage += '\nNetwork Error: Check if Django server is running and accessible';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += '\nConnection Refused: Server may not be running';
      } else if (error.response) {
        errorMessage += `\nHTTP ${error.response.status}: ${error.response.statusText}`;
      } else {
        errorMessage += `\nError: ${error.message}`;
      }
      
      Alert.alert('Connection Failed', errorMessage);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      
      setLocation(coords);
      setLoading(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to get your current location. Please check your GPS settings.');
    }
  };

  const findHospitals = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please wait for GPS to load.');
      return;
    }

    try {
      setLoading(true);
      setActiveSearch('hospitals');
      setDoctors([]); // Clear doctors when searching for hospitals
      
      console.log('Making request to:', `${API_BASE_URL}/api/find_hospitals/`);
      console.log('Request data:', {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000,
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/find_hospitals/`, {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000, // 5km radius
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
      setHospitals(response.data.hospitals || []);
      setLoading(false);
      
      if (response.data.hospitals?.length === 0) {
        Alert.alert('No Results', 'No hospitals found in your area.');
      }
    } catch (error: any) {
      console.error('Error finding hospitals:', error);
      setLoading(false);
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        Alert.alert('Network Error', `Cannot connect to server at ${API_BASE_URL}. Please check if the Django server is running and accessible.`);
      } else {
        Alert.alert('Error', 'Failed to find hospitals. Please check your internet connection.');
      }
    }
  };

  const findDoctors = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please wait for GPS to load.');
      return;
    }

    try {
      setLoading(true);
      setActiveSearch('doctors');
      setHospitals([]); // Clear hospitals when searching for doctors
      
      console.log('Making request to:', `${API_BASE_URL}/api/find_doctors/`);
      
      const response = await axios.post(`${API_BASE_URL}/api/find_doctors/`, {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 5000, // 5km radius
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
      setDoctors(response.data.doctors || []);
      setLoading(false);
      
      if (response.data.doctors?.length === 0) {
        Alert.alert('No Results', 'No doctors found in your area.');
      }
    } catch (error: any) {
      console.error('Error finding doctors:', error);
      setLoading(false);
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        Alert.alert('Network Error', `Cannot connect to server at ${API_BASE_URL}. Please check if the Django server is running and accessible.`);
      } else {
        Alert.alert('Error', 'Failed to find doctors. Please check your internet connection.');
      }
    }
  };

  const renderMarkerInfo = () => {
    if (!selectedMarker) return null;

    return (
      <View style={styles.markerInfo}>
        <Text style={styles.markerTitle}>{selectedMarker.name}</Text>
        <Text style={styles.markerAddress}>{selectedMarker.address}</Text>
        <Text style={styles.markerRating}>
          Rating: {selectedMarker.rating ? `${selectedMarker.rating}/5` : 'No rating'}
        </Text>
        <Text style={styles.markerStatus}>
          Status: {selectedMarker.opening_hours === null 
            ? 'Unknown' 
            : selectedMarker.opening_hours 
              ? 'Open' 
              : 'Closed'}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedMarker(null)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Healthcare Finder</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.hospitalButton]}
            onPress={findHospitals}
            disabled={loading || !location}
          >
            <Text style={styles.buttonText}>Find Hospitals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.doctorButton]}
            onPress={findDoctors}
            disabled={loading || !location}
          >
            <Text style={styles.buttonText}>Find Doctors</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>
              {!location ? 'Getting your location...' : `Finding ${activeSearch}...`}
            </Text>
          </View>
        )}
      </View>

      {location ? (
        <View style={styles.resultsContainer}>
          {hospitals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏥 Nearby Hospitals ({hospitals.length})</Text>
              <FlatList
                data={hospitals}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.resultItem}
                    onPress={() => setSelectedMarker(item)}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemAddress}>{item.address}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemRating}>
                        ⭐ {item.rating ? `${item.rating}/5` : 'No rating'}
                      </Text>
                      <Text style={styles.itemStatus}>
                        {item.opening_hours === null 
                          ? '❓ Unknown' 
                          : item.opening_hours 
                            ? '🟢 Open' 
                            : '🔴 Closed'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
          
          {doctors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍⚕️ Nearby Doctors ({doctors.length})</Text>
              <FlatList
                data={doctors}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.resultItem}
                    onPress={() => setSelectedMarker(item)}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemAddress}>{item.address}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemRating}>
                        ⭐ {item.rating ? `${item.rating}/5` : 'No rating'}
                      </Text>
                      <Text style={styles.itemStatus}>
                        {item.opening_hours === null 
                          ? '❓ Unknown' 
                          : item.opening_hours 
                            ? '🟢 Open' 
                            : '🔴 Closed'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {hospitals.length === 0 && doctors.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>🔍 Find Healthcare Providers</Text>
              <Text style={styles.emptyStateText}>
                Use the buttons above to find nearby hospitals or doctors based on your current location.
              </Text>
              <Text style={styles.locationInfo}>
                📍 Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noLocationContainer}>
          <Text style={styles.noLocationText}>
            Getting your location...
          </Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      
      {renderMarkerInfo()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  hospitalButton: {
    backgroundColor: '#FF6B6B',
  },
  doctorButton: {
    backgroundColor: '#4ECDC4',
  },
  testButton: {
    backgroundColor: '#FFA500',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemRating: {
    fontSize: 14,
    color: '#666',
  },
  itemStatus: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  locationInfo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  markerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  markerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  markerRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  markerStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
