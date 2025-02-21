import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="AdminHome" options={{ title: "Home", headerShown: true}} />
      <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: true}} />
      <Stack.Screen name="BinManagement" options={{ title: "Bin Management", headerShown: true}} />
      <Stack.Screen name="UserManagement" options={{ title: "User Management", headerShown: true}} />
      <Stack.Screen name="Settings" options={{ title: "Settings", headerShown: true}} />
    </Stack>
  );
}