"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { colors, shadows } from "../../src/styles/styles"
import { Calendar, ChevronDown, ArrowUp, Users, Trash2, X, Check, TrendingUp } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BarChart } from "react-native-gifted-charts"
import React from "react"

// Time period options
const TIME_PERIODS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all-time" },
]

const Analytics = () => {
  const [binsData, setBinsData] = useState<{ bin: string; volume: number }[]>([])
  const [usersData, setUsersData] = useState<{ userId: string; name: string; volume: number }[]>([])
  const [showBinVolume, setShowBinVolume] = useState(true)
  const [timePeriod, setTimePeriod] = useState("all-time")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [totalVolume, setTotalVolume] = useState(0)
  const [topPerformer, setTopPerformer] = useState<{ name: string; volume: number } | null>(null)

  const screenWidth = Dimensions.get("window").width - 40

  // Get the start date based on selected time period
  const getStartDate = useCallback(() => {
    const now = new Date()

    switch (timePeriod) {
      case "today":
        // Start of today
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())

      case "week":
        // Start of this week (Sunday)
        const dayOfWeek = now.getDay()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)

      case "month":
        // Start of this month
        return new Date(now.getFullYear(), now.getMonth(), 1)

      case "year":
        // Start of this year
        return new Date(now.getFullYear(), 0, 1)

      case "all-time":
      default:
        // Return null for all-time (no date filter)
        return null
    }
  }, [timePeriod])

  // Get formatted time period label for display
  const getTimePeriodLabel = useCallback(() => {
    return TIME_PERIODS.find((period) => period.value === timePeriod)?.label || "All Time"
  }, [timePeriod])

  // Fetch bins data with time period filter
  const fetchBinsData = useCallback(async () => {
    setIsLoading(true)

    try {
      const trashEmptyingRef = collection(db, "trashEmptying")
      let queryRef = query(trashEmptyingRef)

      // Apply date filter if not all-time
      const startDate = getStartDate()
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate)
        queryRef = query(trashEmptyingRef, where("emptiedAt", ">=", startTimestamp))
      }

      const querySnapshot = await getDocs(queryRef)
      const binsMap: { [key: string]: number } = {}
      let total = 0 // Initialize total volume

      querySnapshot.forEach((doc) => {
        const entry = doc.data()
        const bin = entry.bin
        const volume = entry.volume

        if (!binsMap[bin]) {
          binsMap[bin] = 0
        }
        binsMap[bin] += volume
        total += volume // Add to total volume
      })

      const binsList = Object.entries(binsMap)
        .map(([bin, volume]) => ({
          bin,
          volume,
        }))
        .sort((a, b) => b.volume - a.volume)

      setBinsData(binsList)
      setTotalVolume(total) // Update total volume state
    } catch (error) {
      console.error("Error fetching bins data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [getStartDate])

  // Fetch users data with time period filter
  const fetchUsersData = useCallback(async () => {
    setIsLoading(true)

    try {
      const trashEmptyingRef = collection(db, "trashEmptying")
      const usersRef = collection(db, "users")

      let queryRef = query(trashEmptyingRef)

      // Apply date filter if not all-time
      const startDate = getStartDate()
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate)
        queryRef = query(trashEmptyingRef, where("emptiedAt", ">=", startTimestamp))
      }

      const querySnapshot = await getDocs(queryRef)
      const usersSnapshot = await getDocs(usersRef)

      const usersMap: { [key: string]: { name: string; volume: number; role: string } } = {}

      // Initialize users map with names and roles
      usersSnapshot.forEach((doc) => {
        const user = doc.data()
        usersMap[user.userId] = {
          name: `${user.firstName} ${user.lastName}`,
          volume: 0,
          role: user.role,
        }
      })

      // Calculate volume for each user
      querySnapshot.forEach((doc) => {
        const entry = doc.data()
        const userId = entry.userId
        const volume = entry.volume

        if (usersMap[userId]) {
          usersMap[userId].volume += volume
        }
      })

      // Filter users by role and sort by volume
      const usersList = Object.entries(usersMap)
        .filter(([, { role }]) => role === "user")
        .map(([userId, { name, volume }]) => ({
          userId,
          name,
          volume,
        }))
        .sort((a, b) => b.volume - a.volume)

      setUsersData(usersList)

      // Set top performer
      if (usersList.length > 0) {
        setTopPerformer(usersList[0])
      }
    } catch (error) {
      console.error("Error fetching users data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [getStartDate])

  // Fetch data when time period changes
  useEffect(() => {
    fetchBinsData()
    fetchUsersData()
  }, [fetchBinsData, fetchUsersData, timePeriod])

  // Handle time period selection
  const handleSelectTimePeriod = (value: string) => {
    setTimePeriod(value)
    setIsDropdownOpen(false)
  }

  // Round up to the nearest whole number for max Y value
  const getMaxYValue = (data: number[]) => {
    if (data.length === 0) return 10
    const max = Math.max(...data)
    return Math.ceil(max)
  }

  // Prepare chart data for bins
  const binChartData = {
    labels: binsData.slice(0, 5).map((item) => item.bin),
    datasets: [
      {
        data: binsData.slice(0, 5).map((item) => item.volume),
      },
    ],
  }

  // Prepare chart data for users
  const userChartData = {
    labels: usersData.slice(0, 5).map((item) => item.name.split(" ")[0]), // Use first name only for labels
    datasets: [
      {
        data: usersData.slice(0, 5).map((item) => item.volume),
      },
    ],
  }

  // Get max values for Y axis
  const binMaxY = getMaxYValue(binsData.slice(0, 5).map((item) => item.volume))
  const userMaxY = getMaxYValue(usersData.slice(0, 5).map((item) => item.volume))

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    color: (opacity = 1) => `rgba(39, 55, 77, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0, // Use whole numbers
    labelColor: (opacity = 1) => `rgba(82, 109, 130, ${opacity})`,
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        {/* Time Period Selector */}
        <TouchableOpacity style={styles.periodSelector} onPress={() => setIsDropdownOpen(true)}>
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.periodSelectorText}>{getTimePeriodLabel()}</Text>
          <ChevronDown size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Summary Card - Full Width */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fullWidthSummaryCard}
        >
          <View style={styles.summaryIconContainer}>
            <TrendingUp size={24} color={colors.white} />
          </View>
          <Text style={styles.summaryLabel}>Total Volume</Text>
          <Text style={styles.summaryValue}>{totalVolume.toFixed(2)} L</Text>
        </LinearGradient>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, showBinVolume && styles.activeToggleButton]}
            onPress={() => setShowBinVolume(true)}
          >
            <Trash2 size={18} color={showBinVolume ? colors.white : colors.primary} />
            <Text style={[styles.toggleText, showBinVolume && styles.activeToggleText]}>Bin Volume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, !showBinVolume && styles.activeToggleButton]}
            onPress={() => setShowBinVolume(false)}
          >
            <Users size={18} color={!showBinVolume ? colors.white : colors.primary} />
            <Text style={[styles.toggleText, !showBinVolume && styles.activeToggleText]}>User Trends</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            {/* Conditional Rendering Based on Toggle */}
            {showBinVolume ? (
              // Bin Volume Section
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Volume by Bin</Text>

                {binsData.length > 0 ? (
                  <>
                    {/* Bar Chart for Bins */}
                    <View style={styles.chartOuterContainer}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        contentContainerStyle={styles.chartScrollContent}
                      >
                        <BarChart
                          data={binsData.slice(0, 5).map((item) => ({
                            value: item.volume,
                            label: item.bin.length > 10 ? item.bin.substring(0, 10) + "..." : item.bin,
                            frontColor: colors.primary,
                          }))}
                          width={Math.max(screenWidth, binsData.slice(0, 5).length * 100)}
                          height={240}
                          barWidth={40}
                          spacing={20}
                          initialSpacing={20}
                          endSpacing={20}
                          xAxisColor={colors.tertiary}
                          yAxisColor={colors.tertiary}
                          yAxisTextStyle={{ color: colors.secondary, fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: colors.secondary, fontSize: 12, transform: [{ rotate: '0deg' }] }}
                          hideRules
                          showYAxisIndices
                          yAxisLabelWidth={50}
                          yAxisLabelSuffix=" L"
                          yAxisLabelPrefix=""
                          showFractionalValues={false}
                        />
                      </ScrollView>
                      {binsData.length > 5 && <Text style={styles.chartNote}>Showing top 5 bins by volume</Text>}
                    </View>

                    {/* Bins List */}
                    <View style={styles.listContainer}>
                      <View style={styles.listHeader}>
                        <Text style={styles.listHeaderText}>Bin</Text>
                        <Text style={styles.listHeaderText}>Volume</Text>
                      </View>

                      {binsData.map(({ bin, volume }, index) => (
                        <View key={bin} style={[styles.listItem, index % 2 === 0 && styles.listItemAlt]}>
                          <View style={styles.listItemLeft}>
                            <View style={styles.rankBadge}>
                              <Text style={styles.rankText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.itemName}>{bin}</Text>
                          </View>
                          <Text style={styles.itemValue}>{volume.toFixed(2)} L</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Trash2 size={48} color={colors.tertiary} />
                    <Text style={styles.emptyText}>No data available for this time period</Text>
                  </View>
                )}
              </View>
            ) : (
              // User Trends Section
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Collector Leaderboard</Text>

                {usersData.length > 0 ? (
                  <>
                    {/* Bar Chart for Users */}
                    <View style={styles.chartOuterContainer}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        contentContainerStyle={styles.chartScrollContent}
                      >
                        <BarChart
                          data={usersData.slice(0, 5).map((item) => ({
                            value: item.volume,
                            label: item.name.split(" ")[0].length > 10 
                              ? item.name.split(" ")[0].substring(0, 10) + "..." 
                              : item.name.split(" ")[0],
                            frontColor: colors.primary,
                          }))}
                          width={Math.max(screenWidth, usersData.slice(0, 5).length * 100)}
                          height={240}
                          barWidth={40}
                          spacing={20}
                          initialSpacing={20}
                          endSpacing={20}
                          xAxisColor={colors.tertiary}
                          yAxisColor={colors.tertiary}
                          yAxisTextStyle={{ color: colors.secondary, fontSize: 12 }}
                          xAxisLabelTextStyle={{ color: colors.secondary, fontSize: 12, transform: [{ rotate: '0deg' }] }}
                          hideRules
                          showYAxisIndices
                          yAxisLabelWidth={50}
                          yAxisLabelSuffix=" L"
                          yAxisLabelPrefix=""
                          showFractionalValues={false}
                        />
                      </ScrollView>
                      {usersData.length > 5 && <Text style={styles.chartNote}>Showing top 5 collectors by volume</Text>}
                    </View>

                    {/* Top Performer Card */}
                    {topPerformer && (
                      <View style={styles.topPerformerCard}>
                        <View style={styles.topPerformerHeader}>
                          <Text style={styles.topPerformerTitle}>Top Performer</Text>
                          <View style={styles.topPerformerBadge}>
                            <ArrowUp size={14} color={colors.white} />
                            <Text style={styles.topPerformerBadgeText}>1st</Text>
                          </View>
                        </View>
                        <Text style={styles.topPerformerName}>{topPerformer.name}</Text>
                        <Text style={styles.topPerformerVolume}>{topPerformer.volume.toFixed(2)} liters collected</Text>
                      </View>
                    )}

                    {/* Users List */}
                    <View style={styles.listContainer}>
                      <View style={styles.listHeader}>
                        <Text style={styles.listHeaderText}>Collector</Text>
                        <Text style={styles.listHeaderText}>Volume</Text>
                      </View>

                      {usersData.map(({ userId, name, volume }, index) => (
                        <View key={userId} style={[styles.listItem, index % 2 === 0 && styles.listItemAlt]}>
                          <View style={styles.listItemLeft}>
                            <View
                              style={[
                                styles.rankBadge,
                                index === 0 && styles.firstRankBadge,
                                index === 1 && styles.secondRankBadge,
                                index === 2 && styles.thirdRankBadge,
                              ]}
                            >
                              <Text style={[styles.rankText, index <= 2 && styles.topRankText]}>{index + 1}</Text>
                            </View>
                            <Text style={styles.itemName}>{name}</Text>
                          </View>
                          <Text style={styles.itemValue}>{volume.toFixed(2)} L</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Users size={48} color={colors.tertiary} />
                    <Text style={styles.emptyText}>No data available for this time period</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Time Period Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Period</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsDropdownOpen(false)}>
                <X size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[styles.periodOption, timePeriod === period.value && styles.selectedPeriod]}
                onPress={() => handleSelectTimePeriod(period.value)}
              >
                <Text style={[styles.periodText, timePeriod === period.value && styles.selectedPeriodText]}>
                  {period.label}
                </Text>
                {timePeriod === period.value && <Check size={20} color={colors.white} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Extra space for bottom bar
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    ...shadows.medium,
  },
  periodSelectorText: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    marginLeft: 10,
  },
  fullWidthSummaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    ...shadows.medium,
  },
  summaryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    ...shadows.small,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeToggleButton: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
  activeToggleText: {
    color: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  chartOuterContainer: {
    marginBottom: 20,
  },
  chartScrollContent: {
    paddingRight: 20,
    minWidth: "100%",
  },
  chart: {
    borderRadius: 16,
    paddingRight: 20,
    paddingLeft: 10, // Add left padding to ensure y-axis values are visible
  },
  chartNote: {
    fontSize: 12,
    color: colors.tertiary,
    fontStyle: "italic",
    marginTop: 8,
  },
  listContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${colors.tertiary}30`,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}20`,
  },
  listItemAlt: {
    backgroundColor: `${colors.background}50`,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.tertiary}30`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  firstRankBadge: {
    backgroundColor: "#FFD700",
  },
  secondRankBadge: {
    backgroundColor: "#C0C0C0",
  },
  thirdRankBadge: {
    backgroundColor: "#CD7F32",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.secondary,
  },
  topRankText: {
    color: colors.white,
  },
  itemName: {
    fontSize: 16,
    color: colors.primary,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
  },
  topPerformerCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  topPerformerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  topPerformerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  topPerformerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topPerformerBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
    marginLeft: 4,
  },
  topPerformerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  topPerformerVolume: {
    fontSize: 16,
    color: colors.secondary,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}20`,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  periodOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}20`,
  },
  selectedPeriod: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 16,
    color: colors.secondary,
  },
  selectedPeriodText: {
    color: colors.white,
    fontWeight: "bold",
  },
})

export default Analytics

