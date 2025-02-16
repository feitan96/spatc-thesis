// /app/user/BinList.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { router } from "expo-router";
import { colors } from "../../src/styles/styles";
import BottomBar from "../components/UserBottomBar"
import Spinner from "../components/Spinner";

const BinList = () => {
  const [bins, setBins] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const binsRef = ref(database);

    setIsLoading(true);
    try {
      const unsubscribe = onValue(binsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const binNames = Object.keys(data);
          setBins(binNames);
        }
    });
    return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching bins: ", error);
    } finally {
      setIsLoading(false);
    }

  }, []);

  const handleBinPress = (binName: string) => {
    router.push({ pathname: "/user/UserHome", params: { binName } });
  };

  if (isLoading) {
    return <Spinner />
  }
  return (
    <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Select a Bin</Text>
            </View>
        {bins.map((bin) => (
            <TouchableOpacity key={bin} style={styles.binItem} onPress={() => handleBinPress(bin)}>
            <Text style={styles.binText}>{bin}</Text>
            </TouchableOpacity>
        ))}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
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
  icon: {
    padding: 8,
    marginRight: 8,
  },
});

export default BinList;