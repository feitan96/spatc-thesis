"use client"

import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, StatusBar, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database, db } from "../../firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { collection, addDoc, getDocs, serverTimestamp, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { colors } from "../../src/styles/styles";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import BinDataSection from "../components/BinDataSection";
import WeatherSection from "../components/WeatherSection";
import MapSection from "../components/MapSection";
import NotificationModal from "../modals/NotificationModal";
import { useAuth } from "../../src/auth/AuthContext";
import TrashLevelChart from "../components/TrashLevelChart";
import FloatingTrashBubble from "../components/FloatingTrashBubble";
import BinAssignee from '../components/BinAssignee';

interface Notification {
  trashLevel: number;
  datetime: any;
  bin: string;
  id: string;
  isRead: boolean;
  recipients: {
    userId: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    role: string;
  }[];
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

interface WeatherData {
  weather: { description: string; icon: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number };
}

interface TideData {
  currentTide: number;
  nextHighTide: string;
  nextLowTide: string;
}

const BinDetails = () => {
  const { binName } = useLocalSearchParams<{ binName: string }>();
  const [isValidating, setIsValidating] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<string | null>(null);
  
  const API_KEY = "d1b379e89fe87076140d9462009828b2";
  //const WORLD_TIDES_API_KEY = "490af8cc-8cb4-4c81-a717-be6b6c718762";

  const [binData, setBinData] = useState({
    distance: null,
    gps: {
      altitude: null,
      latitude: null,
      longitude: null,
    },
    trashLevel: null, // Add trashLevel to the state
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tideData, setTideData] = useState<TideData | null>(null);

  const { userRole, userId } = useAuth();

  // Fetch bin data
  useEffect(() => {
    if (binName) {
      const binRef = ref(database, binName);
      const unsubscribe = onValue(binRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newDistance = data["distance(cm)"];
          const newTrashLevel = data["trashLevel"]; // Fetch trashLevel directly
          setBinData({
            distance: newDistance,
            gps: data.gps,
            trashLevel: newTrashLevel, // Set trashLevel
          });

          if (newDistance <= 100) {
            setIsValidating(true);
          } else {
            setIsValidating(false);
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [binName]);

  // Fetch notifications with real-time updates
  useEffect(() => {
    if (!binName || !userId) return;

    const notificationsRef = collection(db, "newNotifications");
    const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
      const fetchedNotifications = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            trashLevel: data.trashLevel,
            datetime: data.datetime,
            bin: data.bin,
            isRead: data.isRead || false,
            gps: data.gps || null,
            recipients: data.recipients || []
          };
        })
        .filter((notification) => 
          notification.bin === binName && 
          notification.recipients.some((recipient: { userId: string; }) => recipient.userId === userId)
        );

      fetchedNotifications.sort((a, b) => {
        const dateA = a.datetime?.toDate?.() || new Date(0);
        const dateB = b.datetime?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setNotifications(fetchedNotifications);

      // Check for notifications that don't have isRead: true
      const hasUnread = fetchedNotifications.some(
        (notification) => notification.isRead !== true
      );
      setHasNewNotifications(hasUnread);
    });

    return () => unsubscribe();
  }, [binName]);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (binData.gps.latitude && binData.gps.longitude) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&appid=${API_KEY}&units=metric`
          );
          setWeather(response.data);
        } catch (error) {
          console.error("Error fetching weather data: ", error);
        }
      }
    };

    fetchWeather();
  }, [binData.gps.latitude, binData.gps.longitude]);

  // Post trash level to Firestore
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const postTrashLevel = async () => {
      try {
        const lastPostKey = `lastPost_${binName}`;
        const lastPostTimestamp = await AsyncStorage.getItem(lastPostKey);
        const currentTime = new Date().getTime();

        if (lastPostTimestamp && currentTime - Number(lastPostTimestamp) < 1 * 60 * 1000) {
          return;
        }

        await addDoc(collection(db, "trashLevels"), {
          bin: binName,
          trashLevel: binData.trashLevel, // Use binData.trashLevel
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await AsyncStorage.setItem(lastPostKey, currentTime.toString());
      } catch (error) {
        console.error("Error posting trash level: ", error);
      }
    };

    if (binName && binData.trashLevel !== null) {
      timeoutId = setTimeout(() => {
        postTrashLevel();
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [binName, binData.trashLevel]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);

    // Fetch weather data
    if (binData.gps.latitude && binData.gps.longitude) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&appid=${API_KEY}&units=metric`
        );
        setWeather(response.data);
      } catch (error) {
        console.error("Error fetching weather data: ", error);
      }
    }

    // Fetch notifications
    try {
      const querySnapshot = await getDocs(collection(db, "newNotifications"));
      const fetchedNotifications = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            trashLevel: data.trashLevel,
            datetime: data.datetime,
            bin: data.bin,
            isRead: data.isRead || false,
            gps: data.gps || null,
          };
        })
        .filter((notification) => notification.bin === binName);

      fetchedNotifications.sort((a, b) => {
        const dateA = a.datetime?.toDate?.() || new Date(0);
        const dateB = b.datetime?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setNotifications(fetchedNotifications);

      // Check for notifications that don't have isRead: true
      const hasUnread = fetchedNotifications.some(
        (notification) => notification.isRead !== true
      );
      setHasNewNotifications(hasUnread);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    }

    setRefreshing(false);
  };

  // Handle modal open/close
  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = async () => {
    // Mark all notifications as read when closing
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const updatePromises = unreadNotifications.map(notification =>
      updateDoc(doc(db, "newNotifications", notification.id), { isRead: true })
    );
    
    try {
      await Promise.all(updatePromises);
      setHasNewNotifications(false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
    
    setIsModalVisible(false);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title={binName || "Unknown"}
        onNotificationPress={handleModalOpen}
        hasNewNotifications={hasNewNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <BinDataSection
          distance={binData.distance}
          gps={binData.gps}
          trashLevel={binData.trashLevel ?? 0}
        />

        <WeatherSection weather={weather} tideData={tideData} />

        <TrashLevelChart binName={binName} />

        <MapSection latitude={binData.gps.latitude} longitude={binData.gps.longitude} binName={binName || "Unknown"} />

        {/* <BinAssignee binName={binName} /> */}
      </ScrollView>

      <FloatingTrashBubble binName={binName} />

      <NotificationModal
        visible={isModalVisible}
        onClose={handleModalClose}
        notifications={notifications}
        userId={userId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
});

export default BinDetails;