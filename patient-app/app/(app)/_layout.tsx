import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../../providers/AuthProvider";

export default function AppLayout() {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f23",
        }}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ color: "#ffffff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Since we're in the app layout, we can use relative paths
  if (!userRole) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#0f0f23" },
      }}
    >
      <Stack.Screen
        name="(patient)"
        options={{
          animation: "none",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="(doctor)"
        options={{
          animation: "none",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
