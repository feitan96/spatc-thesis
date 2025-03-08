// /app/user/Analytics.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../../src/styles/styles";
import BottomBar from "../components/UserBottomBar";
import { BarChart } from "react-native-chart-kit";

// Define the type for analytics data
interface AnalyticsData {
  allTime: number;
  lastMonth: number;
  monthly: { [key: string]: number }; // Explicitly define the type for monthly
  lastWeek: number;
  today: number;
}

const AnalyticsScreen = () => {
  const { userId } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    allTime: 0,
    lastMonth: 0,
    monthly: {},
    lastWeek: 0,
    today: 0,
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!userId) return;

      const trashEmptyingRef = collection(db, "trashEmptying");
      const q = query(trashEmptyingRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const data: AnalyticsData = {
        allTime: 0,
        lastMonth: 0,
        monthly: {},
        lastWeek: 0,
        today: 0,
      };

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      querySnapshot.forEach((doc) => {
        const entry = doc.data();
        const emptiedAt = entry.emptiedAt.toDate();
        const volume = entry.volume;

        // All-Time
        data.allTime += volume;

        // Last Month
        if (emptiedAt > oneMonthAgo) {
          data.lastMonth += volume;
        }

        // Monthly
        const monthYear = emptiedAt.toLocaleString("default", { month: "short", year: "numeric" });
        if (!data.monthly[monthYear]) {
          data.monthly[monthYear] = 0;
        }
        data.monthly[monthYear] += volume;

        // Last Week
        if (emptiedAt > oneWeekAgo) {
          data.lastWeek += volume;
        }

        // Today
        if (emptiedAt > oneDayAgo) {
          data.today += volume;
        }
      });

      setAnalyticsData(data);
    };

    fetchAnalyticsData();
  }, [userId]);

  // Prepare data for the bar chart
  const sortedMonthlyEntries = Object.entries(analyticsData.monthly).sort((a, b) => {
    const dateA = new Date(a[0]); // Convert monthYear string to Date
    const dateB = new Date(b[0]); // Convert monthYear string to Date
    return dateA.getTime() - dateB.getTime(); // Sort in ascending order
  });

  // Reverse the sorted entries to place the latest month on the right-most side
  const reversedMonthlyEntries = sortedMonthlyEntries.reverse();

  const barData = {
    labels: reversedMonthlyEntries.map(([monthYear]) => monthYear), // Reversed months
    datasets: [
      {
        data: reversedMonthlyEntries.map(([, volume]) => volume), // Reversed volumes
      },
    ],
  };
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Analytics</Text>

        {/* All-Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All-Time</Text>
          <Text style={styles.cardValue}>{analyticsData.allTime.toFixed(2)} liters</Text>
        </View>

        {/* Last Month */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Month</Text>
          <Text style={styles.cardValue}>{analyticsData.lastMonth.toFixed(2)} liters</Text>
        </View>

        {/* Monthly Bar Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly</Text>
          <BarChart
            data={barData}
            width={Dimensions.get("window").width - 32} // Full width minus padding
            height={220}
            yAxisLabel=""
            yAxisSuffix=" L"
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: colors.primary,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Last Week */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Week</Text>
          <Text style={styles.cardValue}>{analyticsData.lastWeek.toFixed(2)} liters</Text>
        </View>

        {/* Today */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today</Text>
          <Text style={styles.cardValue}>{analyticsData.today.toFixed(2)} liters</Text>
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    color: colors.secondary,
  },
});

export default AnalyticsScreen;