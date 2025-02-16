import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { database, db } from "../../firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { format, toZonedTime } from "date-fns-tz";
import { colors } from "../../src/styles/styles";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import BinDataSection from "../components/BinDataSection";
import WeatherSection from "../components/WeatherSection";
import MapSection from "../components/MapSection";
import NotificationModal from "../modals/NotificationModal";
import BottomBar from "../components/UserBottomBar";

const BinData = () => {
  const { binName } = useLocalSearchParams<{ binName: string }>();
  const [trashLevel, setTrashLevel] = useState(0);
  const [validatedTrashLevel, setValidatedTrashLevel] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const API_KEY = "d1b379e89fe87076140d9462009828b2";
  const WORLD_TIDES_API_KEY = "2f783ec9-ed24-4340-b503-7208bcd9b282";
  
  const [binData, setBinData] = useState({
    distance: null,
    gps: {
      altitude: null,
      latitude: null,
      longitude: null,
    },
  });

  interface Notification {
    trashLevel: number;
    datetime: string;
    bin: string;
  }

  interface WeatherData {
    weather: { description: string }[];
    main: { temp: number; humidity: number };
    wind: { speed: number };
  }

  // interface TideData {
  //   currentTide: number;
  //   nextHighTide: string;
  //   nextLowTide: string;
  // }

  const [weather, setWeather] = useState<WeatherData | null>(null);

  // const [tideData, setTideData] = useState<TideData | null>(null);

  // bin data
  useEffect(() => {
    if (binName) {
      const binRef = ref(database, binName);

      // Listen for changes in the selected bin node
      const unsubscribe = onValue(binRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newDistance = data["distance(cm)"];

          // Update the bin data
          setBinData({
            distance: newDistance,
            gps: data.gps,
          });

          // Start validation if the distance is within 100cm (full)
          if (newDistance <= 100) { // Adjust threshold if needed
            setIsValidating(true);
          } else {
            setIsValidating(false);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [binName]);

  // Calculate trash level percentage
  useEffect(() => {
    // Calculate trash level percentage
    const calculateTrashLevel = (distance: number): number => {
      const maxDistance = 100; // 100cm = 0% (empty)
      const minDistance = 2; // 0cm = 100% (full)

      if (distance >= maxDistance) return 0; // Bin is empty
      if (distance <= minDistance) return 100; // Bin is full

      // Linear interpolation to calculate percentage
      return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100);
    };

    if (binData.distance !== null) {
      const level = calculateTrashLevel(binData.distance);
      setTrashLevel(level);
    }
  }, [binData.distance]);

  // Validate trash level and add notification
  useEffect(() => {
    if (isValidating) {
      const timer = setTimeout(async () => {
        if (binData.distance !== null && binData.distance <= 100) {
          setValidatedTrashLevel(trashLevel);
  
          if ([90, 95, 100].includes(trashLevel)) {
            const now = new Date();
            const timeZone = 'Asia/Manila';
            const zonedDate = toZonedTime(now, timeZone);
            const formattedDatetime = format(zonedDate, 'yyyy-MM-dd hh:mm:ss aa');
  
            const notification = { trashLevel, datetime: formattedDatetime, bin: binName };
            
            setIsLoading(true)
            try {
              await addDoc(collection(db, "notifications"), {
                notificationId: `${formattedDatetime}-${trashLevel}`,
                trashLevel,
                datetime: formattedDatetime,
                bin: binName,
              });
              setHasNewNotifications(true);
              setNotifications((prev) => [...prev, notification]);
            } catch (error) {
              console.error("Error adding notification: ", error);
            } finally {
              setIsLoading(false);
            }
          }
        }
        setIsValidating(false);
      }, 1000);
  
      return () => clearTimeout(timer);
    }
  }, [isValidating, binData.distance, trashLevel]);

  //fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {

      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "notifications"));
        const fetchedNotifications = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              trashLevel: data.trashLevel,
              datetime: data.datetime,
              bin: data.bin, // Include the bin field
            };
          })
          .filter((notification) => notification.bin === binName); // Filter by binName
  
        // Sort notifications by datetime in descending order
        fetchedNotifications.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications: ", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (binName) {
      fetchNotifications(); 
    }
  }, [binName]); 

  //weather
  useEffect(() => {
    const fetchWeather = async () => {
      if (binData.gps.latitude && binData.gps.longitude) {

        setIsLoading(true);
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&appid=${API_KEY}&units=metric`
          );
          setWeather(response.data);
        } catch (error) {
          console.error("Error fetching weather data: ", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchWeather();
  }, [binData.gps.latitude, binData.gps.longitude]);

  //fetch tide data
  // useEffect(() => {
  //   const fetchTideData = async () => {
  //     if (binData.gps.latitude && binData.gps.longitude) {
  //       try {
  //         const url = `https://www.worldtides.info/api/v2?heights&lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&key=${WORLD_TIDES_API_KEY}`;
  //         console.log("Fetching tide data from URL: ", url);
  //         const response = await axios.get(url);
  //         const tides = response.data.heights;
  //         const currentTide = tides[0]?.height;
  //         const nextHighTide = tides.find((tide: any) => tide.type === "high")?.dt;
  //         const nextLowTide = tides.find((tide: any) => tide.type === "low")?.dt;
  
  //         setTideData({
  //           currentTide,
  //           nextHighTide: nextHighTide ? new Date(nextHighTide * 1000).toLocaleTimeString() : "N/A",
  //           nextLowTide: nextLowTide ? new Date(nextLowTide * 1000).toLocaleTimeString() : "N/A",
  //         });
  //       } catch (error) {
  //         console.error("Error fetching tide data: ", error);
  //       }
  //     }
  //   };
  
  //   fetchTideData();
  // }, [binData.gps.latitude, binData.gps.longitude]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Header
          title={binName || "Unknown"}
          onNotificationPress={() => setIsModalVisible(true)}
          hasNewNotifications={hasNewNotifications}
        />

        <BinDataSection
          distance={binData.distance}
          validatedTrashLevel={validatedTrashLevel}
          gps={binData.gps}
        />

        <WeatherSection weather={weather} />

        <MapSection
          latitude={binData.gps.latitude}
          longitude={binData.gps.longitude}
          binName={binName || "Unknown"}
        />

        <NotificationModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          notifications={notifications}
        />
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
});

export default BinData;