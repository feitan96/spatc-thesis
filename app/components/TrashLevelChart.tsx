// /shared/TrashLevelChart.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { format, startOfDay, endOfDay } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "@/src/styles/styles";

interface TrashLevelData {
  x: Date; // Time
  y: number; // Trash level percentage
}

const TrashLevelChart = ({ binName }: { binName: string }) => {
  const [trashLevelData, setTrashLevelData] = useState<TrashLevelData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
  const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility

  // Fetch trash level data for the selected date
  useEffect(() => {
    const fetchTrashLevelData = async () => {
      if (binName) {
        const startOfSelectedDate = startOfDay(selectedDate);
        const endOfSelectedDate = endOfDay(selectedDate);

        const q = query(
          collection(db, "trashLevels"),
          where("bin", "==", binName),
          where("createdAt", ">=", startOfSelectedDate),
          where("createdAt", "<=", endOfSelectedDate)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs
          .map((doc) => {
            const docData = doc.data();
            const createdAt = docData.createdAt?.toDate();
            const trashLevel = docData.trashLevel;

            // Ensure createdAt and trashLevel are valid
            if (createdAt && typeof trashLevel === "number") {
              return {
                x: createdAt, // Time
                y: trashLevel, // Trash level percentage
              };
            }
            return null; // Skip invalid data
          })
          .filter((item) => item !== null) as TrashLevelData[]; // Filter out null values

        // Sort data by time (ascending)
        data.sort((a, b) => a.x.getTime() - b.x.getTime());

        setTrashLevelData(data);
      }
    };

    fetchTrashLevelData();
  }, [binName, selectedDate]);

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false); // Hide the date picker
    if (date) {
      setSelectedDate(date); // Update the selected date
    }
  };

  // Format data for the chart
  const chartData = {
    labels: trashLevelData.map((item) => format(item.x, "HH:mm")), // Format time as "HH:mm"
    datasets: [
      {
        data: trashLevelData.map((item) => item.y), // Trash level percentages
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Date Picker */}
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerText}>
          {format(selectedDate, "yyyy-MM-dd")}
        </Text>
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      {/* Chart */}
      {trashLevelData.length > 0 ? (
        <LineChart
          data={chartData}
          width={350} // Width of the chart
          height={220} // Height of the chart
          yAxisLabel="" // Optional: Add a label for the y-axis
          yAxisSuffix="%" // Add a suffix for the y-axis values
          fromZero // Start y-axis from 0
          yAxisInterval={20} // Set y-axis increments to 20
          chartConfig={{
            backgroundColor: colors.white,
            backgroundGradientFrom: colors.white,
            backgroundGradientTo: colors.white,
            decimalPlaces: 0, // No decimal places for percentages
            color: (opacity = 1) => colors.secondary, // Line color (green)
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color (black)
            style: {
              borderRadius: 16, // Rounded corners
            },
            propsForDots: {
              r: "4", // Dot radius
              strokeWidth: "2",
              stroke: colors.secondary, // Dot stroke color (green)
            },
          }}
          bezier // Smooth line
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No data available for the selected date.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  datePickerButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.white,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "grey",
  },
});

export default TrashLevelChart;