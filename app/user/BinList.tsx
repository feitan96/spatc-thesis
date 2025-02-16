// /app/user/BinList.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { router } from "expo-router";
import { colors } from "../../src/styles/styles";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { FontAwesome } from '@expo/vector-icons';

const BinList = () => {
  const [bins, setBins] = useState<string[]>([]);

  useEffect(() => {
    const binsRef = ref(database);

    // Fetch all bins from the database
    const unsubscribe = onValue(binsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const binNames = Object.keys(data);
        setBins(binNames);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBinPress = (binName: string) => {
    // Navigate to UserHome with the selected bin name
    router.push({ pathname: "/user/UserHome", params: { binName } });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Select a Bin</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.icon}>
            <FontAwesome name="sign-out" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      {bins.map((bin) => (
        <TouchableOpacity key={bin} style={styles.binItem} onPress={() => handleBinPress(bin)}>
          <Text style={styles.binText}>{bin}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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