import { useAuth } from "@providers/AuthProvider";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f0f23" },
      }}
    >
      <Stack.Screen name="(patient)/patient-dashboard" />
      <Stack.Screen name="(patient)/medicine-scanner" />
    </Stack>
  );
}
