// /app/user/Analytics.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomBar from "../components/BottomBar";
import { colors } from "../../src/styles/styles";

const AnalyticsScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.text}>Analytics data will be displayed here.</Text>
      </View>
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default AnalyticsScreen;