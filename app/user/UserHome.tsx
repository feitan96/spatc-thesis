import React, { useEffect, useState } from "react";
import { Button, View, StyleSheet, TouchableOpacity} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";

export const UserHome = () => {
    const [binData, setBinData] = useState({
        distance: null,
        gps: {
          altitude: null,
          latitude: null,
          longitude: null,
        },
      });
    
      useEffect(() => {
        // Reference to the "bin" node in your Realtime Database
        const binRef = ref(database, "bin");
    
        // Listen for changes in the "bin" node
        const unsubscribe = onValue(binRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setBinData({
              distance: data["distance(cm)"], // Access the "distance(cm)" node
              gps: data.gps, // Access the "gps" node
            });
          }
        });
    
        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
      }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({
              type: 'info',
              text1: 'Logged out',
            });
      router.replace('/auth/Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    
    <View style={styles.container}>
        <View style={styles.container}>
      <TouchableOpacity style={styles.title}>Bin Data</TouchableOpacity>
      <TouchableOpacity style={styles.dataText}>Distance: {binData.distance} cm</TouchableOpacity>
      <TouchableOpacity style={styles.dataText}>Altitude: {binData.gps.altitude}</TouchableOpacity>
      <TouchableOpacity style={styles.dataText}>Latitude: {binData.gps.latitude}</TouchableOpacity>
      <TouchableOpacity style={styles.dataText}>Longitude: {binData.gps.longitude}</TouchableOpacity>
    </View>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default UserHome;