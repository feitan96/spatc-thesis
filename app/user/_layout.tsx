import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function UserLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: true}} />
      </Stack>
      <Toast />
    </>
  );
}