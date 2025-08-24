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
  const { isAuthenticated, userRole, user } = useAuth();

  if (isAuthenticated && userRole === "patient") {
    return <Redirect href="/(app)/(patient)/patient-dashboard" />;
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
        <Stack.Screen name="web3login" />
      </Stack>
      <AppKit />
    </>
  );
}
