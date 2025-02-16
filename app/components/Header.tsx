import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../../src/styles/styles";

interface HeaderProps {
  title: string;
  onNotificationPress: () => void;
  hasNewNotifications: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onNotificationPress, hasNewNotifications }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onNotificationPress} style={styles.notificationBell}>
        <FontAwesome name="bell" size={24} color={colors.primary} />
        {hasNewNotifications && <View style={styles.notificationDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  notificationBell: {
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
});

export default Header;