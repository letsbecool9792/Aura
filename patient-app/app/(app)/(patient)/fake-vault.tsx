import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";

interface PatientData {
  name: string;
  age: string;
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  emergencyContact: string;
  additionalNotes: string;
}

const FakeVaultScreen = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    emergencyContact: '',
    additionalNotes: '',
  });

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateData = (): boolean => {
    if (!patientData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!patientData.age.trim()) {
      Alert.alert('Error', 'Please enter your age');
      return false;
    }
    if (!patientData.symptoms.trim()) {
      Alert.alert('Error', 'Please describe your symptoms');
      return false;
    }
    return true;
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setShowScanner(false);
    
    if (!validateData()) {
      return;
    }

    // Extract session ID from QR code URL
    try {
      const url = new URL(data);
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 2];
      
      if (!sessionId) {
        Alert.alert('Error', 'Invalid QR code format');
        return;
      }

      await uploadDataToDoctor(data, sessionId);
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code. Please scan a valid doctor QR code.');
    }
  };

  const uploadDataToDoctor = async (qrUrl: string, sessionId: string) => {
    setIsUploading(true);
    
    try {
      const localUrl = `https://aura-krw4.onrender.com/api/vault/upload/${sessionId}/`;
      
      const response = await fetch(localUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Your health information has been securely shared with the doctor.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPatientData({
                  name: '',
                  age: '',
                  symptoms: '',
                  medicalHistory: '',
                  currentMedications: '',
                  allergies: '',
                  emergencyContact: '',
                  additionalNotes: '',
                });
              },
            },
          ]
        );
      } else {
        throw new Error('Failed to upload data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share data with doctor. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareWithDoctor = () => {
    if (!validateData()) {
      return;
    }

    if (hasPermission === null) {
      Alert.alert('Permission Required', 'Requesting camera permission...');
      return;
    }
    
    if (hasPermission === false) {
      Alert.alert('No Camera Access', 'Please enable camera access to scan QR codes');
      return;
    }

    setShowScanner(true);
  };

  if (!fontsLoaded || hasPermission === null) {
    return (
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bdc3c7" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No access to camera</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Health Info</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Patient Information</Text>
          <Text style={styles.description}>
            Fill in your health information below. When ready, tap "Scan Doctor QR Code"
            to open your camera and securely share the data with the doctor.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#bdc3c7"
            value={patientData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <Text style={styles.inputLabel}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="#bdc3c7"
            value={patientData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Current Symptoms *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your current symptoms"
            placeholderTextColor="#bdc3c7"
            value={patientData.symptoms}
            onChangeText={(value) => handleInputChange('symptoms', value)}
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Medical History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Previous medical conditions, surgeries, etc."
            placeholderTextColor="#bdc3c7"
            value={patientData.medicalHistory}
            onChangeText={(value) => handleInputChange('medicalHistory', value)}
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Current Medications</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List current medications and dosages"
            placeholderTextColor="#bdc3c7"
            value={patientData.currentMedications}
            onChangeText={(value) => handleInputChange('currentMedications', value)}
            multiline={true}
            numberOfLines={2}
          />

          <Text style={styles.inputLabel}>Allergies</Text>
          <TextInput
            style={styles.input}
            placeholder="Known allergies (medications, food, etc.)"
            placeholderTextColor="#bdc3c7"
            value={patientData.allergies}
            onChangeText={(value) => handleInputChange('allergies', value)}
          />

          <Text style={styles.inputLabel}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Emergency contact name and phone"
            placeholderTextColor="#bdc3c7"
            value={patientData.emergencyContact}
            onChangeText={(value) => handleInputChange('emergencyContact', value)}
          />

          <Text style={styles.inputLabel}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional information you'd like to share"
            placeholderTextColor="#bdc3c7"
            value={patientData.additionalNotes}
            onChangeText={(value) => handleInputChange('additionalNotes', value)}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        {/* Share Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.shareButton, isUploading && styles.disabledButton]}
            onPress={handleShareWithDoctor}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.shareButtonText}>
                📱 Scan Doctor QR Code
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.buttonHint}>
            Tap to open camera and scan the doctor's QR code
          </Text>
        </View>
      </ScrollView>

      {/* QR Code Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity
              style={styles.closeScannerButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.closeScannerText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Doctor's QR Code</Text>
          </View>
          
          <CameraView
            style={styles.scanner}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerInstructions}>
              Point your camera at the doctor's QR code to share your health information
            </Text>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    // The background is handled by LinearGradient on the SafeAreaView
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#bdc3c7",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "SpaceGrotesk_Regular",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Regular",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "SpaceGrotesk_Bold",
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: "SpaceGrotesk_Bold",
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    marginBottom: 25,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_Bold",
  },
  description: {
    color: '#bdc3c7',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
  formSection: {
    marginBottom: 30,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 45,
    fontFamily: "SpaceGrotesk_Regular",
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  shareButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "SpaceGrotesk_Bold",
  },
  buttonHint: {
    color: '#bdc3c7',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeScannerButton: {
    padding: 10,
  },
  closeScannerText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "SpaceGrotesk_Bold",
  },
  scannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Adjust to center the text
    fontFamily: "SpaceGrotesk_Bold",
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
  },
  scannerInstructions: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
});

export default FakeVaultScreen;