import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../providers/AuthProvider';

// Simulated Web3 Backend
const mockIPFSStorage: { [key: string]: any } = {};

// Document Types for better UX
const DOCUMENT_TYPES = [
  { id: 'blood_test', label: 'Blood Test Results', icon: '🩸' },
  { id: 'xray', label: 'X-Ray Report', icon: '📷' },
  { id: 'prescription', label: 'Prescription', icon: '💊' },
  { id: 'lab_report', label: 'Lab Report', icon: '🔬' },
  { id: 'medical_certificate', label: 'Medical Certificate', icon: '📋' },
  { id: 'vaccination', label: 'Vaccination Record', icon: '💉' },
  { id: 'surgery', label: 'Surgery Report', icon: '🏥' },
  { id: 'other', label: 'Other Document', icon: '📄' },
];

// Mock functions
const uploadToIPFS = async (data: any): Promise<string> => {
  const hash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  mockIPFSStorage[hash] = data;
  console.log('Uploaded to IPFS:', hash);
  return hash;
};

const logHashToBlockchain = async (hash: string, recordType: string): Promise<void> => {
  console.log('Logged to blockchain:', { hash, recordType, timestamp: new Date().toISOString() });
  await new Promise(resolve => setTimeout(resolve, 1000));
};

export default function PatientDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<Array<{ id: string; type: string; data: string; hash: string; imageUri?: string }>>([]);
  const [recordType, setRecordType] = useState('');
  const [recordData, setRecordData] = useState('');
  const [sharedRecord, setSharedRecord] = useState<{ type: string; data: string; hash: string } | null>(null);

  // Document scanning states
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ color: '#ffffff', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const handleSaveRecord = async () => {
    if (!recordType.trim() || !recordData.trim()) {
      Alert.alert('Error', 'Please fill in both record type and data');
      return;
    }

    try {
      const record = {
        type: recordType.trim(),
        data: recordData.trim(),
        timestamp: new Date().toISOString(),
      };

      const hash = await uploadToIPFS(record);
      await logHashToBlockchain(hash, record.type);

      const newRecord = {
        id: Date.now().toString(),
        type: record.type,
        data: record.data,
        hash: hash,
      };

      setRecords(prev => [...prev, newRecord]);
      setRecordType('');
      setRecordData('');
      Alert.alert('Success', 'Record saved to health vault!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save record');
      console.error('Save record error:', error);
    }
  };

  const handleShareRecord = (record: { type: string; data: string; hash: string }) => {
    setSharedRecord(record);
  };

  const handleScanDocument = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera roll permission is required to scan documents');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setScannedImage(result.assets[0].uri);
        setShowDocumentScanner(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access camera roll');
      console.error('Camera error:', error);
    }
  };

  const handleDocumentTypeSelect = (typeId: string) => {
    setSelectedDocumentType(typeId);
  };

  const handleUploadDocument = async () => {
    if (!selectedDocumentType || !scannedImage) {
      Alert.alert('Error', 'Please select document type and scan an image');
      return;
    }

    setIsUploading(true);

    try {
      const documentData = {
        type: selectedDocumentType,
        data: `Scanned ${DOCUMENT_TYPES.find(t => t.id === selectedDocumentType)?.label}`,
        imageUri: scannedImage,
        timestamp: new Date().toISOString(),
      };

      const hash = await uploadToIPFS(documentData);
      await logHashToBlockchain(hash, documentData.type);

      const newRecord = {
        id: Date.now().toString(),
        type: documentData.data,
        data: `Document uploaded to IPFS`,
        hash: hash,
        imageUri: scannedImage,
      };

      setRecords(prev => [...prev, newRecord]);

      setIsUploading(false);
      setShowDocumentScanner(false);
      setScannedImage(null);
      setSelectedDocumentType('');
      Alert.alert('Success', 'Document scanned and uploaded successfully!');

    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload document');
      console.error('Upload error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'Patient'}!</Text>
          <Text style={styles.roleText}>Patient Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Document Scanner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Scan Documents</Text>
          <Text style={styles.description}>
            Scan medical documents, test results, prescriptions, and more
          </Text>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanDocument}>
            <Text style={styles.scanButtonText}>📷 Scan Document</Text>
          </TouchableOpacity>
        </View>

        {/* Medicine Scanner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medicine Scanner</Text>
          <Text style={styles.description}>
            Identify medicines by taking a photo of the medicine packet
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#4CAF50' }]} 
            onPress={() => router.push("/(app)/(patient)/medicine-scanner" as any)}
          >
            <Text style={styles.scanButtonText}>💊 Scan Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Brain Tumor Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Brain Tumor Detection</Text>
          <Text style={styles.description}>
            AI-powered tumor segmentation from brain scan images
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#FF6B6B' }]} 
            onPress={() => router.push("/(app)/(patient)/brain-tumor-detector" as any)}
          >
            <Text style={styles.scanButtonText}>🧠 Analyze Brain Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Bone Fracture Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🦴 Bone Fracture Detection</Text>
          <Text style={styles.description}>
            AI-powered fracture detection using DANet model trained on FracAtlas dataset
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#4F46E5' }]} 
            onPress={() => router.push("/(app)/(patient)/bone-fracture-detector" as any)}
          >
            <Text style={styles.scanButtonText}>🦴 Analyze X-ray Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Fake Vault Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Share Health Info</Text>
          <Text style={styles.description}>
            Quickly share your health information with doctors via QR code scanning
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#10B981' }]} 
            onPress={() => router.push("/(app)/(patient)/fake-vault" as any)}
          >
            <Text style={styles.scanButtonText}>📱 Share with Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Record Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Add New Record</Text>
          <TextInput
            style={styles.input}
            placeholder="Record Type (e.g., Blood Test, X-Ray)"
            placeholderTextColor="#666"
            value={recordType}
            onChangeText={setRecordType}
          />
          <TextInput
            style={styles.textArea}
            placeholder="Record Data"
            placeholderTextColor="#666"
            value={recordData}
            onChangeText={setRecordData}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveRecord}>
            <Text style={styles.buttonText}>Save to Vault</Text>
          </TouchableOpacity>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Your Health Records</Text>
          {records.length === 0 ? (
            <Text style={styles.emptyText}>No records yet. Add your first health record above.</Text>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordData}>{record.data}</Text>
                {record.imageUri && (
                  <Image source={{ uri: record.imageUri }} style={styles.recordImage} />
                )}
                <Text style={styles.recordHash}>Hash: {record.hash.substring(0, 20)}...</Text>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShareRecord(record)}
                >
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* QR Code Display */}
        {sharedRecord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share Record</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify({
                  hash: sharedRecord.hash,
                  type: sharedRecord.type,
                  data: sharedRecord.data,
                })}
                size={200}
                color="#000"
                backgroundColor="#fff"
              />
              <Text style={styles.qrText}>Scan this QR code to access the record</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSharedRecord(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Document Scanner Modal */}
      <Modal
        visible={showDocumentScanner}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Document</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDocumentScanner(false)}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {scannedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: scannedImage }} style={styles.imagePreview} />
              </View>
            )}

            <View style={styles.documentTypeSection}>
              <Text style={styles.documentTypeTitle}>Select Document Type:</Text>
              <View style={styles.documentTypeGrid}>
                {DOCUMENT_TYPES.map((docType) => (
                  <TouchableOpacity
                    key={docType.id}
                    style={[
                      styles.documentTypeButton,
                      selectedDocumentType === docType.id && styles.selectedDocumentTypeButton
                    ]}
                    onPress={() => handleDocumentTypeSelect(docType.id)}
                  >
                    <Text style={styles.documentTypeIcon}>{docType.icon}</Text>
                    <Text style={[
                      styles.documentTypeLabel,
                      selectedDocumentType === docType.id && styles.selectedDocumentTypeLabel
                    ]}>
                      {docType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                (!selectedDocumentType || !scannedImage || isUploading) && styles.disabledButton
              ]}
              onPress={handleUploadDocument}
              disabled={!selectedDocumentType || !scannedImage || isUploading}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roleText: {
    fontSize: 14,
    color: '#8892b0',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#8892b0',
    lineHeight: 24,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#38a169',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordCard: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  recordType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  recordData: {
    fontSize: 16,
    color: '#8892b0',
    marginBottom: 8,
    lineHeight: 22,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordHash: {
    fontSize: 14,
    color: '#4a5568',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#38a169',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 12,
  },
  qrText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeModalButton: {
    padding: 8,
  },
  closeModalButtonText: {
    fontSize: 24,
    color: '#8892b0',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  documentTypeSection: {
    marginBottom: 30,
  },
  documentTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  documentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentTypeButton: {
    width: '48%',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDocumentTypeButton: {
    borderColor: '#0f3460',
    backgroundColor: '#0f3460',
  },
  documentTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  documentTypeLabel: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedDocumentTypeLabel: {
    color: '#ffffff',
  },
  uploadButton: {
    backgroundColor: '#38a169',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#4a5568',
  },
});