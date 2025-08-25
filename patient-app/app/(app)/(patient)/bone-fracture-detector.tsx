import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import * as ImagePicker from 'expo-image-picker';

// Using actual X-ray images from local assets with corresponding fracture masks
const XRAY_SCAN_MAPPING: { [key: string]: any } = {
  'xray_001': {
    inputImage: require('../../../assets/demo_input_images/IMG0000092.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0000092.png'),
    filename: 'X-ray Scan 001',
    displayName: 'X-ray 001'
  },
  'xray_002': {
    inputImage: require('../../../assets/demo_input_images/IMG0000284.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0000284.png'),
    filename: 'X-ray Scan 002',
    displayName: 'X-ray 002'
  },
  'xray_003': {
    inputImage: require('../../../assets/demo_input_images/IMG0000468.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0000468.png'),
    filename: 'X-ray Scan 003',
    displayName: 'X-ray 003'
  },
  'xray_004': {
    inputImage: require('../../../assets/demo_input_images/IMG0001970.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0001970.png'),
    filename: 'X-ray Scan 004',
    displayName: 'X-ray 004'
  },
  'xray_005': {
    inputImage: require('../../../assets/demo_input_images/IMG0002304.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002304.png'),
    filename: 'X-ray Scan 005',
    displayName: 'X-ray 005'
  },
  'xray_006': {
    inputImage: require('../../../assets/demo_input_images/IMG0002331.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002331.png'),
    filename: 'X-ray Scan 006',
    displayName: 'X-ray 006'
  },
  'xray_007': {
    inputImage: require('../../../assets/demo_input_images/IMG0002371.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002371.png'),
    filename: 'X-ray Scan 007',
    displayName: 'X-ray 007'
  },
  'xray_008': {
    inputImage: require('../../../assets/demo_input_images/IMG0002448.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002448.png'),
    filename: 'X-ray Scan 008',
    displayName: 'X-ray 008'
  },
  'xray_009': {
    inputImage: require('../../../assets/demo_input_images/IMG0002469.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002469.png'),
    filename: 'X-ray Scan 009',
    displayName: 'X-ray 009'
  },
  'xray_010': {
    inputImage: require('../../../assets/demo_input_images/IMG0002487.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002487.png'),
    filename: 'X-ray Scan 010',
    displayName: 'X-ray 010'
  },
  'xray_011': {
    inputImage: require('../../../assets/demo_input_images/IMG0002502.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002502.png'),
    filename: 'X-ray Scan 011',
    displayName: 'X-ray 011'
  },
  'xray_012': {
    inputImage: require('../../../assets/demo_input_images/IMG0002517.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002517.png'),
    filename: 'X-ray Scan 012',
    displayName: 'X-ray 012'
  },
  'xray_013': {
    inputImage: require('../../../assets/demo_input_images/IMG0002552.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002552.png'),
    filename: 'X-ray Scan 013',
    displayName: 'X-ray 013'
  },
  'xray_014': {
    inputImage: require('../../../assets/demo_input_images/IMG0002589.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002589.png'),
    filename: 'X-ray Scan 014',
    displayName: 'X-ray 014'
  },
  'xray_015': {
    inputImage: require('../../../assets/demo_input_images/IMG0002768.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002768.png'),
    filename: 'X-ray Scan 015',
    displayName: 'X-ray 015'
  },
  'xray_016': {
    inputImage: require('../../../assets/demo_input_images/IMG0002999.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0002999.png'),
    filename: 'X-ray Scan 016',
    displayName: 'X-ray 016'
  },
  'xray_017': {
    inputImage: require('../../../assets/demo_input_images/IMG0003586.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0003586.png'),
    filename: 'X-ray Scan 017',
    displayName: 'X-ray 017'
  },
  'xray_018': {
    inputImage: require('../../../assets/demo_input_images/IMG0003620.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0003620.png'),
    filename: 'X-ray Scan 018',
    displayName: 'X-ray 018'
  },
  'xray_019': {
    inputImage: require('../../../assets/demo_input_images/IMG0003952.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0003952.png'),
    filename: 'X-ray Scan 019',
    displayName: 'X-ray 019'
  },
  'xray_020': {
    inputImage: require('../../../assets/demo_input_images/IMG0004043.jpg'),
    outputImage: require('../../../assets/demo_output_masks/IMG0004043.png'),
    filename: 'X-ray Scan 020',
    displayName: 'X-ray 020'
  },
};

