import { AppKit, createAppKit } from "@reown/appkit-ethers-react-native";
import "@walletconnect/react-native-compat";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { chains, config, metadata, projectId } from "../config/appkit";

// Initialize AppKit
createAppKit({
  projectId,
  metadata,
  chains,
  config,
  enableAnalytics: true,
});

export default function AuthLayout() {
  const { isAuthenticated, userRole } = useAuth();

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    // Redirect to specific dashboard based on role
    if (userRole === "patient") {
      return <Redirect href="/(app)/(patient)/patient-dashboard" />;
    } else if (userRole === "doctor") {
      return <Redirect href="/(app)/(doctor)/doctor-dashboard" />;
    }
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#0f0f23" },
        }}
      >
        <Stack.Screen name="welcome" options={{ animation: "none" }} />
        <Stack.Screen name="role-selection" />
        <Stack.Screen name="web3login" />
        <Stack.Screen name="doctor-verification" />
      </Stack>
      <AppKit />
    </>
  );
}
