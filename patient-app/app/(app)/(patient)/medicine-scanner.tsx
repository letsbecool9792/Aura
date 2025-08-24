import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

// Using the hosted API on Render
const API_URL = "https://aura-krw4.onrender.com/api/identify-medicine/";

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
  status: "success" | "low_confidence" | "error";
  match_confidence?: number;
  data?: MedicineData;
  message?: string;
  closest_match?: string;
}

const MedicineScannerScreen = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load the Space Grotesk font
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#bdc3c7" />
        <Text style={{ color: "#ffffff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Test connectivity function
  const testConnectivity = async () => {
    try {
      console.log(
        "Testing connectivity to:",
        API_URL.replace("/identify-medicine/", "/health/")
      );
      const response = await fetch(
        API_URL.replace("/identify-medicine/", "/health/"),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("Health check response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Connectivity test failed:", error);
      return false;
    }
  };

  const handleImageSelection = async (type: "gallery" | "camera") => {
    try {
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      let result;
      if (type === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.granted === false) {
          Alert.alert(
            "Permission Required",
            "Permission to access camera is required!"
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({ uri: asset.uri });
        setAnalysisResult(null);
        uploadImage(asset);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while selecting the image.");
      console.error("Image selection error:", error);
    }
  };

  const createFormData = (
    imageAsset: ImagePicker.ImagePickerAsset
  ): FormData => {
    const data = new FormData();

    console.log("Original image asset:", imageAsset);

    // Get file extension from URI or default to jpg
    const uriParts = imageAsset.uri.split(".");
    const fileType = uriParts[uriParts.length - 1] || "jpg";

    // For Expo, we need to use the proper format
    const fileObject = {
      uri: imageAsset.uri,
      type: `image/${fileType}`,
      name: `medicine-image.${fileType}`,
    };

    console.log("File object for FormData:", fileObject);

    // Expo/React Native specific way to append file
    data.append("image", fileObject as any);

    console.log("FormData created successfully");

    return data;
  };

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    setIsLoading(true);

    console.log("Starting upload with image:", imageAsset.uri);
    console.log("API URL:", API_URL);

    try {
      console.log("Using FileSystem.uploadAsync for Expo compatibility...");

      // Create a promise that will timeout after 3 minutes
      const uploadPromise = FileSystem.uploadAsync(API_URL, imageAsset.uri, {
        fieldName: "image",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          Accept: "application/json",
        },
        sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                "Request took too long (3 minutes). The server might be busy processing your image."
              )
            ),
          180000
        );
      });

      // Race between upload and timeout
      const response = (await Promise.race([
        uploadPromise,
        timeoutPromise,
      ])) as any;

      console.log("Upload completed. Response received:", response.status);

      // Log the response for debugging
      console.log("Response status:", response.status);
      console.log("Response body:", response.body);

      if (response.status < 200 || response.status >= 300) {
        console.error("Error response:", response.body);
        throw new Error(
          `Server error: ${response.status} - ${response.body?.substring(
            0,
            200
          )}`
        );
      }

      const responseText = response.body;
      console.log("Response text:", responseText);

      // Try to parse as JSON
      let jsonResponse: AnalysisResult;
      try {
        jsonResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error(
          "Response that failed to parse:",
          responseText?.substring(0, 500)
        );
        throw new Error("Server returned invalid JSON. Check server logs.");
      }

      setAnalysisResult(jsonResponse);
    } catch (error) {
      console.error("=== UPLOAD ERROR DETAILS ===");
      console.error("Error type:", typeof error);
      console.error("Error name:", (error as any)?.name);
      console.error("Error message:", (error as any)?.message);
      console.error("Error stack:", (error as any)?.stack);
      console.error("Full error object:", error);
      console.error("=== END ERROR DETAILS ===");

      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "Request timeout. The server is taking too long to respond.";
        } else if (error.message.includes("Network request failed")) {
          errorMessage =
            "Network connection failed. Please check your internet connection and server availability.";
        } else if (error.message.includes("TypeError")) {
          errorMessage =
            "Connection error. Please check if the server is accessible.";
        } else if (
          error.message.includes("timeout") ||
          error.message.includes("took too long")
        ) {
          errorMessage =
            "The medicine analysis is taking longer than expected. This might happen if:\n\n• The server is processing a complex image\n• The Gemini API is slow to respond\n• The server is under heavy load\n\nPlease try again with a clearer image or try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Analysis Failed", errorMessage);
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
          Status: {analysisResult.status.replace("_", " ")}
        </Text>
        {analysisResult.match_confidence && (
          <Text style={styles.confidenceText}>
            Confidence: {analysisResult.match_confidence}%
          </Text>
        )}
        {analysisResult.status === "success" && analysisResult.data && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailItem}>
              Brand: {analysisResult.data.brand_name}
            </Text>
            <Text style={styles.detailItem}>
              Composition: {analysisResult.data.composition}
            </Text>
            <Text style={styles.detailItem}>
              Manufacturer: {analysisResult.data.manufacturer}
            </Text>
            <Text style={styles.detailItem}>
              Price (INR): ₹{analysisResult.data.price_inr}
            </Text>
            <Text style={styles.detailItem}>
              Pack Size: {analysisResult.data.pack_size}
            </Text>
          </View>
        )}
        {analysisResult.status === "low_confidence" &&
          analysisResult.closest_match && (
            <Text style={styles.detailItem}>
              Closest Match Found: {analysisResult.closest_match}
            </Text>
          )}
        {analysisResult.message && (
          <Text style={styles.errorMessage}>{analysisResult.message}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <LinearGradient
        colors={["#000000ff", "#161616ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Medicine Scanner</Text>
        <Text style={styles.subtitle}>
          Take a photo or select from gallery to identify medicine
        </Text>

        <View style={styles.imagePreview}>
          {selectedImage ? (
            <Image source={selectedImage} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>
              Select an image to begin
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={() => handleImageSelection("gallery")}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={() => handleImageSelection("camera")}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bdc3c7" />
            <Text style={styles.loadingText}>Analyzing medicine...</Text>
          </View>
        )}

        {renderResult()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 80, // Add top padding for better layout
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "SpaceGrotesk_Regular",
  },
  imagePreview: {
    width: "100%",
    height: 250,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  placeholderText: {
    color: "#bdc3c7",
    fontSize: 16,
    fontFamily: "SpaceGrotesk_Regular",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  galleryButton: {
    backgroundColor: "#ffffff",
  },
  cameraButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "#2c3e50",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#bdc3c7",
    fontFamily: "SpaceGrotesk_Regular",
  },
  resultContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
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
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Bold",
  },
  resultStatus: {
    textTransform: "capitalize",
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 16,
    color: "#bdc3c7",
    fontFamily: "SpaceGrotesk_Regular",
  },
  confidenceText: {
    fontSize: 14,
    color: "#bdc3c7",
    marginBottom: 15,
    fontFamily: "SpaceGrotesk_Regular",
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "#ffffff",
    lineHeight: 22,
    fontFamily: "SpaceGrotesk_Regular",
  },
  errorMessage: {
    fontSize: 14,
    color: "#e74c3c",
    marginTop: 10,
    fontStyle: "italic",
    fontFamily: "SpaceGrotesk_Regular",
  },
});

export default MedicineScannerScreen;