import React, { createContext, useContext, useEffect, useState } from "react";
import { Redirect, router, useRootNavigationState } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    role: "patient" | "doctor" | null;
    name: string | null;
    email: string | null;
    isVerified?: boolean;
    specialization?: string; // For doctors
    licenseNumber?: string; // For doctors
  } | null;
  userRole: "patient" | "doctor" | null;
  login: (userData: {
    role: "patient" | "doctor";
    name: string;
    email: string;
  }) => void;
  logout: () => void;
  updateUser: (
    data: Partial<{
      role: "patient" | "doctor";
      name: string;
      email: string;
    }>
  ) => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A key for storing the session token in secure storage
const SESSION_KEY = "user_session";

function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    role: "patient" | "doctor" | null;
    name: string | null;
    email: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigationState = useRootNavigationState();

  // This effect checks for a stored session when the app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem("user");
        if (session) {
          // In a real app, you would validate this session token with your server or blockchain
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.error("Failed to load session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // The login function for the app
  const login = async (userData: {
    role: "patient" | "doctor";
    name: string;
    email: string;
  }) => {
    try {
      // Save user data
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      console.log("Login successful:", userData);
      router.replace("/(app)/(patient)/patient-dashboard");
    } catch (e) {
      console.error("Failed to log in:", e);
    }
  };

  // The logout function for the app
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      console.log("Logout successful");
      router.replace("/(auth)/welcome"); // Navigate back to the auth flow
    } catch (e) {
      console.error("Failed to log out:", e);
    }
  };

  const updateUser = async (
    data: Partial<{
      role: "patient" | "doctor";
      name: string;
      email: string;
    }>
  ) => {
    try {
      const updatedUser = { ...user, ...data } as {
        role: "patient" | "doctor" | null;
        name: string | null;
        email: string | null;
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  };

  // Create the context value object
  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    userRole: user?.role || null,
    login,
    logout,
    updateUser,
    isLoading,
  };

  // Wait until the root layout is mounted
  if (!navigationState?.key) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f6851b" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a202c",
  },
  loadingText: {
    marginTop: 10,
    color: "#CBD5E0",
  },
});

// Export the component as both default and named export
export const AuthProvider = AuthProviderComponent;
export default AuthProviderComponent;
