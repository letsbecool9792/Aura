import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  Image,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const { width, height } = Dimensions.get("window");

// Prevent the splash screen from auto-hiding while we load the fonts
SplashScreen.preventAutoHideAsync();

export default function Welcome() {
  const circleAnim = useRef(new Animated.Value(0)).current;
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Load the desired fonts
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_Regular: SpaceGrotesk_400Regular,
    SpaceGrotesk_Bold: SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    // Hide the splash screen once fonts are loaded
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }

    // Start circle animation
    Animated.timing(circleAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fontsLoaded, circleAnim]);

  // If fonts are not loaded yet, return null to prevent rendering
  if (!fontsLoaded) {
    return null;
  }

 const { login } = useAuth(); // Your custom login function

const handleSignInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    console.log("Google User Info:", userInfo.user);

    // Pass the real user data to your app's login logic
    await login({
      role: "patient",
      name: userInfo.user.name,
      email: userInfo.user.email,
    });

    router.replace("/(app)/(patient)/patient-dashboard/");

  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled the login flow');
    } else {
      console.error("Google Sign-In Error", error);
      Alert.alert("Sign-In Error", "An error occurred during sign-in.");
    }
  }
};

  const scale = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={["#000000ff", "#181c2cff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/main.png")}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleWithLogo}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>AURA</Text>
          </View>
          <Text style={styles.tagline}>
            Future of personal healthcare
          </Text>
        </View>

        <GoogleSigninButton
  style={{ width: 230, height: 48 }} // You can style it
  size={GoogleSigninButton.Size.Wide}
  color={GoogleSigninButton.Color.Light} // Or Color.Dark
  onPress={handleSignInWithGoogle}
  disabled={isAuthenticating}
/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainImage: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 20,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  titleWithLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "SpaceGrotesk_Bold",
  },
  tagline: {
    fontSize: 25,
    color: "#929292ff",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
    fontFamily: "EBGaramond",
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    flexDirection: "row",
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
  circle: {
    position: "absolute",
    width: height * 1.5,
    height: height * 1.5,
    borderRadius: height * 0.75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: -height * 0.75,
    left: -height * 0.25,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  buttonText: {
    color: "#2c3e50", // Changed to a dark color for better contrast
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "SpaceGrotesk_Bold",
  },
});
