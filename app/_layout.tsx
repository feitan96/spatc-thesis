import React from "react";
import { Stack, usePathname } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../src/auth/AuthContext";
import { useAuth } from "../src/auth/AuthContext";
import AdminBottomBar from "./components/AdminBottomBar";
import UserBottomBar from "./components/UserBottomBar";

function RootLayoutNav() {
  const { userRole } = useAuth();
  const pathname = usePathname();
  
  // Hide bottom bar on BinDetails page
  const shouldShowBottomBar = !pathname.includes("/shared/BinDetails");

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none", // Disable navigation animation
        }}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="user" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="shared" />
      </Stack>
      {shouldShowBottomBar && (userRole === "admin" ? <AdminBottomBar /> : userRole === "user" ? <UserBottomBar /> : null)}
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}