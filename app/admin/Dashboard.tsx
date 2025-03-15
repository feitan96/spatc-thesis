import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { format } from "date-fns";
import AdminBottomBar from "../components/AdminBottomBar";
import UserBottomBar from "../components/UserBottomBar";
import { useAuth } from "@/src/auth/AuthContext";

interface TrashEmptyingHistory {
  bin: string;
  collector: string;
  volume: number;
  emptiedAt: Date;
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [history, setHistory] = useState<TrashEmptyingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { userRole } = useAuth()
  

  // Fetch trash emptying history for the selected date
  const fetchHistory = async (date: Date) => {
    setIsLoading(true);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "trashEmptying"),
        where("emptiedAt", ">=", startOfDay),
        where("emptiedAt", "<=", endOfDay),
        orderBy("emptiedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const fetchedHistory: TrashEmptyingHistory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedHistory.push({
          bin: data.bin,
          collector: data.collector,
          volume: data.volume,
          emptiedAt: data.emptiedAt.toDate(), // Convert Firestore timestamp to Date
        });
      });

      setHistory(fetchedHistory);
    } catch (error) {
      console.error("Error fetching history: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch history when the selected date changes
  useEffect(() => {
    fetchHistory(selectedDate);
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trash Emptying History</Text>

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>
          {format(selectedDate, "MMMM d, yyyy")}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* History List */}
      <ScrollView style={styles.historyList}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : history.length === 0 ? (
          <Text style={styles.noHistoryText}>No history found for this date.</Text>
        ) : (
          history.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.binName}>{item.bin}</Text>
              <Text style={styles.collector}>Collected by: {item.collector}</Text>
              <Text style={styles.volume}>Volume: {item.volume.toFixed(2)} L</Text>
              <Text style={styles.emptiedAt}>
                Time: {format(item.emptiedAt, "h:mm a")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {userRole === "admin" ? <AdminBottomBar /> : <UserBottomBar />}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  datePickerButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  binName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  collector: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  volume: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  emptiedAt: {
    fontSize: 14,
    color: "#666",
  },
  noHistoryText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Dashboard;