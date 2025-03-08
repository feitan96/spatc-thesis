import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal } from "react-native";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AdminBottomBar from "../components/AdminBottomBar";
import { globalStyles, colors } from "../../src/styles/styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Time period options
const TIME_PERIODS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all-time" },
];

const Analytics = () => {
  const [binsData, setBinsData] = useState<{ bin: string; volume: number }[]>([]);
  const [usersData, setUsersData] = useState<{ userId: string; name: string; volume: number }[]>([]);
  const [showBinVolume, setShowBinVolume] = useState(true);
  const [timePeriod, setTimePeriod] = useState("all-time");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the start date based on selected time period
  const getStartDate = useCallback(() => {
    const now = new Date();
    
    switch (timePeriod) {
      case "today":
        // Start of today
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      case "week":
        // Start of this week (Sunday)
        const dayOfWeek = now.getDay();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      
      case "month":
        // Start of this month
        return new Date(now.getFullYear(), now.getMonth(), 1);
      
      case "year":
        // Start of this year
        return new Date(now.getFullYear(), 0, 1);
      
      case "all-time":
      default:
        // Return null for all-time (no date filter)
        return null;
    }
  }, [timePeriod]);

  // Get formatted time period label for display
  const getTimePeriodLabel = useCallback(() => {
    return TIME_PERIODS.find(period => period.value === timePeriod)?.label || "All Time";
  }, [timePeriod]);

  // Fetch bins data with time period filter
  const fetchBinsData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const trashEmptyingRef = collection(db, "trashEmptying");
      let queryRef = query(trashEmptyingRef);
      
      // Apply date filter if not all-time
      const startDate = getStartDate();
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate);
        queryRef = query(trashEmptyingRef, where("emptiedAt", ">=", startTimestamp));
      }
      
      const querySnapshot = await getDocs(queryRef);
      const binsMap: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const entry = doc.data();
        const bin = entry.bin;
        const volume = entry.volume;

        if (!binsMap[bin]) {
          binsMap[bin] = 0;
        }
        binsMap[bin] += volume;
      });

      const binsList = Object.entries(binsMap)
        .map(([bin, volume]) => ({
          bin,
          volume,
        }))
        .sort((a, b) => b.volume - a.volume);

      setBinsData(binsList);
    } catch (error) {
      console.error("Error fetching bins data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getStartDate]);

  // Fetch users data with time period filter
  const fetchUsersData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const trashEmptyingRef = collection(db, "trashEmptying");
      const usersRef = collection(db, "users");
      
      let queryRef = query(trashEmptyingRef);
      
      // Apply date filter if not all-time
      const startDate = getStartDate();
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate);
        queryRef = query(trashEmptyingRef, where("emptiedAt", ">=", startTimestamp));
      }
      
      const querySnapshot = await getDocs(queryRef);
      const usersSnapshot = await getDocs(usersRef);

      const usersMap: { [key: string]: { name: string; volume: number; role: string } } = {};

      // Initialize users map with names and roles
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        usersMap[user.userId] = {
          name: `${user.firstName} ${user.lastName}`,
          volume: 0,
          role: user.role,
        };
      });

      // Calculate volume for each user
      querySnapshot.forEach((doc) => {
        const entry = doc.data();
        const userId = entry.userId;
        const volume = entry.volume;

        if (usersMap[userId]) {
          usersMap[userId].volume += volume;
        }
      });

      // Filter users by role and sort by volume
      const usersList = Object.entries(usersMap)
        .filter(([, { role }]) => role === "user")
        .map(([userId, { name, volume }]) => ({
          userId,
          name,
          volume,
        }))
        .sort((a, b) => b.volume - a.volume);

      setUsersData(usersList);
    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getStartDate]);

  // Fetch data when time period changes
  useEffect(() => {
    fetchBinsData();
    fetchUsersData();
  }, [fetchBinsData, fetchUsersData, timePeriod]);

  // Handle time period selection
  const handleSelectTimePeriod = (value: string) => {
    setTimePeriod(value);
    setIsDropdownOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.contentContainer}
      >
        {/* Time Period Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Time Period:</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setIsDropdownOpen(true)}
          >
            <Text style={styles.dropdownText}>{getTimePeriodLabel()}</Text>
            <Icon name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Bin Volume</Text>
          <Switch
            value={showBinVolume}
            onValueChange={(value) => setShowBinVolume(value)}
            trackColor={{ false: colors.secondary, true: colors.primary }}
            thumbColor={colors.white}
          />
          <Text style={styles.toggleText}>User Trends</Text>
        </View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <>
            {/* Conditional Rendering Based on Toggle */}
            {showBinVolume ? (
              // Bin Volume Section
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Volume by Bin ({getTimePeriodLabel()})
                </Text>
                {binsData.length > 0 ? (
                  binsData.map(({ bin, volume }) => (
                    <View key={bin} style={styles.item}>
                      <Text style={styles.itemText}>{bin}</Text>
                      <Text style={styles.itemText}>{volume.toFixed(2)} liters</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No data available for this time period</Text>
                )}
              </View>
            ) : (
              // User Trends Section
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Leaderboard ({getTimePeriodLabel()})
                </Text>
                {usersData.length > 0 ? (
                  usersData.map(({ userId, name, volume }, index) => (
                    <View key={userId} style={styles.item}>
                      <Text style={styles.itemText}>
                        {index + 1}. {name}
                      </Text>
                      <Text style={styles.itemText}>{volume.toFixed(2)} liters</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No data available for this time period</Text>
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
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Period</Text>
              <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodOption,
                  timePeriod === period.value && styles.selectedPeriod
                ]}
                onPress={() => handleSelectTimePeriod(period.value)}
              >
                <Text 
                  style={[
                    styles.periodText,
                    timePeriod === period.value && styles.selectedPeriodText
                  ]}
                >
                  {period.label}
                </Text>
                {timePeriod === period.value && (
                  <Icon name="check" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <AdminBottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: "bold",
  },
  dropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    ...globalStyles.shadow,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.secondary,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 16,
    color: colors.primary,
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    ...globalStyles.shadow,
  },
  itemText: {
    fontSize: 16,
    color: colors.secondary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.tertiary,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.secondary,
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
    borderRadius: 12,
    overflow: "hidden",
    ...globalStyles.shadow,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  periodOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
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
});

export default Analytics;