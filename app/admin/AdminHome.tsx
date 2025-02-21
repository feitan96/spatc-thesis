import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { globalStyles, colors } from "../../src/styles/styles";
import { FontAwesome } from "@expo/vector-icons";
import { signOut } from "firebase/auth"
import { router } from "expo-router";
import { auth } from "@/firebaseConfig";

const AdminHome = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.replace("/auth/Login")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }
  
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Admin Dashboard</Text>
      <Text style={styles.text}>Welcome, Admin!</Text>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color={colors.white} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: colors.primary,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    ...globalStyles.shadow,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    marginLeft: 8,
  },
});

export default AdminHome;