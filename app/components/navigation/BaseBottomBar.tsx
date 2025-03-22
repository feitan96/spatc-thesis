"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { router, usePathname } from "expo-router"
import { colors } from "../../../src/styles/styles"
import TabBarButton from "./TabBarButton"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export interface TabItem {
  icon: React.ReactNode
  label: string
  path: string
}

interface BaseBottomBarProps {
  tabs: TabItem[]
}

const BaseBottomBar: React.FC<BaseBottomBarProps> = ({ tabs }) => {
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState("")

  useEffect(() => {
    // Find the matching tab for the current path
    const matchingTab = tabs.find((tab) => {
      // Check if the current path starts with the tab path
      // This handles nested routes
      return pathname.startsWith(tab.path)
    })

    if (matchingTab) {
      setActiveTab(matchingTab.path)
    }
  }, [pathname, tabs])

  const handleTabPress = (path: string) => {
    router.push(path)
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.content}>
        {tabs.map((tab, index) => (
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
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
  },
})

export default BaseBottomBar

