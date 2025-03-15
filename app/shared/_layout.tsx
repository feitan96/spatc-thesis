import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function UserLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="BinList" options={{ title: "Bin List", headerShown: true}} />
        <Stack.Screen name="BinDetails" options={{ title: "Bin Details", headerShown: false}} />
        <Stack.Screen name="Settings" options={{ title: "Settings", headerShown: true}} />
      </Stack>
      <Toast />
    </>
  );
}