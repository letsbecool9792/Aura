import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const startBounce = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startBounce();
  }, [bounceAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);

    try {
      // Simulate Google authentication
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock Google user data
      const googleUser = {
        name: "John Doe",
        email: "john.doe@gmail.com",
        id: "google_" + Math.random().toString(36).substring(2, 15),
      };

      // Login with Google data (temporary auth)
      await login({
        role: "patient",
        name: googleUser.name,
        walletAddress: "google-auth-temp",
      });

      // Navigate directly to Web3 page
      router.push("/(auth)/web3login");
    } catch (error) {
      Alert.alert("Error", "Google authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGetStarted = () => {
    router.push("/(auth)/role-selection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Bouncing Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>🏥</Text>
            <Text style={styles.imageLabel}>AURA Health</Text>
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to AURA</Text>
          <Text style={styles.subtitle}>
            Your secure health wallet powered by blockchain technology
          </Text>
        </View>

        {/* Google Auth Button */}
        <TouchableOpacity
          style={[
            styles.googleButton,
            isAuthenticating && styles.disabledButton,
          ]}
          onPress={handleGoogleAuth}
          disabled={isAuthenticating}
        >
          <Text style={styles.googleIcon}>🔐</Text>
          <Text style={styles.googleButtonText}>
            {isAuthenticating ? "Authenticating..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  imageContainer: {
    marginBottom: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0f3460",
    shadowColor: "#0f3460",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imageText: {
    fontSize: 48,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: "#8892b0",
    fontWeight: "600",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#8892b0",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  googleButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#16213e",
  },
  dividerText: {
    color: "#8892b0",
    fontSize: 14,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: "#0f3460",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f3460",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  arrow: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
