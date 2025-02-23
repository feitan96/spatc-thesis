import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../../src/styles/styles";

const BottomBar = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.icon}
        onPress={() => router.push("/admin/UserManagement")}
      >
        <FontAwesome name="users" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.icon}
        onPress={() => router.push("/shared/BinList")}
      >
        <FontAwesome name="trash" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.icon}
        onPress={() => router.push("/admin/Analytics")}
      >
        <FontAwesome name="bar-chart" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.icon}
        onPress={() => router.push("/shared/Settings")}
      >
        <FontAwesome name="cog" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  icon: {
    padding: 8,
  },
});

export default BottomBar;