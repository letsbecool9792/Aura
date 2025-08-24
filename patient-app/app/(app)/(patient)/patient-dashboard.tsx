import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@providers/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Simulated Web3 Backend
const mockIPFSStorage: { [key: string]: any } = {};

// Initialize Gemini AI
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyDw8sTnVKXeN0WGkCaAtO7z_kWh5khPe3o"; // Fallback for demo
const genAI = new GoogleGenerativeAI(API_KEY);

// Document Types for better UX
const DOCUMENT_TYPES = [
  { id: "blood_test", label: "Blood Test Results" },
  { id: "xray", label: "X-Ray Report" },
  { id: "prescription", label: "Prescription" },
  { id: "lab_report", label: "Lab Report" },
  { id: "medical_certificate", label: "Medical Certificate" },
  { id: "vaccination", label: "Vaccination Record" },
  { id: "surgery", label: "Surgery Report" },
  { id: "other", label: "Other Document" },
];

// Chat Message Type
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock functions
const uploadToIPFS = async (data: any): Promise<string> => {
  const hash =
    "Qm" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  mockIPFSStorage[hash] = data;
  console.log("Uploaded to IPFS:", hash);
  return hash;
};

const logHashToBlockchain = async (
  hash: string,
  recordType: string
): Promise<void> => {
  console.log("Logged to blockchain:", {
    hash,
    recordType,
    timestamp: new Date().toISOString(),
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export default function PatientDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<
    Array<{
      id: string;
      type: string;
      data: string;
      hash: string;
      imageUri?: string;
    }>
  >([]);
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");
  const [sharedRecord, setSharedRecord] = useState<{
    type: string;
    data: string;
    hash: string;
  } | null>(null);

  // Document scanning states
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#bdc3c7" />
        <Text style={{ color: "#ffffff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const handleSaveRecord = async () => {
    if (!recordType.trim() || !recordData.trim()) {
      Alert.alert("Error", "Please fill in both record type and data");
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

      setRecords((prev) => [...prev, newRecord]);
      setRecordType("");
      setRecordData("");
      Alert.alert("Success", "Record saved to health vault!");
    } catch (error) {
      Alert.alert("Error", "Failed to save record");
      console.error("Save record error:", error);
    }
  };

  const handleShareRecord = (record: {
    type: string;
    data: string;
    hash: string;
  }) => {
    setSharedRecord(record);
  };

  const handleScanDocument = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Camera roll permission is required to scan documents"
        );
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
      Alert.alert("Error", "Failed to access camera roll");
      console.error("Camera error:", error);
    }
  };

  const handleDocumentTypeSelect = (typeId: string) => {
    setSelectedDocumentType(typeId);
  };

  const handleUploadDocument = async () => {
    if (!selectedDocumentType || !scannedImage) {
      Alert.alert("Error", "Please select document type and scan an image");
      return;
    }

    setIsUploading(true);

    try {
      const documentData = {
        type: selectedDocumentType,
        data: `Scanned ${
          DOCUMENT_TYPES.find((t) => t.id === selectedDocumentType)?.label
        }`,
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

      setRecords((prev) => [...prev, newRecord]);

      setIsUploading(false);
      setShowDocumentScanner(false);
      setScannedImage(null);
      setSelectedDocumentType("");
      Alert.alert("Success", "Document scanned and uploaded successfully!");
    } catch (error) {
      setIsUploading(false);
      Alert.alert("Error", "Failed to upload document");
      console.error("Upload error:", error);
    }
  };

  const generateHealthContext = () => {
    const context = {
      patientName: user?.name || "Patient",
      healthRecords: records.map(record => ({
        type: record.type,
        data: record.data,
        hasImage: !!record.imageUri,
        hash: record.hash
      })),
      totalRecords: records.length
    };

    return `You are Aura Health Assistant, an AI medical assistant helping ${context.patientName}. 

Patient Health Context:
- Patient Name: ${context.patientName}
- Total Health Records: ${context.totalRecords}

Health Records Summary:
${context.healthRecords.map((record, index) => 
  `${index + 1}. ${record.type}: ${record.data}${record.hasImage ? ' (includes medical image/document)' : ''}`
).join('\n')}

Rules:
1. You can explain patient health records, medications, allergies, lab results, and AI scan results in clear, layman-friendly language.
2. You do NOT give medical advice. Always remind the user to consult a licensed doctor for diagnosis or treatment.
3. If the user asks about medications, check the patient’s uploaded medications info first before responding. Mention side effects or interactions only if present in the data.
4. If the user uploads a new image for AI analysis (e.g., X-ray or pill photo), interpret the output from the corresponding model and explain it clearly.
5. Be professional, concise, and supportive, while staying friendly and approachable.
6. Always reference only the data available in the app; never hallucinate patient-specific info.
7. When asked general health questions outside the patient’s data, provide safe, general guidance or direct them to consult a professional.
AND MOST IMPORTANT:
8. Dont yap too much dont repeat that you cant provide medical advice every message, try to keep them short. u dont need to remind the user to talk to a doc every message. 

Format all responses clearly, using short paragraphs or bullet points for lists.`;

  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const healthContext = generateHealthContext();
      const prompt = `${healthContext}\n\nPatient Question: ${userMessage.text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botResponse = response.text();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
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
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || "Patient"}!
          </Text>
          <Text style={styles.roleText}>Patient Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Document Scanner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Documents</Text>
          <Text style={styles.description}>
            Scan medical documents, test results, prescriptions, and more
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanDocument}
          >
            <Text style={styles.scanButtonText}>Scan Document</Text>
          </TouchableOpacity>
        </View>

        {/* Medicine Scanner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicine Scanner</Text>
          <Text style={styles.description}>
            Identify medicines by taking a photo of the medicine packet
          </Text>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: "#85d773" }]}
            onPress={() =>
              router.push("/(app)/(patient)/medicine-scanner" as any)
            }
          >
            <Text style={styles.scanButtonText}>Scan Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Brain Tumor Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brain Tumor Detection</Text>
          <Text style={styles.description}>
            AI-powered tumor segmentation from brain scan images
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#FF6B6B' }]} 
            onPress={() => router.push("/(app)/(patient)/brain-tumor-detector" as any)}
          >
            <Text style={styles.scanButtonText}>Analyze Brain Scan</Text>
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
          <Text style={styles.sectionTitle}>Share Health Info</Text>
          <Text style={styles.description}>
            Quickly share your health information with doctors via QR code scanning
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#10B981' }]} 
            onPress={() => router.push("/(app)/(patient)/fake-vault" as any)}
          >
            <Text style={styles.scanButtonText}>Share with Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Health Assistant Chatbot Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Aura Health Assistant</Text>
          <Text style={styles.description}>
            Chat with your AI health assistant about your medical records and health questions
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#8B5CF6' }]} 
            onPress={() => setShowChatbot(true)}
          >
            <Text style={styles.scanButtonText}>💬 Chat with Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Healthcare Finder Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Healthcare Finder</Text>
          <Text style={styles.description}>
            Find nearby hospitals and doctors using your current location
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: '#e74c3c' }]} 
            onPress={() => router.push("/(app)/(patient)/healthcare-finder" as any)}
          >
            <Text style={styles.scanButtonText}>🔍 Find Healthcare</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Record Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Record</Text>
          <TextInput
            style={styles.input}
            placeholder="Record Type (e.g., Blood Test, X-Ray)"
            placeholderTextColor="#bdc3c7"
            value={recordType}
            onChangeText={setRecordType}
          />
          <TextInput
            style={styles.textArea}
            placeholder="Record Data"
            placeholderTextColor="#bdc3c7"
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
          <Text style={styles.sectionTitle}>Your Health Records</Text>
          {records.length === 0 ? (
            <Text style={styles.emptyText}>
              No records yet. Add your first health record above.
            </Text>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordType}>{record.type}</Text>
                <Text style={styles.recordData}>{record.data}</Text>
                {record.imageUri && (
                  <Image
                    source={{ uri: record.imageUri }}
                    style={styles.recordImage}
                  />
                )}
                <Text style={styles.recordHash}>
                  Hash: {record.hash.substring(0, 20)}...
                </Text>
                {/* <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShareRecord(record)}
                >
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity> */}
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
              <Text style={styles.qrText}>
                Scan this QR code to access the record
              </Text>
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

      {/* Chatbot Modal */}
      <Modal
        visible={showChatbot}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={["#000000ff", "#161616ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
          />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🤖 Aura Health Assistant</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowChatbot(false)}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.chatMessages}
              contentContainerStyle={styles.chatMessagesContent}
            >
              {chatMessages.length === 0 ? (
                <View style={styles.chatWelcome}>
                  <Text style={styles.chatWelcomeTitle}>Welcome to Aura Health Assistant! 👋</Text>
                  <Text style={styles.chatWelcomeText}>
                    I have access to your {records.length} health records and can help you with:
                  </Text>
                  <Text style={styles.chatWelcomeList}>
                    • Questions about your health records{'\n'}
                    • General health information{'\n'}
                    • Medication reminders{'\n'}
                    • Wellness tips{'\n'}
                    • When to see a doctor
                  </Text>
                  <Text style={styles.chatDisclaimer}>
                    Remember: I'm here to provide information, not replace professional medical advice.
                  </Text>
                </View>
              ) : (
                chatMessages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.chatMessage,
                      message.sender === 'user' ? styles.userMessage : styles.botMessage
                    ]}
                  >
                    <Text style={[
                      styles.chatMessageText,
                      message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={styles.chatMessageTime}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))
              )}
              {isChatLoading && (
                <View style={[styles.chatMessage, styles.botMessage]}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.botMessageText}>Aura is thinking...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask me about your health..."
                placeholderTextColor="#bdc3c7"
                value={chatInput}
                onChangeText={setChatInput}
                multiline
                maxLength={500}
                editable={!isChatLoading}
              />
              <TouchableOpacity
                style={[
                  styles.chatSendButton,
                  (!chatInput.trim() || isChatLoading) && styles.chatSendButtonDisabled
                ]}
                onPress={sendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
              >
                <Text style={styles.chatSendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Document Scanner Modal */}
      <Modal
        visible={showDocumentScanner}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={["#2c3e50", "#bdc3c7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
          />
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
                <Image
                  source={{ uri: scannedImage }}
                  style={styles.imagePreview}
                />
              </View>
            )}

            <View style={styles.documentTypeSection}>
              <Text style={styles.documentTypeTitle}>
                Select Document Type:
              </Text>
              <View style={styles.documentTypeGrid}>
                {DOCUMENT_TYPES.map((docType) => (
                  <TouchableOpacity
                    key={docType.id}
                    style={[
                      styles.documentTypeButton,
                      selectedDocumentType === docType.id &&
                        styles.selectedDocumentTypeButton,
                    ]}
                    onPress={() => handleDocumentTypeSelect(docType.id)}
                  >
                    <Text
                      style={[
                        styles.documentTypeLabel,
                        selectedDocumentType === docType.id &&
                          styles.selectedDocumentTypeLabel,
                      ]}
                    >
                      {docType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                (!selectedDocumentType || !scannedImage || isUploading) &&
                  styles.disabledButton,
              ]}
              onPress={handleUploadDocument}
              disabled={!selectedDocumentType || !scannedImage || isUploading}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading ? "Uploading..." : "Upload Document"}
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
    // Note: The LinearGradient handles the background color for the main screen.
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
    backgroundColor: "#2c3e50", // Use a darker color from the new gradient
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent", // Make header transparent for the gradient
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    marginTop: 50,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  roleText: {
    fontSize: 14,
    color: "#bdc3c7", // Lighter color from the new gradient
    fontFamily: "SpaceGrotesk_Regular",
  },
  logoutButton: {
    backgroundColor: "#e74c3c", // A different red for metallic theme
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Semi-transparent for metallic feel
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Bold",
  },
  description: {
    fontSize: 16,
    color: "#bdc3c7",
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: "SpaceGrotesk_Regular",
  },
  scanButton: {
    backgroundColor: "#ffffff", // Use a bright color for the main buttons
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  scanButtonText: {
    color: "#2c3e50", // Dark color for contrast
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Regular",
  },
  textArea: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 15,
    textAlignVertical: "top",
    minHeight: 100,
    fontFamily: "SpaceGrotesk_Regular",
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  recordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  recordType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    fontFamily: "SpaceGrotesk_Bold",
  },
  recordData: {
    fontSize: 16,
    color: "#bdc3c7",
    marginBottom: 8,
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_Regular",
  },
  recordImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordHash: {
    fontSize: 14,
    color: "#95a5a6",
    fontFamily: "SpaceGrotesk_Regular",
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  emptyText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "SpaceGrotesk_Regular",
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  qrText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Regular",
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    // Note: The LinearGradient handles the background color here
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  closeModalButton: {
    padding: 8,
  },
  closeModalButtonText: {
    fontSize: 24,
    color: "#bdc3c7",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#bdc3c7",
  },
  documentTypeSection: {
    marginBottom: 30,
  },
  documentTypeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Bold",
  },
  documentTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  documentTypeButton: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedDocumentTypeButton: {
    borderColor: "#bdc3c7",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  documentTypeIcon: {
    // This style is now unused since the emojis were removed
  },
  documentTypeLabel: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "SpaceGrotesk_Regular",
  },
  selectedDocumentTypeLabel: {
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  uploadButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  // Chatbot Styles
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    padding: 15,
  },
  chatMessagesContent: {
    paddingBottom: 20,
  },
  chatWelcome: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  chatWelcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Bold",
  },
  chatWelcomeText: {
    fontSize: 16,
    color: "#bdc3c7",
    marginBottom: 15,
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_Regular",
  },
  chatWelcomeList: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 15,
    lineHeight: 24,
    fontFamily: "SpaceGrotesk_Regular",
  },
  chatDisclaimer: {
    fontSize: 14,
    color: "#95a5a6",
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Regular",
  },
  chatMessage: {
    marginBottom: 15,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#8B5CF6",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  chatMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_Regular",
    padding: 12,
  },
  userMessageText: {
    color: "#ffffff",
  },
  botMessageText: {
    color: "#ffffff",
  },
  chatMessageTime: {
    fontSize: 12,
    color: "#bdc3c7",
    paddingHorizontal: 12,
    paddingBottom: 8,
    fontFamily: "SpaceGrotesk_Regular",
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "flex-end",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#ffffff",
    maxHeight: 100,
    marginRight: 10,
    fontFamily: "SpaceGrotesk_Regular",
  },
  chatSendButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chatSendButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  chatSendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
});
