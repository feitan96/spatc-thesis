"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { FontAwesome, Ionicons } from "@expo/vector-icons"
import { colors } from "../../src/styles/styles"
import { useRouter } from "expo-router"

interface HeaderProps {
  title: string
  onNotificationPress: () => void
  hasNewNotifications: boolean
}

const Header: React.FC<HeaderProps> = ({ title, onNotificationPress, hasNewNotifications }) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton}>
          <FontAwesome name="bell" size={22} color={colors.primary} />
          {hasNewNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
})

export default Header

