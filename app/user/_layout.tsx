import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen name="UserHome" options={{ title: "Home", headerShown: true}} />
    </Stack>
  );
}