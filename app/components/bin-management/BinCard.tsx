import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { colors } from "../../../src/styles/styles"
import { Trash2 } from "lucide-react-native"

interface BinCardProps {
  binName: string
  binData: any
  onPress: () => void
}

const BinCard = ({ binName, binData, onPress }: BinCardProps) => {
  // Calculate fill level percentage if available
  const fillLevel = binData?.fillLevel ? Math.min(binData.fillLevel, 100) : 0

  // Determine status color based on fill level
  const getStatusColor = () => {
    if (fillLevel >= 80) return "#e74c3c" // Red for high fill level
    if (fillLevel >= 50) return "#f39c12" // Orange for medium fill level
    return "#2ecc71" // Green for low fill level
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Trash2 size={24} color={colors.primary} />
      </View>
      <Text style={styles.binName}>{binName}</Text>

      {binData?.fillLevel !== undefined && (
        <View style={styles.statusContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${fillLevel}%`, backgroundColor: getStatusColor() }]} />
          </View>
          <Text style={styles.statusText}>{fillLevel}% Full</Text>
        </View>
      )}

      {binData?.location && (
        <Text style={styles.locationText} numberOfLines={1}>
          {binData.location.address || "Location available"}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "48%",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  binName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  statusContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.tertiary,
    marginTop: 4,
  },
})

export default BinCard

