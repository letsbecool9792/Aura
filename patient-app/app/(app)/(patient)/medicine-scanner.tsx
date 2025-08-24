// patient-app/app/(app)/(patient)/medicine-scanner.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// IMPORTANT: Replace with your machine's local IP address.
// On Mac/Linux, run `ifconfig`. On Windows, run `ipconfig`.
// It is NOT 'localhost' or '127.0.0.1'.
const API_URL = 'http://192.168.1.10:8000/api/identify-medicine/';

interface SelectedImage {
  uri: string;
}

interface MedicineData {
  brand_name: string;
  composition: string;
  manufacturer: string;
  price_inr: string;
  pack_size: string;
}

interface AnalysisResult {
  status: 'success' | 'low_confidence' | 'error';
  match_confidence?: number;
  data?: MedicineData;
  message?: string;
  closest_match?: string;
}

const MedicineScannerScreen = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelection = async (type: 'gallery' | 'camera') => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      let result;
      if (type === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.granted === false) {
          Alert.alert('Permission Required', 'Permission to access camera is required!');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({uri: asset.uri});
        setAnalysisResult(null);
        uploadImage(asset);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while selecting the image.');
      console.error('Image selection error:', error);
    }
  };

  const createFormData = (imageAsset: ImagePicker.ImagePickerAsset): FormData => {
    const data = new FormData();
    
    // Get file extension from URI or default to jpg
    const uriParts = imageAsset.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    data.append('image', {
      uri: imageAsset.uri,
      name: `medicine-image.${fileType}`,
      type: `image/${fileType}`,
    } as any);
    
    return data;
  };

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    setIsLoading(true);
    try {
      const formData = createFormData(imageAsset);
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const jsonResponse: AnalysisResult = await response.json();

      if (response.ok) {
        setAnalysisResult(jsonResponse);
      } else {
        throw new Error(jsonResponse.message || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Analysis Failed', errorMessage);
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!analysisResult) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Analysis Result</Text>
        <Text style={styles.resultStatus}>
          Status: {analysisResult.status.replace('_', ' ')}
        </Text>
        {analysisResult.match_confidence && (
          <Text style={styles.confidenceText}>Confidence: {analysisResult.match_confidence}%</Text>
        )}
        {analysisResult.status === 'success' && analysisResult.data && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailItem}>Brand: {analysisResult.data.brand_name}</Text>
            <Text style={styles.detailItem}>Composition: {analysisResult.data.composition}</Text>
            <Text style={styles.detailItem}>Manufacturer: {analysisResult.data.manufacturer}</Text>
            <Text style={styles.detailItem}>Price (INR): ₹{analysisResult.data.price_inr}</Text>
            <Text style={styles.detailItem}>Pack Size: {analysisResult.data.pack_size}</Text>
          </View>
        )}
        {analysisResult.status === 'low_confidence' && analysisResult.closest_match && (
           <Text style={styles.detailItem}>Closest Match Found: {analysisResult.closest_match}</Text>
        )}
        {analysisResult.message && (
          <Text style={styles.errorMessage}>{analysisResult.message}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medicine Scanner</Text>
      <Text style={styles.subtitle}>Take a photo or select from gallery to identify medicine</Text>
      
      <View style={styles.imagePreview}>
        {selectedImage ? (
          <Image source={selectedImage} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Select an image to begin</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]} 
          onPress={() => handleImageSelection('gallery')} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]} 
          onPress={() => handleImageSelection('camera')} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing medicine...</Text>
        </View>
      )}
      
      {renderResult()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
  },
  cameraButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  resultStatus: {
    textTransform: 'capitalize',
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    lineHeight: 22,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default MedicineScannerScreen;
