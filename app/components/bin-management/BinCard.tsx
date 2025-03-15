"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native"
import { colors } from "../../../src/styles/styles"
import { Trash2 } from "lucide-react-native"

interface BinCardProps {
  binName: string
  binData: any
  onPress: () => void
}

const BinCard = ({ binName, binData, onPress }: BinCardProps) => {
  // Get trash level from binData
  const trashLevel =
    binData?.trashLevel !== undefined
      ? Math.min(binData.trashLevel, 100)
      : binData?.fillLevel !== undefined
        ? Math.min(binData.fillLevel, 100)
        : 0

  // Animation value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current

  // Start animation when component mounts or trashLevel changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: trashLevel / 100,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [trashLevel])

  // Interpolate colors based on trash level
  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.4, 0.7, 0.9],
    outputRange: ["#2ecc71", "#3498db", "#f39c12", "#e74c3c"],
  })

  // Determine status text based on trash level
  const getStatusText = () => {
    if (trashLevel >= 80) return "Critical"
    if (trashLevel >= 60) return "High"
    if (trashLevel >= 40) return "Medium"
    if (trashLevel >= 20) return "Low"
    return "Empty"
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Trash2 size={20} color={colors.primary} />
        </View>
        <Text style={styles.binName}>{binName}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Trash Level</Text>
          <Text style={styles.progressValue}>{Math.round(trashLevel)}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>

        <Text style={[styles.statusText, { color: progressColor }]}>{getStatusText()}</Text>
      </View>

      {binData?.location && (
        <Text style={styles.locationText} numberOfLines={1}>
          📍 {binData.location.address || "Location available"}
        </Text>
      )}

      {/* <Text style={styles.lastUpdatedText}>
        🕒{" "}
        {binData?.lastUpdated ? `Updated: ${new Date(binData.lastUpdated).toLocaleTimeString()}` : "Status available"}
      </Text> */}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  binName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
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

export default BinCard

