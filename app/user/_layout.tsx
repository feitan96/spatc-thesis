import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function UserLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="BinData" options={{ title: "Bin Data", headerShown: true}} />
        <Stack.Screen name="BinList" options={{ title: "Trash Collectors", headerShown: true}} />
        <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: true}} />
        <Stack.Screen name="Settings" options={{ title: "Settings", headerShown: true}} />
      </Stack>
      <Toast />
    </>
  );
}