import type React from "react"
import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import { colors } from "../../../src/styles/styles"

interface TabBarButtonProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
  isActive: boolean
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ icon, label, onPress, isActive }) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>{icon}</View>
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
      {isActive && <View style={styles.indicator} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    position: "relative",
  },
  activeTabButton: {
    // Active tab styling
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: `${colors.primary}10`, // 10% opacity
  },
  label: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
})

export default TabBarButton

