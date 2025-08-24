import { Stack } from "expo-router";
import { useAuth } from "../../../providers/AuthProvider";
import { Redirect } from "expo-router";

export default function DoctorLayout() {
  const { userRole } = useAuth();

  if (userRole !== "doctor") {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="doctor-dashboard" />
    </Stack>
  );
}
