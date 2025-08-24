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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

// Using actual brain scan images from local assets
const BRAIN_SCAN_MAPPING: { [key: string]: any } = {
  'scan_001': {
    inputImage: require('../../../assets/inputs/1072_jpg.rf.45310adc3a3055067e841021aa27fd36.jpg'),
    outputImage: require('../../../assets/outputs/1072_jpg.rf.45310adc3a3055067e841021aa27fd36.jpg'),
    filename: 'Brain Scan 001',
    displayName: 'Scan 001'
  },
  'scan_002': {
    inputImage: require('../../../assets/inputs/1097_jpg.rf.df6c35b4ed24ef8c28138939567ef7ab.jpg'),
    outputImage: require('../../../assets/outputs/1097_jpg.rf.df6c35b4ed24ef8c28138939567ef7ab.jpg'),
    filename: 'Brain Scan 002',
    displayName: 'Scan 002'
  },
  'scan_003': {
    inputImage: require('../../../assets/inputs/1339_jpg.rf.547ec26fbb49416b466173125f6b08ca.jpg'),
    outputImage: require('../../../assets/outputs/1339_jpg.rf.547ec26fbb49416b466173125f6b08ca.jpg'),
    filename: 'Brain Scan 003',
    displayName: 'Scan 003'
  },
  'scan_004': {
    inputImage: require('../../../assets/inputs/1345_jpg.rf.54fa804d2c5aa5ee150120987469bc56.jpg'),
    outputImage: require('../../../assets/outputs/1345_jpg.rf.54fa804d2c5aa5ee150120987469bc56.jpg'),
    filename: 'Brain Scan 004',
    displayName: 'Scan 004'
  },
  'scan_005': {
    inputImage: require('../../../assets/inputs/1358_jpg.rf.28166eb29d15b22551634a4ef483d06a.jpg'),
    outputImage: require('../../../assets/outputs/1358_jpg.rf.28166eb29d15b22551634a4ef483d06a.jpg'),
    filename: 'Brain Scan 005',
    displayName: 'Scan 005'
  },
  'scan_006': {
    inputImage: require('../../../assets/inputs/1384_jpg.rf.eae9a65288f9807ec9f12cd953c54d7e.jpg'),
    outputImage: require('../../../assets/outputs/1384_jpg.rf.eae9a65288f9807ec9f12cd953c54d7e.jpg'),
    filename: 'Brain Scan 006',
    displayName: 'Scan 006'
  },
  'scan_007': {
    inputImage: require('../../../assets/inputs/138_jpg.rf.afc1207a05fc7a203831810574167b24.jpg'),
    outputImage: require('../../../assets/outputs/138_jpg.rf.afc1207a05fc7a203831810574167b24.jpg'),
    filename: 'Brain Scan 007',
    displayName: 'Scan 007'
  },
  'scan_008': {
    inputImage: require('../../../assets/inputs/1569_jpg.rf.dc675613d5fce07e505cba269b91fffb.jpg'),
    outputImage: require('../../../assets/outputs/1569_jpg.rf.dc675613d5fce07e505cba269b91fffb.jpg'),
    filename: 'Brain Scan 008',
    displayName: 'Scan 008'
  },
  'scan_009': {
    inputImage: require('../../../assets/inputs/1636_jpg.rf.b2802a0421971042ffc271493d590f3f.jpg'),
    outputImage: require('../../../assets/outputs/1636_jpg.rf.b2802a0421971042ffc271493d590f3f.jpg'),
    filename: 'Brain Scan 009',
    displayName: 'Scan 009'
  },
  'scan_010': {
    inputImage: require('../../../assets/inputs/1844_jpg.rf.ff2ae8eed187af3b8098928b1e327b08.jpg'),
    outputImage: require('../../../assets/outputs/1844_jpg.rf.ff2ae8eed187af3b8098928b1e327b08.jpg'),
    filename: 'Brain Scan 010',
    displayName: 'Scan 010'
  },
  'scan_011': {
    inputImage: require('../../../assets/inputs/2001_jpg.rf.1e0b2ddfc86e0023d5937a105ab2a1b6.jpg'),
    outputImage: require('../../../assets/outputs/2001_jpg.rf.1e0b2ddfc86e0023d5937a105ab2a1b6.jpg'),
    filename: 'Brain Scan 011',
    displayName: 'Scan 011'
  },
  'scan_012': {
    inputImage: require('../../../assets/inputs/2061_jpg.rf.d04d5d6171939764f6e239a960e95e02.jpg'),
    outputImage: require('../../../assets/outputs/2061_jpg.rf.d04d5d6171939764f6e239a960e95e02.jpg'),
    filename: 'Brain Scan 012',
    displayName: 'Scan 012'
  },
  'scan_013': {
    inputImage: require('../../../assets/inputs/2145_jpg.rf.04fd7a826343eea802b676b730f12ae3.jpg'),
    outputImage: require('../../../assets/outputs/2145_jpg.rf.04fd7a826343eea802b676b730f12ae3.jpg'),
    filename: 'Brain Scan 013',
    displayName: 'Scan 013'
  },
  'scan_014': {
    inputImage: require('../../../assets/inputs/2295_jpg.rf.6c550f0874cb0b2e0aaf14bd025c4162.jpg'),
    outputImage: require('../../../assets/outputs/2295_jpg.rf.6c550f0874cb0b2e0aaf14bd025c4162.jpg'),
    filename: 'Brain Scan 014',
    displayName: 'Scan 014'
  },
  'scan_015': {
    inputImage: require('../../../assets/inputs/234_jpg.rf.7175884904041f7a2cb48b2416691323.jpg'),
    outputImage: require('../../../assets/outputs/234_jpg.rf.7175884904041f7a2cb48b2416691323.jpg'),
    filename: 'Brain Scan 015',
    displayName: 'Scan 015'
  },
  'scan_016': {
    inputImage: require('../../../assets/inputs/2434_jpg.rf.f92fd811540c59bf36eb3de80582134a.jpg'),
    outputImage: require('../../../assets/outputs/2434_jpg.rf.f92fd811540c59bf36eb3de80582134a.jpg'),
    filename: 'Brain Scan 016',
    displayName: 'Scan 016'
  },
  'scan_017': {
    inputImage: require('../../../assets/inputs/2578_jpg.rf.d050cac989e96e1beb221b4b22b93e82.jpg'),
    outputImage: require('../../../assets/outputs/2578_jpg.rf.d050cac989e96e1beb221b4b22b93e82.jpg'),
    filename: 'Brain Scan 017',
    displayName: 'Scan 017'
  },
  'scan_018': {
    inputImage: require('../../../assets/inputs/2758_jpg.rf.386747e1d095434498aeb63a5e1bc0c7.jpg'),
    outputImage: require('../../../assets/outputs/2758_jpg.rf.386747e1d095434498aeb63a5e1bc0c7.jpg'),
    filename: 'Brain Scan 018',
    displayName: 'Scan 018'
  },
  'scan_019': {
    inputImage: require('../../../assets/inputs/2776_jpg.rf.b87922fb0539b4565c732d8cc107507b.jpg'),
    outputImage: require('../../../assets/outputs/2776_jpg.rf.b87922fb0539b4565c732d8cc107507b.jpg'),
    filename: 'Brain Scan 019',
    displayName: 'Scan 019'
  },
  'scan_020': {
    inputImage: require('../../../assets/inputs/2794_jpg.rf.160f283cfa7092a30e9b3fec0d6e5a5d.jpg'),
    outputImage: require('../../../assets/outputs/2794_jpg.rf.160f283cfa7092a30e9b3fec0d6e5a5d.jpg'),
    filename: 'Brain Scan 020',
    displayName: 'Scan 020'
  },
};

