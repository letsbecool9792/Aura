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
import { AppKitButton, useAppKit } from "@reown/appkit-ethers-react-native";

export default function Web3Login() {
  const [name, setName] = useState("");
  const { login, user } = useAuth();
  const { address } = useAppKit();

  // Pre-fill name if user already has Google auth data
  useEffect(() => {
    if (user?.name && user.walletAddress === "google-auth-temp") {
      setName(user.name);
    }
  }, [user]);

  const handleWalletConnected = async (walletAddress: string) => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      await login({
        role: "patient",
        name: name.trim(),
        walletAddress,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to complete login");
    }
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
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
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

          <AppKitButton
            onConnect={handleWalletConnected}
            style={styles.continueButton}
            textStyle={styles.continueButtonText}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Welcome to Aura - Your secure healthcare platform
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#8892b0",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#8892b0",
    textAlign: "center",
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
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#16213e",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#ffffff",
  },
  continueButton: {
    backgroundColor: "#f6851b",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
  },
});
