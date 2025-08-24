import { Redirect } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(true);

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(patient)/patient-dashboard" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
