"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native"
import { colors } from "../../../src/styles/styles"
import { Trash2 } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

interface BinCardEnhancedProps {
  binName: string
  binData: any
  onPress: () => void
}

const BinCardEnhanced = ({ binName, binData, onPress }: BinCardEnhancedProps) => {
  // Get trash level from binData
  const trashLevel =
    binData?.trashLevel !== undefined
      ? Math.min(binData.trashLevel, 100)
      : binData?.fillLevel !== undefined
        ? Math.min(binData.fillLevel, 100)
        : 0

  // Animation value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(1)).current

  // Start animation when component mounts or trashLevel changes
  useEffect(() => {
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: trashLevel / 100,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()

    // Bounce animation for the card
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.03,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [trashLevel])

  // Get gradient colors based on trash level
  const getGradientColors = () => {
    if (trashLevel >= 90) return ["#EF4444", "#B91C1C"] // Critical - Red
    if (trashLevel >= 50) return ["#F59E0B", "#D97706"] // Warning - Amber
    if (trashLevel > 0) return ["#10B981", "#059669"] // Good - Green
    return ["#10B981", "#059669"] // Empty - Green
  }

  // Determine status text and color based on trash level
  const getStatusInfo = () => {
    if (trashLevel >= 90) return { text: "Critical", color: "#EF4444" }
    if (trashLevel >= 50) return { text: "Warning", color: "#F59E0B" }
    if (trashLevel >= 0) return { text: "Good", color: "#10B981" }
    return { text: "Empty", color: "#10B981" }
  }

  const statusInfo = getStatusInfo()
  const gradientColors = getGradientColors()

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: bounceAnim }] }]}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trash2 size={22} color={colors.primary} />
          </View>
          <Text style={styles.binName}>{binName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Trash Level</Text>
            <Text style={[styles.progressValue, { color: statusInfo.color }]}>{Math.round(trashLevel)}%</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarBackground,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressBarGradient}
              />
            </Animated.View>
          </View>
        </View>

        {/* <View style={styles.footer}>
          {binData?.location && (
            <Text style={styles.locationText} numberOfLines={1}>
              📍 {binData.location.address || "Location available"}
            </Text>
          )}

          <Text style={styles.lastUpdatedText}>
            🕒{" "}
            {binData?.lastUpdated
              ? `Updated: ${new Date(binData.lastUpdated).toLocaleTimeString()}`
              : "Status available"}
          </Text>
        </View> */}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  binName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 7,
    overflow: "hidden",
  },
  progressBarBackground: {
    height: "100%",
    borderRadius: 7,
    overflow: "hidden",
  },
  progressBarGradient: {
    height: "100%",
    width: "100%",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 16,
  },
  locationText: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.tertiary,
  },
})

export default BinCardEnhanced

