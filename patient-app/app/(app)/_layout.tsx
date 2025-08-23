import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../providers/AuthProvider';


export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(patient)" />
      <Stack.Screen name="(doctor)" />
    </Stack>
  );
}
