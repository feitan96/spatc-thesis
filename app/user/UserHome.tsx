import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";

const UserHomeScreen = () => {
  const [binData, setBinData] = useState({
    distance: null, // Distance in cm
    gps: {
      altitude: null,
      latitude: null,
      longitude: null,
    },
  });

  const [trashLevel, setTrashLevel] = useState(0); // Trash level percentage
  const [validatedTrashLevel, setValidatedTrashLevel] = useState(0); // Validated trash level percentage
  const [isValidating, setIsValidating] = useState(false); // Validation state

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
      <Text style={styles.dataText}>Trash Level: {trashLevel}%</Text>
      <Text style={styles.dataText}>Validated Trash Level: {validatedTrashLevel}%</Text>
      <Text style={styles.dataText}>Altitude: {binData.gps.altitude}</Text>
      <Text style={styles.dataText}>Latitude: {binData.gps.latitude}</Text>
      <Text style={styles.dataText}>Longitude: {binData.gps.longitude}</Text>

      {isValidating && (
        <Text style={styles.validationText}>Validating trash level...</Text>
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
});

export default UserHomeScreen;