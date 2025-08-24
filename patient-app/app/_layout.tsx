import { AuthProvider } from "../providers/AuthProvider";
import {
  useFonts,
  EBGaramond_400Regular,
  EBGaramond_600SemiBold,
} from "@expo-google-fonts/eb-garamond";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    EBGaramond: EBGaramond_400Regular,
    "EBGaramond-SemiBold": EBGaramond_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
