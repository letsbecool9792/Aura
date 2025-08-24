import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  FlatList, 
  SafeAreaView 
} from "react-native";
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

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

// Using environment variable for API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://aura-krw4.onrender.com';

export default function HealthcareFinder() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [hospitals, setHospitals] = useState<PlaceData[]>([]);
  const [doctors, setDoctors] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<PlaceData | null>(null);
  const [activeSearch, setActiveSearch] = useState<'hospitals' | 'doctors' | null>(null);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

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

  useEffect(() => {
    requestLocationPermission();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏥 Healthcare Finder</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Location Status */}
        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              📍 Current Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Search Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.searchButton, styles.hospitalButton]}
            onPress={findHospitals}
            disabled={loading || !location}
          >
            <Text style={styles.searchButtonText}>🏥 Find Hospitals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.searchButton, styles.doctorButton]}
            onPress={findDoctors}
            disabled={loading || !location}
          >
            <Text style={styles.searchButtonText}>👨‍⚕️ Find Doctors</Text>
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              {!location ? 'Getting your location...' : `Finding ${activeSearch}...`}
            </Text>
          </View>
        )}

        {/* Results */}
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
              scrollEnabled={false}
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
              scrollEnabled={false}
            />
          </View>
        )}

        {hospitals.length === 0 && doctors.length === 0 && !loading && location && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>🔍 Find Healthcare Providers</Text>
            <Text style={styles.emptyStateText}>
              Use the buttons above to find nearby hospitals or doctors based on your current location.
            </Text>
          </View>
        )}

        {!location && !loading && (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationTitle}>📍 Location Required</Text>
            <Text style={styles.noLocationText}>
              We need your location to find nearby healthcare providers. Please enable location services and try again.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={requestLocationPermission}
            >
              <Text style={styles.retryButtonText}>Retry Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {renderMarkerInfo()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "SpaceGrotesk_Regular",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  locationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  locationText: {
    color: "#bdc3c7",
    fontSize: 14,
    fontFamily: "SpaceGrotesk_Regular",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 15,
  },
  searchButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  hospitalButton: {
    backgroundColor: "#e74c3c",
  },
  doctorButton: {
    backgroundColor: "#3498db",
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  loadingText: {
    color: "#bdc3c7",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "SpaceGrotesk_Regular",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Bold",
  },
  resultItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
    fontFamily: "SpaceGrotesk_Bold",
  },
  itemAddress: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_Regular",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemRating: {
    fontSize: 14,
    color: "#f39c12",
    fontFamily: "SpaceGrotesk_Regular",
  },
  itemStatus: {
    fontSize: 14,
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Regular",
  },
  emptyState: {
    alignItems: "center",
    marginVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Bold",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_Regular",
  },
  noLocationContainer: {
    alignItems: "center",
    marginVertical: 50,
    paddingHorizontal: 20,
  },
  noLocationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Bold",
  },
  noLocationText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  markerInfo: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  markerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    fontFamily: "SpaceGrotesk_Bold",
  },
  markerAddress: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 5,
    fontFamily: "SpaceGrotesk_Regular",
  },
  markerRating: {
    fontSize: 14,
    color: "#f39c12",
    marginBottom: 5,
    fontFamily: "SpaceGrotesk_Regular",
  },
  markerStatus: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Regular",
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
});
