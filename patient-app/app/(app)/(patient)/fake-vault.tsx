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
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';

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
      const sessionId = pathParts[pathParts.length - 2]; // Get session ID from URL
      
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
      // Use deployed backend URL
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
                // Clear form after successful upload
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

    // Open camera to scan doctor's QR code
    setShowScanner(true);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            to open your camera and scan the QR code displayed on the doctor's screen.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#8892b0"
            value={patientData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <Text style={styles.inputLabel}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="#8892b0"
            value={patientData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Current Symptoms *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your current symptoms"
            placeholderTextColor="#8892b0"
            value={patientData.symptoms}
            onChangeText={(value) => handleInputChange('symptoms', value)}
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Medical History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Previous medical conditions, surgeries, etc."
            placeholderTextColor="#8892b0"
            value={patientData.medicalHistory}
            onChangeText={(value) => handleInputChange('medicalHistory', value)}
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Current Medications</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List current medications and dosages"
            placeholderTextColor="#8892b0"
            value={patientData.currentMedications}
            onChangeText={(value) => handleInputChange('currentMedications', value)}
            multiline={true}
            numberOfLines={2}
          />

          <Text style={styles.inputLabel}>Allergies</Text>
          <TextInput
            style={styles.input}
            placeholder="Known allergies (medications, food, etc.)"
            placeholderTextColor="#8892b0"
            value={patientData.allergies}
            onChangeText={(value) => handleInputChange('allergies', value)}
          />

          <Text style={styles.inputLabel}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Emergency contact name and phone"
            placeholderTextColor="#8892b0"
            value={patientData.emergencyContact}
            onChangeText={(value) => handleInputChange('emergencyContact', value)}
          />

          <Text style={styles.inputLabel}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional information you'd like to share"
            placeholderTextColor="#8892b0"
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
            <Text style={styles.shareButtonText}>
              {isUploading ? '⏳ Uploading...' : '� Scan Doctor QR Code'}
            </Text>
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
            />          <View style={styles.scannerOverlay}>
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
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
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
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#8892b0',
    fontSize: 14,
    lineHeight: 20,
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
  },
  input: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 45,
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
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonHint: {
    color: '#8892b0',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    alignItems: 'center',
  },
  closeScannerButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  closeScannerText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
  },
  scannerInstructions: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default FakeVaultScreen;
