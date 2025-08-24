import { Stack } from "expo-router";
import { AuthProvider } from "../providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#0f0f23" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: "fade",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="(app)"
          options={{
            animation: "fade",
            animationDuration: 200,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
