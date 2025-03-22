"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { useAuth } from "../../src/auth/AuthContext"
import { colors, shadows, spacing, borderRadius } from "../../src/styles/styles"
import EnhancedUserBottomBar from "../components/UserBottomBar"
import { BarChart } from "react-native-chart-kit"
import { format, subDays, isToday } from "date-fns"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Droplet,
  ChevronDown,
  Clock,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

// Define the type for analytics data
interface AnalyticsData {
  allTime: number
  lastMonth: number
  monthly: { [key: string]: number }
  lastWeek: number
  today: number
  selectedDate: number
}

interface MonthlyData {
  month: string
  volume: number
  isCurrentMonth: boolean
}

interface CollectionHistory {
  id: string
  bin: string
  volume: number
  emptiedAt: Date
}

const AnalyticsScreen = () => {
  const { userId, firstName, lastName } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    allTime: 0,
    lastMonth: 0,
    monthly: {},
    lastWeek: 0,
    today: 0,
    selectedDate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyDataArray, setMonthlyDataArray] = useState<MonthlyData[]>([])
  const [collectionHistory, setCollectionHistory] = useState<CollectionHistory[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData()
  }, [userId, selectedDate])

  const fetchAnalyticsData = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const trashEmptyingRef = collection(db, "trashEmptying")
      const q = query(trashEmptyingRef, where("userId", "==", userId), orderBy("emptiedAt", "desc"))
      const querySnapshot = await getDocs(q)

      const data: AnalyticsData = {
        allTime: 0,
        lastMonth: 0,
        monthly: {},
        lastWeek: 0,
        today: 0,
        selectedDate: 0,
      }

      const historyItems: CollectionHistory[] = []

      const now = new Date()
      const oneDayAgo = subDays(now, 1)
      const oneWeekAgo = subDays(now, 7)
      const oneMonthAgo = subDays(now, 30)

      // Get current month for comparison
      const currentMonthYear = format(now, "MMM yyyy")

      // Start and end of selected date
      const startOfSelectedDate = new Date(selectedDate)
      startOfSelectedDate.setHours(0, 0, 0, 0)

      const endOfSelectedDate = new Date(selectedDate)
      endOfSelectedDate.setHours(23, 59, 59, 999)

      querySnapshot.forEach((doc) => {
        const entry = doc.data()
        const emptiedAt = entry.emptiedAt.toDate()
        const volume = entry.volume

        // All-Time
        data.allTime += volume

        // Last Month
        if (emptiedAt > oneMonthAgo) {
          data.lastMonth += volume
        }

        // Monthly
        const monthYear = format(emptiedAt, "MMM yyyy")
        if (!data.monthly[monthYear]) {
          data.monthly[monthYear] = 0
        }
        data.monthly[monthYear] += volume

        // Last Week
        if (emptiedAt > oneWeekAgo) {
          data.lastWeek += volume
        }

        // Today
        if (isToday(emptiedAt)) {
          data.today += volume
        }

        // Selected Date
        if (emptiedAt >= startOfSelectedDate && emptiedAt <= endOfSelectedDate) {
          data.selectedDate += volume
        }

        // Collection history
        historyItems.push({
          id: doc.id,
          bin: entry.bin,
          volume: entry.volume,
          emptiedAt: emptiedAt,
        })
      })

      // Process monthly data for chart
      const monthlyEntries = Object.entries(data.monthly).map(([month, volume]) => ({
        month,
        volume,
        isCurrentMonth: month === currentMonthYear,
      }))

      // Sort by date (oldest to newest)
      monthlyEntries.sort((a, b) => {
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })

      setAnalyticsData(data)
      setMonthlyDataArray(monthlyEntries)
      setCollectionHistory(historyItems)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
    }
  }

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  // Navigate to next day
  const goToNextDay = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Don't allow selecting future dates
    if (selectedDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() + 1)
      setSelectedDate(newDate)
    }
  }

  // Prepare data for the bar chart
  const chartData = {
    labels: monthlyDataArray.map((item) => item.month),
    datasets: [
      {
        data: monthlyDataArray.map((item) => item.volume),
        colors: monthlyDataArray.map((item) => (item.isCurrentMonth ? () => colors.primary : () => colors.secondary)),
      },
    ],
  }

  const screenWidth = Dimensions.get("window").width - 40
  // For wider charts, use this width based on the number of months
  const chartWidth = Math.max(screenWidth, monthlyDataArray.length * 100)

  // Render collection history item
  const renderHistoryItem = ({ item }: { item: CollectionHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={styles.historyIconContainer}>
          <Trash2 size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.historyBinName}>{item.bin}</Text>
          <View style={styles.historyTimeContainer}>
            <Clock size={14} color={colors.tertiary} />
            <Text style={styles.historyTime}>{format(item.emptiedAt, "MMM d, yyyy h:mm a")}</Text>
          </View>
        </View>
      </View>
      <View style={styles.historyVolume}>
        <Text style={styles.historyVolumeText}>{item.volume.toFixed(2)} L</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateNavButton} onPress={goToPreviousDay}>
            <ArrowLeft size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.dateText}>{format(selectedDate, "MMMM d, yyyy")}</Text>
            <ChevronDown size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateNavButton}
            onPress={goToNextDay}
            disabled={selectedDate.getTime() >= new Date().setHours(0, 0, 0, 0)}
          >
            <ArrowRight
              size={20}
              color={selectedDate.getTime() >= new Date().setHours(0, 0, 0, 0) ? colors.tertiary : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Today's Volume - Highlighted Card */}
        <View style={styles.todayCard}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.todayCardGradient}
          >
            <View style={styles.todayCardContent}>
              <View style={styles.todayIconContainer}>
                <Calendar size={24} color={colors.white} />
              </View>
              <View style={styles.todayTextContainer}>
                <Text style={styles.todayLabel}>
                  {isToday(selectedDate) ? "Today's Collection" : "Selected Date Collection"}
                </Text>
                <Text style={styles.todayValue}>
                  {isToday(selectedDate) ? analyticsData.today.toFixed(2) : analyticsData.selectedDate.toFixed(2)}{" "}
                  liters
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Summary Stats Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Collection Summary</Text>

          <View style={styles.statsGrid}>
            {/* All-Time */}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>All-Time</Text>
                <Text style={styles.statValue}>{analyticsData.allTime.toFixed(2)} L</Text>
              </View>
            </View>

            {/* Last Month */}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.secondary}15` }]}>
                <Calendar size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Last 30 Days</Text>
                <Text style={styles.statValue}>{analyticsData.lastMonth.toFixed(2)} L</Text>
              </View>
            </View>

            {/* Last Week */}
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Droplet size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.statLabel}>Last 7 Days</Text>
                <Text style={styles.statValue}>{analyticsData.lastWeek.toFixed(2)} L</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Collection History Card */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Collection History</Text>

          {collectionHistory.length === 0 ? (
            <View style={styles.emptyHistoryContainer}>
              <Trash2 size={40} color={colors.tertiary} />
              <Text style={styles.emptyHistoryText}>No collection history found</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {collectionHistory.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View style={styles.historyIconContainer}>
                      <Trash2 size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.historyBinName}>{item.bin}</Text>
                      <View style={styles.historyTimeContainer}>
                        <Clock size={14} color={colors.tertiary} />
                        <Text style={styles.historyTime}>{format(item.emptiedAt, "MMM d, yyyy h:mm a")}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.historyVolume}>
                    <Text style={styles.historyVolumeText}>{item.volume.toFixed(2)} L</Text>
                  </View>
                </View>
              ))}

              {collectionHistory.length > 5 && (
                <Text style={styles.moreHistoryText}>+ {collectionHistory.length - 5} more collections</Text>
              )}
            </View>
          )}
        </View>

        {/* Monthly Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Monthly Breakdown</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Current Month</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
                <Text style={styles.legendText}>Previous Months</Text>
              </View>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : monthlyDataArray.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BarChart3 size={48} color={colors.tertiary} />
              <Text style={styles.emptyText}>No collection data available</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.chartScrollContent}
            >
              <BarChart
                data={chartData}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix=" L"
                fromZero
                withInnerLines={false}
                flatColor={true}
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 1,
                  color: (opacity = 1, index) => {
                    // Use custom colors for each bar
                    if (index !== undefined && chartData.datasets[0].colors && chartData.datasets[0].colors[index]) {
                      return chartData.datasets[0].colors[index](opacity)
                    }
                    return `rgba(39, 55, 77, ${opacity})`
                  },
                  labelColor: (opacity = 1) => `rgba(82, 109, 130, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.7,
                  propsForLabels: {
                    fontSize: 12,
                  },
                }}
                style={styles.chart}
              />
            </ScrollView>
          )}

          {monthlyDataArray.length > 0 && <Text style={styles.scrollHint}>Scroll horizontally to view all months</Text>}
        </View>

        {/* Performance Insights Card */}
        <View style={styles.insightsCard}>
          <Text style={styles.cardTitle}>Performance Insights</Text>

          <View style={styles.insightItem}>
            <View style={styles.insightIconContainer}>
              <TrendingUp size={20} color={colors.success} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>
                {analyticsData.lastWeek > 0 ? "Active Collection Week" : "No Recent Collections"}
              </Text>
              <Text style={styles.insightDescription}>
                {analyticsData.lastWeek > 0
                  ? `You've collected ${analyticsData.lastWeek.toFixed(2)} liters in the past week.`
                  : "You haven't made any collections in the past week."}
              </Text>
            </View>
          </View>

          {analyticsData.today > 0 && (
            <View style={styles.insightItem}>
              <View style={[styles.insightIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Today's Achievement</Text>
                <Text style={styles.insightDescription}>
                  You've collected {analyticsData.today.toFixed(2)} liters today. Great job!
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <EnhancedUserBottomBar />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80, // Extra space for bottom bar
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.small,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
    marginHorizontal: spacing.sm,
  },
  todayCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.medium,
  },
  todayCardGradient: {
    borderRadius: borderRadius.xl,
  },
  todayCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  todayIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  todayTextContainer: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  todayValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  historyList: {
    marginTop: spacing.xs,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}20`,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  historyBinName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  historyTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  historyTime: {
    fontSize: 12,
    color: colors.tertiary,
    marginLeft: 4,
  },
  historyVolume: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
  },
  historyVolumeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  moreHistoryText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  emptyHistoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  chartHeader: {
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: colors.secondary,
  },
  chartScrollContent: {
    paddingRight: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  scrollHint: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  loadingContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: colors.secondary,
  },
  emptyContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  insightsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  insightItem: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.success}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
})

export default AnalyticsScreen

