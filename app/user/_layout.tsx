import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

export default function UserLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="Analytics" options={{ title: "Analytics", headerShown: false}} />
      </Stack>
      <Toast />
    </>
  );
}