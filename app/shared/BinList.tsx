import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { router } from "expo-router";
import { colors } from "../../src/styles/styles";
import Spinner from "../components/Spinner";
import FullScreenMap from "../components/FullScreenMap";
import { useAuth } from "../auth/AuthContext";
import AdminBottomBar from "../components/AdminBottomBar"
import UserBottomBar from "../components/UserBottomBar"

const BinManagement = () => {
  const [bins, setBins] = useState<string[]>([]);
  const [binData, setBinData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const { userRole } = useAuth();

  useEffect(() => {
    const binsRef = ref(database);

    setIsLoading(true);
    const unsubscribe = onValue(binsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const binNames = Object.keys(data);
        setBins(binNames);
        setBinData(data); // Store all bin data
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBinPress = (binName: string) => {
    router.push({ pathname: "/shared/BinDetails", params: { binName } });
  };

  const handleViewMap = () => {
    setIsMapVisible(true);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a Bin</Text>
          <TouchableOpacity onPress={handleViewMap} style={styles.viewMapButton}>
            <Text style={styles.viewMapButtonText}>View Map</Text>
          </TouchableOpacity>
        </View>
        {bins.map((bin) => (
          <TouchableOpacity key={bin} style={styles.binItem} onPress={() => handleBinPress(bin)}>
            <Text style={styles.binText}>{bin}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full-screen map modal */}
      <Modal visible={isMapVisible} transparent={true} animationType="slide">
        <FullScreenMap binData={binData} onClose={() => setIsMapVisible(false)} />
      </Modal>

      {userRole === "admin" ? <AdminBottomBar /> : <UserBottomBar />}
    </View>
  );
};

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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  binItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  binText: {
    fontSize: 16,
    color: colors.primary,
  },
  viewMapButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  viewMapButtonText: {
    color: colors.white,
    fontSize: 16,
  },
});

export default BinManagement;