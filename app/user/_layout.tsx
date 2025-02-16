import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen name="UserHome" options={{ title: "Home", headerShown: true}} />
      <Stack.Screen name="BinList" options={{ title: "Trash Collectors", headerShown: true}} />
      <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: true}} />
      <Stack.Screen name="Settings" options={{ title: "Settings", headerShown: true}} />
    </Stack>
  );
}