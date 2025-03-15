"use client"

import React, { useEffect, useState } from "react"
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { router, usePathname } from "expo-router"
import { colors } from "../../../src/styles/styles"
import TabBarButton from "./TabBarButton"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export interface TabItem {
  icon: React.ReactNode
  label: string
  path: string
}

interface FloatingBottomBarProps {
  tabs: TabItem[]
  centerButton?: {
    icon: React.ReactNode
    onPress: () => void
  }
}

const FloatingBottomBar: React.FC<FloatingBottomBarProps> = ({ tabs, centerButton }) => {
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState("")
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Find the matching tab for the current path
    const matchingTab = tabs.find((tab) => pathname.startsWith(tab.path))
    if (matchingTab) {
      setActiveTab(matchingTab.path)
    }
  }, [pathname, tabs])

  const handleTabPress = (path: string) => {
    router.push(path)
  }

  const handleCenterButtonPress = () => {
    // Animate the center button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Execute the onPress function
    if (centerButton?.onPress) {
      centerButton.onPress()
    }
  }

  // Split tabs into left and right groups
  const leftTabs = tabs.slice(0, Math.ceil(tabs.length / 2))
  const rightTabs = tabs.slice(Math.ceil(tabs.length / 2))

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.content}>
        <View style={styles.tabGroup}>
          {leftTabs.map((tab, index) => (
            <TabBarButton
              key={index}
              icon={tab.icon}
              label={tab.label}
              onPress={() => handleTabPress(tab.path)}
              isActive={activeTab === tab.path}
            />
          ))}
        </View>

        {centerButton && (
          <View style={styles.centerButtonContainer}>
            <Animated.View style={[styles.centerButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity style={styles.centerButton} onPress={handleCenterButtonPress} activeOpacity={0.8}>
                {centerButton.icon}
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <View style={styles.tabGroup}>
          {rightTabs.map((tab, index) => (
            <TabBarButton
              key={index}
              icon={tab.icon}
              label={tab.label}
              onPress={() => handleTabPress(tab.path)}
              isActive={activeTab === tab.path}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tabGroup: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingVertical: 10,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  centerButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  centerButtonWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default FloatingBottomBar

