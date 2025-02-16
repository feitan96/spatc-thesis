import React, { useEffect, useState, useRef } from "react";
import NotificationModal from "../modals/NotificationModal";
import BottomBar from "../components/UserBottomBar";
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { database, db } from "../../firebaseConfig";
import { useLocalSearchParams  } from "expo-router";
import axios from "axios";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { format, set } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner";

const UserHomeScreen = () => {
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

  const mapRef = useRef<MapView>(null);

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

  interface TideData {
    currentTide: number;
    nextHighTide: string;
    nextLowTide: string;
  }

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tideData, setTideData] = useState<TideData | null>(null);

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

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setHasNewNotifications(false); // Mark notifications as read
  };

  const handleFocus = () => {
    if (mapRef.current && binData.gps.latitude && binData.gps.longitude) {
      mapRef.current.animateToRegion({
        latitude: binData.gps.latitude,
        longitude: binData.gps.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{binName}</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={handleOpenModal} style={styles.notificationBell}>
              <FontAwesome name="bell" size={24} color={colors.primary} />
              {hasNewNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.dataText}>Distance: {binData.distance} cm</Text>
          <Text style={styles.dataText}>Validated Trash Level: {validatedTrashLevel}%</Text>
          <Text style={styles.dataText}>Altitude: {binData.gps.altitude}</Text>
          <Text style={styles.dataText}>Latitude: {binData.gps.latitude}</Text>
          <Text style={styles.dataText}>Longitude: {binData.gps.longitude}</Text>

          {/* {isValidating && <Text style={styles.validationText}>Validating trash level...</Text>} */}
        </View>

        {weather && (
          <View style={styles.weatherSection}>
            <Text style={styles.sectionTitle}>Weather Information</Text>
            <Text style={styles.dataText}>Weather: {weather.weather[0].description}</Text>
            <Text style={styles.dataText}>Temperature: {weather.main.temp}°C</Text>
            <Text style={styles.dataText}>Humidity: {weather.main.humidity}%</Text>
            <Text style={styles.dataText}>Wind Speed: {weather.wind.speed} m/s</Text>
          </View>
        )}

        {binData.gps.latitude && binData.gps.longitude && (
          <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Bin Location</Text>
            <TouchableOpacity onPress={handleFocus} style={styles.focusIcon}>
              <FontAwesome name="crosshairs" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: binData.gps.latitude,
              longitude: binData.gps.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: binData.gps.latitude,
                longitude: binData.gps.longitude,
              }}
              title={`${binName || "Unknown"}`}
              description="Real-time location"
            />
          </MapView>
        </View>
        )}

        <NotificationModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          notifications={notifications}
        />
      </ScrollView>
      <BottomBar />
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  dataSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  weatherSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  mapSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  validationText: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
  notificationBell: {
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  logoutButton: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    padding: 8,
    marginRight: 8,
  },
  focusIcon: {
    padding: 8,
  },
})

export default UserHomeScreen