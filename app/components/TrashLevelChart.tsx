"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, Text, TouchableOpacity, Platform, Dimensions, ScrollView } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { format, startOfDay, endOfDay, subDays } from "date-fns"
import DateTimePicker from "@react-native-community/datetimepicker"
import { colors } from "@/src/styles/styles"
import { MaterialIcons } from "@expo/vector-icons"

interface TrashLevelData {
  x: Date // Time
  y: number // Trash level percentage
}

const TrashLevelChart = ({ binName }: { binName: string }) => {
  const [trashLevelData, setTrashLevelData] = useState<TrashLevelData[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date()) // Default to current date
  const [showDatePicker, setShowDatePicker] = useState(false) // Control date picker visibility
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDataPoint, setSelectedDataPoint] = useState<TrashLevelData | null>(null)

  // Fetch trash level data for the selected date
  useEffect(() => {
    const fetchTrashLevelData = async () => {
      if (binName) {
        setIsLoading(true)
        const startOfSelectedDate = startOfDay(selectedDate)
        const endOfSelectedDate = endOfDay(selectedDate)

        const q = query(
          collection(db, "trashLevels"),
          where("bin", "==", binName),
          where("createdAt", ">=", startOfSelectedDate),
          where("createdAt", "<=", endOfSelectedDate),
        )

        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs
          .map((doc) => {
            const docData = doc.data()
            const createdAt = docData.createdAt?.toDate()
            const trashLevel = docData.trashLevel

            // Ensure createdAt and trashLevel are valid
            if (createdAt && typeof trashLevel === "number") {
              return {
                x: createdAt, // Time
                y: trashLevel, // Trash level percentage
              }
            }
            return null // Skip invalid data
          })
          .filter((item) => item !== null) as TrashLevelData[] // Filter out null values

        // Sort data by time (ascending)
        data.sort((a, b) => a.x.getTime() - b.x.getTime())

        setTrashLevelData(data)
        setSelectedDataPoint(null)
        setIsLoading(false)
      }
    }

    fetchTrashLevelData()
  }, [binName, selectedDate])

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false) // Hide the date picker
    if (date) {
      setSelectedDate(date) // Update the selected date
    }
  }

  // Navigate to previous day
  const goToPreviousDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1))
  }

  // Navigate to next day
  const goToNextDay = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Don't allow selecting future dates
    if (selectedDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate((prevDate) => new Date(prevDate.setDate(prevDate.getDate() + 1)))
    }
  }

  // Filter x-axis labels to prevent overcrowding (show every 3 hours)
  const filterLabels = (value: string, index: number, values: string[]) => {
    // Show labels for every 3 hours (0, 3, 6, 9, 12, 15, 18, 21)
    const hour = Number.parseInt(value.split(":")[0], 10)
    return hour % 3 === 0
  }

  // Handle data point selection
  const handleDataPointClick = (data: any) => {
    if (data.index !== undefined && trashLevelData[data.index]) {
      setSelectedDataPoint(trashLevelData[data.index])
    }
  }

  // Format data for the chart
  const chartData = {
    labels: trashLevelData.map((item) => format(item.x, "HH:mm")), // Format time as "HH:mm"
    datasets: [
      {
        data: trashLevelData.length > 0 ? trashLevelData.map((item) => item.y) : [0], // Trash level percentages
        color: () => colors.primary, // Line color
        strokeWidth: 2,
      },
    ],
  }

  const screenWidth = Dimensions.get("window").width - 40
  // For wider charts, use this width
  const chartWidth = Math.max(screenWidth, trashLevelData.length * 20)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trash Level History</Text>

      <View style={styles.dateNavigator}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
          <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerText}>{format(selectedDate, "MMMM dd, yyyy")}</Text>
          <MaterialIcons name="calendar-today" size={16} color={colors.white} style={styles.calendarIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={goToNextDay}
          disabled={selectedDate.getTime() >= new Date().setHours(0, 0, 0, 0)}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={selectedDate.getTime() >= new Date().setHours(0, 0, 0, 0) ? colors.tertiary : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Selected Data Point Info */}
      {selectedDataPoint && (
        <View style={styles.dataPointInfo}>
          <Text style={styles.dataPointTime}>{format(selectedDataPoint.x, "hh:mm a")}</Text>
          <Text style={styles.dataPointValue}>{selectedDataPoint.y}%</Text>
        </View>
      )}

      {/* Chart */}
      <View style={styles.chartContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : trashLevelData.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingRight: 20 }}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth, trashLevelData.length * 30)} // Adjust width based on data points
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
              yAxisInterval={20}
              formatXLabel={(value, index) => {
                // Only show labels for every 3 hours to prevent overcrowding
                const hour = Number.parseInt(value.split(":")[0], 10)
                return hour % 3 === 0 ? value : ""
              }}
              onDataPointClick={handleDataPointClick}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(39, 55, 77, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(82, 109, 130, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: colors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: "#E2E8F0",
                },
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="bar-chart" size={48} color="#CBD5E1" />
            <Text style={styles.noDataText}>No data available for the selected date.</Text>
          </View>
        )}
      </View>

      {trashLevelData.length > 0 && (
        <Text style={styles.scrollHint}>
          <MaterialIcons name="swipe" size={14} color={colors.secondary} /> Scroll horizontally to view all data
        </Text>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600",
  },
  calendarIcon: {
    marginLeft: 8,
  },
  dataPointInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dataPointTime: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "500",
  },
  dataPointValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  chartContainer: {
    height: 220,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: colors.secondary,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
  },
  scrollHint: {
    fontSize: 12,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
})

export default TrashLevelChart

