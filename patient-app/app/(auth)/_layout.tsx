import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";

export default function AuthLayout() {
  const { isAuthenticated, userRole, user } = useAuth();

  if (isAuthenticated && userRole === "patient") {
    return <Redirect href="/(app)/(patient)/patient-dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0f0f23" },
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: "none" }} />
    </Stack>
  );
}
