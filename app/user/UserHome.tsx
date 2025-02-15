import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import axios from "axios";

const UserHomeScreen = () => {
  const [binData, setBinData] = useState({
    distance: null,
    gps: {
      altitude: null,
      latitude: null,
      longitude: null,
    },
  });

  const [trashLevel, setTrashLevel] = useState(0);
  const [validatedTrashLevel, setValidatedTrashLevel] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const API_KEY = "d1b379e89fe87076140d9462009828b2";
  const WORLD_TIDES_API_KEY = "2f783ec9-ed24-4340-b503-7208bcd9b282";

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

  const [weather, setWeather] = useState<WeatherData | null>(null); // Weather data
  const [tideData, setTideData] = useState<TideData | null>(null); // Tide data

  useEffect(() => {
    const binRef = ref(database, "bin");

    // Listen for changes in the "bin" node
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
  }, []);

  useEffect(() => {
    // Calculate trash level percentage
    const calculateTrashLevel = (distance: number): number => {
      const maxDistance = 100; // 100cm = 0% (empty)
      const minDistance = 0; // 0cm = 100% (full)

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
    // 10-second validation timer
    if (isValidating) {
      const timer = setTimeout(() => {
        // If the distance is still within 100cm after 10 seconds, consider it valid
        if (binData.distance !== null && binData.distance <= 100) { // Adjust threshold if needed
          setValidatedTrashLevel(trashLevel); // Set validated trash level
        }
        setIsValidating(false); // Stop validation
      }, 1000); // 1 sec validation

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [isValidating, binData.distance, trashLevel]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bin Data</Text>
      <Text style={styles.dataText}>Distance: {binData.distance} cm</Text>
      {/* <Text style={styles.dataText}>Trash Level: {trashLevel}%</Text> */}
      <Text style={styles.dataText}>Validated Trash Level: {validatedTrashLevel}%</Text>
      <Text style={styles.dataText}>Altitude: {binData.gps.altitude}</Text>
      <Text style={styles.dataText}>Latitude: {binData.gps.latitude}</Text>
      <Text style={styles.dataText}>Longitude: {binData.gps.longitude}</Text>

      {weather && (
        <View>
          <Text style={styles.weatherText}>Weather: {weather.weather[0].description}</Text>
          <Text style={styles.weatherText}>Temperature: {weather.main.temp}°C</Text>
          <Text style={styles.dataText}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.dataText}>Wind Speed: {weather.wind.speed} m/s</Text>
        </View>
      )}

      {/* {tideData && (
        <View>
          <Text style={styles.tideText}>Current Tide: {tideData.currentTide} m</Text>
          <Text style={styles.tideText}>Next High Tide: {tideData.nextHighTide}</Text>
          <Text style={styles.tideText}>Next Low Tide: {tideData.nextLowTide}</Text>
        </View>
      )} */}

      {isValidating && (
        <Text style={styles.validationText}>Validating trash level...</Text>
      )}

      {/* Map View */}
      {binData.gps.latitude && binData.gps.longitude && (
        <MapView
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
            title="Bin Location"
            description="Real-time location of the bin"
          />
        </MapView>
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dataText: {
    fontSize: 18,
    marginBottom: 10,
  },
  validationText: {
    fontSize: 16,
    color: "orange",
    marginTop: 10,
  },
  weatherText: {
    fontSize: 18,
    marginTop: 10,
  },
  tideText: {
    fontSize: 18,
    marginTop: 10,
  },
  map: {
    width: "100%",
    height: 300,
    marginTop: 20,
  },
});

export default UserHomeScreen;