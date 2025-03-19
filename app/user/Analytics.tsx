"use client"

import React, { useEffect, useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, Dimensions } from "react-native"
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { globalStyles, colors, shadows, spacing, borderRadius, trashLevels } from "../../src/styles/styles"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useAuth } from "../../src/auth/AuthContext"
import { BarChart } from "react-native-chart-kit"
import { format, subDays, isToday } from "date-fns"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Users,
  Trash2,
  Clock,
  TrendingUp,
  Droplet,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

// Define the type for analytics data
interface AnalyticsData {
  allTime: number
  lastMonth: number
  monthly: { [key: string]: number }
  lastWeek: number
  today: number
}

interface MonthlyData {
  month: string
  volume: number
  isCurrentMonth: boolean
}

const AnalyticsScreen = () => {
  const { userId } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    allTime: 0,
    lastMonth: 0,
    monthly: {},
    lastWeek: 0,
    today: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyDataArray, setMonthlyDataArray] = useState<MonthlyData[]>([])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const trashEmptyingRef = collection(db, "trashEmptying")
        const q = query(trashEmptyingRef, where("userId", "==", userId))
        const querySnapshot = await getDocs(q)

        const data: AnalyticsData = {
          allTime: 0,
          lastMonth: 0,
          monthly: {},
          lastWeek: 0,
          today: 0,
        }

        const now = new Date()
        const oneDayAgo = subDays(now, 1)
        const oneWeekAgo = subDays(now, 7)
        const oneMonthAgo = subDays(now, 30)

        // Get current month for comparison
        const currentMonthYear = format(now, "MMM yyyy")

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
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [userId])

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        {/* Today's Volume - Highlighted Card */}
        <View style={styles.todayCard}>
          <LinearGradient
            colors={trashLevels.getGradientColors(50)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.todayCardGradient}
          >
            <View style={styles.todayCardContent}>
              <View style={styles.todayIconContainer}>
                <Calendar size={24} color={colors.white} />
              </View>
              <View style={styles.todayTextContainer}>
                <Text style={styles.todayLabel}>Today's Collection</Text>
                <Text style={styles.todayValue}>{analyticsData.today.toFixed(2)} liters</Text>
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
                // showValuesOnTopOfBars
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

        {/* Performance Insights Card - Optional additional feature */}
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

        <LinearGradient
          colors={["#4CAF50", "#45a049"] as readonly [string, string]}
          style={styles.gradientButton}
        >
          <Text style={styles.gradientButtonText}>View Details</Text>
        </LinearGradient>

        <Text style={styles.dateText}>{format(new Date(), "MMMM d, yyyy")}</Text>
      </ScrollView>
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
    paddingBottom: 100, // Extra space for bottom bar
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
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
  gradientButton: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  dateText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
})

export default AnalyticsScreen