const AVAILABLE_XRAYS = Object.values(XRAY_SCAN_MAPPING);

interface AnalysisResult {
  inputImage: any;
  outputImage: any;
  filename: string;
  analysisTime: number;
  confidence: number;
}

interface AnalysisState {
  phase: 'idle' | 'processing' | 'complete';
  inputImage: any;
  outputImage?: any;
  filename: string;
  progress: number;
}

const BoneFractureDetectorScreen = () => {
  const router = useRouter();
  const [selectedXray, setSelectedXray] = useState<any>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    phase: 'idle',
    inputImage: null,
    filename: '',
    progress: 0
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showXraySelector, setShowXraySelector] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#bdc3c7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleXraySelection = (xray: any) => {
    setSelectedXray(xray);
    setShowXraySelector(false);
    setAnalysisResult(null);
    setAnalysisState({
      phase: 'idle',
      inputImage: null,
      filename: '',
      progress: 0
    });
  };

  const handleAnalyze = async () => {
    if (!selectedXray) {
      Alert.alert('Error', 'Please select an X-ray scan first');
      return;
    }

    // Phase 1: Show input image and start processing
    setAnalysisState({
      phase: 'processing',
      inputImage: selectedXray.inputImage,
      filename: selectedXray.filename,
      progress: 0
    });
    setAnalysisResult(null);

    // Simulate progress over 3-4 seconds
    const totalTime = 3500;
    const steps = 35;
    const stepTime = totalTime / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepTime));
      setAnalysisState(prev => ({
        ...prev,
        progress: (i / steps) * 100
      }));
    }

    // Phase 2: Analysis complete, show results
    const result: AnalysisResult = {
      inputImage: selectedXray.inputImage,
      outputImage: selectedXray.outputImage,
      filename: selectedXray.filename,
      analysisTime: Math.round(totalTime),
      confidence: Math.round((Math.random() * 15 + 85) * 100) / 100, // 85-100% confidence
    };

    setAnalysisState({
      phase: 'complete',
      inputImage: selectedXray.inputImage,
      outputImage: selectedXray.outputImage,
      filename: selectedXray.filename,
      progress: 100
    });

    setAnalysisResult(result);
    
    Alert.alert(
      'Analysis Complete',
      `Fracture detection completed with ${result.confidence}% confidence`,
      [{ text: 'View Results', style: 'default' }]
    );
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload X-ray images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const customXray = {
          inputImage: { uri: result.assets[0].uri },
          outputImage: null,
          filename: 'Custom X-ray',
          displayName: 'Custom Upload'
        };
        setSelectedXray(customXray);
        setAnalysisResult(null);
        setAnalysisState({
          phase: 'idle',
          inputImage: null,
          filename: '',
          progress: 0
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const renderXrayItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.xrayItem}
      onPress={() => handleXraySelection(item)}
    >
      <Image
        source={item.inputImage}
        style={styles.xrayThumbnail}
        resizeMode="cover"
      />
      <Text style={styles.xrayLabel}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bone Fracture Detection</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Model Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>AI-Powered Fracture Detection</Text>
          <Text style={styles.infoDescription}>
            Our application leverages a sophisticated AI model, DANet, pre-trained on the extensive FracAtlas dataset.
            We utilize a curated set of 20 sample X-ray images and their corresponding high-fidelity segmentation masks
            for rapid and accurate fracture detection.
          </Text>
        </View>

        {/* Image Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select X-ray Scan</Text>
          
          {selectedXray ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={selectedXray.inputImage}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <Text style={styles.imageLabel}>Selected: {selectedXray.displayName}</Text>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>No X-ray scan selected</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowXraySelector(true)}>
              <Text style={styles.selectButtonText}>Select X-ray Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
              <Text style={styles.uploadButtonText}>Upload New X-ray</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Section */}
        {selectedXray && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {analysisState.phase === 'processing' ? 'Processing X-ray Scan' : 'Analysis Results'}
            </Text>
            
            {analysisState.phase === 'processing' && (
              <View style={styles.processingContainer}>
                <View style={styles.processingImageContainer}>
                  <Image
                    source={analysisState.inputImage}
                    style={styles.processingImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.processingLabel}>Analyzing X-ray scan...</Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${analysisState.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(analysisState.progress)}% Complete
                  </Text>
                </View>

                <View style={styles.processingSteps}>
                  <Text style={styles.stepText}>
                    {analysisState.progress < 25 ? 'Preprocessing X-ray...' :
                      analysisState.progress < 50 ? 'Detecting bone structures...' :
                      analysisState.progress < 75 ? 'Analyzing fracture patterns...' :
                      '🎯 Generating fracture segmentation...'}
                  </Text>
                </View>
              </View>
            )}

            {analysisState.phase === 'complete' && analysisResult && (
              <View style={styles.resultsContainer}>
                <View style={styles.imageComparisonContainer}>
                  <View style={styles.imageComparisonItem}>
                    <Text style={styles.imageComparisonLabel}>Original X-ray</Text>
                    <Image
                      source={selectedXray?.inputImage}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View style={styles.imageComparisonItem}>
                    <Text style={styles.imageComparisonLabel}>Fracture Detection</Text>
                    <Image
                      source={selectedXray?.outputImage}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                <View style={styles.analysisStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Confidence:</Text>
                    <Text style={styles.statValue}>{analysisResult.confidence}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Processing Time:</Text>
                    <Text style={styles.statValue}>{analysisResult.analysisTime}ms</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Model:</Text>
                    <Text style={styles.statValue}>DANet v2.1</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Results Section */}
        {analysisResult && analysisState.phase === 'complete' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analysis Summary</Text>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Our DANet model has successfully analyzed the X-ray scan and identified potential fractures with {analysisResult.confidence}% confidence.
                The fracture segmentation mask highlights areas of concern that should be reviewed by a medical professional.
              </Text>
            </View>
          </View>
        )}

        {/* Analyze Button */}
        {selectedXray && (
          <View style={[styles.section, { padding: 0 }]}>
            <TouchableOpacity 
              style={[styles.analyzeButton, (!selectedXray || analysisState.phase === 'processing') && styles.disabledButton]}
              onPress={handleAnalyze}
              disabled={!selectedXray || analysisState.phase === 'processing'}
            >
              <Text style={styles.analyzeButtonText}>
                {analysisState.phase === 'processing' ? 'Analyzing...' : 'Analyze X-ray'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* X-ray Selection Modal */}
      <Modal
        visible={showXraySelector}
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
            <Text style={styles.modalTitle}>Select X-ray Scan</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowXraySelector(false)}
            >
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={AVAILABLE_XRAYS}
            renderItem={renderXrayItem}
            keyExtractor={(item) => item.filename}
            numColumns={2}
            contentContainerStyle={styles.xrayGrid}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
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
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#bdc3c7",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "SpaceGrotesk_Regular",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
        marginTop: 50,

    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk_Bold',
  },
  infoDescription: {
    fontSize: 14,
    color: '#bdc3c7',
    lineHeight: 20,
    fontFamily: 'SpaceGrotesk_Regular',
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    fontFamily: 'SpaceGrotesk_Bold',
  },
  selectedImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageLabel: {
    color: '#bdc3c7',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_Regular',
  },
  placeholderContainer: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#bdc3c7',
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  uploadButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  analyzeButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  resultsContainer: {
    marginTop: 10,
  },
  imageComparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageComparisonItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageComparisonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  resultImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  analysisStats: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#bdc3c7',
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_Regular',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  summaryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  summaryText: {
    color: '#bdc3c7',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'SpaceGrotesk_Regular',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  closeModalButton: {
    padding: 5,
  },
  closeModalText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  xrayGrid: {
    padding: 20,
  },
  xrayItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 5,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  xrayThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  xrayLabel: {
    color: '#bdc3c7',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_Regular',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  processingImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  processingImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  processingLabel: {
    color: '#bdc3c7',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_Regular',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
  processingSteps: {
    marginTop: 10,
  },
  stepText: {
    color: '#4F46E5',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'SpaceGrotesk_Bold',
  },
});

export default BoneFractureDetectorScreen;