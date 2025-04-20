import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="AdminHome" options={{ title: "Home", headerShown: false}} />
      <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: false}} />
      <Stack.Screen name="UserManagement" options={{ title: "User Management", headerShown: false }} />
      <Stack.Screen name="Dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}