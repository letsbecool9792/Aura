import { Stack } from "expo-router";
import { useAuth } from "../../../providers/AuthProvider";
import { Redirect } from "expo-router";

export default function PatientLayout() {
  const { userRole } = useAuth();

  if (userRole !== "patient") {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="patient-dashboard" />
    </Stack>
  );
}
