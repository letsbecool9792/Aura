import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@providers/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";

export default function Web3Login() {
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { login, user } = useAuth();
  
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  // Pre-fill name if user already has Google auth data
  useEffect(() => {
    if (user?.name && user.walletAddress === "google-auth-temp") {
      setName(user.name);
    }
  }, [user]);

  const handleConnectWallet = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    setIsConnecting(true);

    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate a mock wallet address
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);

      // Login as patient
      await login({
        role: "patient",
        name: name.trim(),
        walletAddress: mockAddress,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkipWallet = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    try {
      // Login with temporary data
      await login({
        role: "patient",
        name: name.trim(),
        walletAddress: "google-auth-temp",
      });
      router.push("/(app)/(patient)/patient-dashboard");
    } catch (error) {
      Alert.alert("Error", "Failed to complete login");
    }
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#000000ff", "#1a1a1aff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToWelcome}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            {user?.walletAddress === "google-auth-temp"
              ? "Great! Now complete your profile"
              : "Enter your details to continue"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#bdc3c7"
              value={name}
              onChangeText={setName}
            />
          </View>

          {walletAddress ? (
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Connected Wallet:</Text>
              <Text style={styles.walletAddress}>
                {walletAddress
                  ? `${walletAddress.substring(
                      0,
                      6
                    )}...${walletAddress.substring(38)}`
                  : "Not connected"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.connectButton,
                isConnecting && styles.disabledButton,
              ]}
              onPress={handleConnectWallet}
              disabled={isConnecting}
            >
              <Text style={styles.connectButtonText}>
                {isConnecting ? "Connecting..." : "🦊 Connect Wallet"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipWallet}
          >
            <Text style={styles.skipButtonText}>Continue without wallet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you aren't familiar with Metamask, visit their website for further information
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Regular",
  },
  title: {
    fontSize: 36,
    fontWeight: "normal",
    color: "#ffffff",
    marginBottom: 10,
    fontFamily: "SpaceGrotesk_Bold",
  },
  subtitle: {
    fontSize: 20,
    color: "#e5e5e5",
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Regular",
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Regular",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#ffffff",
    fontFamily: "SpaceGrotesk_Regular",
  },
  connectButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3",
  },
  connectButtonText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  walletInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#bdc3c7",
    borderWidth: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: "#e5e5e5",
    fontFamily: "SpaceGrotesk_Regular",
  },
  walletAddress: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Regular",
  },
});
