import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../../src/styles/styles"
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"

interface BinDataSectionProps {
  distance: number | null
  gps: {
    altitude: number | null
    latitude: number | null
    longitude: number | null
  }
  trashLevel: number
}

const BinDataSection: React.FC<BinDataSectionProps> = ({ distance, gps, trashLevel }) => {
  // Get color based on trash level
  const getTrashLevelColor = (level: number) => {
    if (level < 40) return "#10B981" // Green
    if (level < 70) return "#F59E0B" // Amber
    return "#EF4444" // Red
  }

  const trashLevelColor = getTrashLevelColor(trashLevel)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bin Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: trashLevelColor }]}>
          <Text style={styles.statusText}>{trashLevel < 40 ? "Good" : trashLevel < 70 ? "Warning" : "Critical"}</Text>
        </View>
      </View>

      <View style={styles.trashLevelContainer}>
        <View style={styles.trashLevelInfo}>
          <Text style={styles.trashLevelLabel}>Trash Level</Text>
          <Text style={[styles.trashLevelValue, { color: trashLevelColor }]}>{trashLevel}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${trashLevel}%`,
                backgroundColor: trashLevelColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dataGrid}>
        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="ruler" size={20} color={colors.primary} />
          </View>
          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>Distance</Text>
            <Text style={styles.dataValue}>{distance} cm</Text>
          </View>
        </View>

        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-up" size={20} color={colors.primary} />
          </View>
          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>Altitude</Text>
            <Text style={styles.dataValue}>{gps.altitude || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />
          </View>
          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>Latitude</Text>
            <Text style={styles.dataValue}>{gps.latitude?.toFixed(6) || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.dataItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />
          </View>
          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>Longitude</Text>
            <Text style={styles.dataValue}>{gps.longitude?.toFixed(6) || "N/A"}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  trashLevelContainer: {
    marginBottom: 20,
  },
  trashLevelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trashLevelLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  trashLevelValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dataItem: {
    flexDirection: "row",
    width: "48%",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dataContent: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
})

export default BinDataSection