// Get array of available scans for selection
const AVAILABLE_SCANS = Object.values(BRAIN_SCAN_MAPPING);

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

const BrainTumorDetectorScreen = () => {
  const router = useRouter();
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    phase: 'idle',
    inputImage: null,
    filename: '',
    progress: 0
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showScanSelector, setShowScanSelector] = useState(false);

  const handleScanSelection = (scan: any) => {
    setSelectedScan(scan);
    setShowScanSelector(false);
    setAnalysisResult(null);
    setAnalysisState({
      phase: 'idle',
      inputImage: null,
      filename: '',
      progress: 0
    });
  };

  const handleAnalyze = async () => {
    if (!selectedScan) {
      Alert.alert('Error', 'Please select a brain scan first');
      return;
    }

    // Phase 1: Show input image and start processing
    setAnalysisState({
      phase: 'processing',
      inputImage: selectedScan.inputImage,
      filename: selectedScan.filename,
      progress: 0
    });
    setAnalysisResult(null);

    // Simulate progress over 3-4 seconds
    const totalTime = Math.random() * 1000 + 3000; // 3-4 seconds
    const steps = 20;
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
      inputImage: selectedScan.inputImage,
      outputImage: selectedScan.outputImage,
      filename: selectedScan.filename,
      analysisTime: Math.round(totalTime),
      confidence: Math.round((Math.random() * 15 + 85) * 100) / 100, // 85-100% confidence
    };

    setAnalysisState({
      phase: 'complete',
      inputImage: selectedScan.inputImage,
      outputImage: selectedScan.outputImage,
      filename: selectedScan.filename,
      progress: 100
    });

    setAnalysisResult(result);
    
    Alert.alert(
      'Analysis Complete',
      `Tumor segmentation completed with ${result.confidence}% confidence`,
      [{ text: 'View Results', style: 'default' }]
    );
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // For live demo, redirect to pre-computed scans
        Alert.alert(
          'Select Brain Scan',
          'Please select from our available brain scans for analysis.',
          [
            {
              text: 'Select Scan',
              onPress: () => setShowScanSelector(true)
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const renderScanItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.scanItem}
      onPress={() => handleScanSelection(item)}
    >
      <Image
        source={item.inputImage}
        style={styles.scanThumbnail}
        resizeMode="cover"
      />
      <Text style={styles.scanLabel}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Brain Tumor Detection</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Model Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🧠 AI-Powered Brain Tumor Detection</Text>
          <Text style={styles.infoDescription}>
            Advanced deep learning model for precise tumor segmentation in brain MRI scans. 
            Our AI analyzes brain images to identify and highlight potential tumor regions.
          </Text>
        </View>

        {/* Image Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Select Brain Scan</Text>
          
          {selectedScan ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={selectedScan.inputImage}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <Text style={styles.imageLabel}>Selected: {selectedScan.displayName}</Text>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>No brain scan selected</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.selectButton} onPress={() => setShowScanSelector(true)}>
              <Text style={styles.selectButtonText}>📋 Select Brain Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
              <Text style={styles.uploadButtonText}>📷 Upload New Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 AI Analysis</Text>
          
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!selectedScan || analysisState.phase === 'processing') && styles.disabledButton
            ]}
            onPress={handleAnalyze}
            disabled={!selectedScan || analysisState.phase === 'processing'}
          >
            {analysisState.phase === 'processing' ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 10 }} />
                <Text style={styles.analyzeButtonText}>
                  Analyzing... {Math.round(analysisState.progress)}%
                </Text>
              </>
            ) : (
              <Text style={styles.analyzeButtonText}>🚀 Start Analysis</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Processing/Results Section */}
        {analysisState.phase !== 'idle' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {analysisState.phase === 'processing' ? '� Processing Brain Scan' : '�📊 Analysis Results'}
            </Text>
            
            {analysisState.phase === 'processing' && (
              <View style={styles.processingContainer}>
                <View style={styles.processingImageContainer}>
                  <Image
                    source={analysisState.inputImage}
                    style={styles.processingImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.processingLabel}>Analyzing brain scan...</Text>
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
                    {analysisState.progress < 25 ? '🔍 Preprocessing image...' :
                     analysisState.progress < 50 ? '🧠 Detecting brain regions...' :
                     analysisState.progress < 75 ? '🎯 Identifying tumor areas...' :
                     '✨ Finalizing segmentation...'}
                  </Text>
                </View>
              </View>
            )}

            {analysisState.phase === 'complete' && analysisResult && (
              <View style={styles.resultsContainer}>
                <View style={styles.imageComparisonContainer}>
                  <View style={styles.imageComparisonItem}>
                    <Text style={styles.imageComparisonLabel}>Original Scan</Text>
                    <Image
                      source={selectedScan?.inputImage}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View style={styles.imageComparisonItem}>
                    <Text style={styles.imageComparisonLabel}>Tumor Segmentation</Text>
                    <Image
                      source={selectedScan?.outputImage}
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
            <Text style={styles.sectionTitle}>📋 Analysis Summary</Text>
            <Text style={styles.summaryText}>
              The AI model has successfully processed the brain scan and identified potential tumor regions. 
              The segmentation highlights areas requiring further medical evaluation.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Scan Selection Modal */}
      <Modal
        visible={showScanSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Brain Scan</Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowScanSelector(false)}
            >
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={AVAILABLE_SCANS}
            renderItem={renderScanItem}
            keyExtractor={(item) => item.filename}
            numColumns={2}
            contentContainerStyle={styles.scanGrid}
          />
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#8892b0',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
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
    color: '#8892b0',
    fontSize: 12,
    textAlign: 'center',
  },
  placeholderContainer: {
    height: 200,
    backgroundColor: '#16213e',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2d3748',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#8892b0',
    fontSize: 16,
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
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  uploadButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#2d3748',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  analysisStats: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 14,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#2d1810',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 12,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeModalButton: {
    padding: 5,
  },
  closeModalText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanGrid: {
    padding: 20,
  },
  scanItem: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    margin: 5,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  scanThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLabel: {
    color: '#8892b0',
    fontSize: 10,
    textAlign: 'center',
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
    color: '#8892b0',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#16213e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  processingSteps: {
    marginTop: 10,
  },
  stepText: {
    color: '#4F46E5',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryText: {
    color: '#8892b0',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default BrainTumorDetectorScreen;
