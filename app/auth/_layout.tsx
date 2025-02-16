// app/auth/_layout.tsx
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function AuthLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="Login" options={{ title: "Login", headerShown: false}} />
        <Stack.Screen name="Register" options={{ title: "Register", headerShown: false }} />
        <Stack.Screen name="Credentials" options={{ title: "Credentials", headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}