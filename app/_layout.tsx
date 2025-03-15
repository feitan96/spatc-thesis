import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../src/auth/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="user" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="shared" options={{ headerShown: false }} />
        </Stack>
        <Toast />
    </AuthProvider>
  );
}