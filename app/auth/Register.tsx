import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { globalStyles, colors } from '../../src/styles/styles';

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // Check if email already exists
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Toast.show({
          type: 'info',
          text1: 'Account already exists',
          text2: 'Navigating to Login...',
        });
        router.replace("/auth/Login");
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Redirect to Credentials screen
      Toast.show({
        type: 'info',
        text1: 'New Account',
        text2: 'Please fill in all credential fields',
      });
      router.replace("/auth/Credentials");
    } catch (error) {
      Alert.alert("Registration Failed", (error as Error).message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Register</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        placeholderTextColor={colors.tertiary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        placeholderTextColor={colors.tertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/auth/Login")}>
        <Text style={globalStyles.linkText}>
          Already have an account? <Text style={globalStyles.link}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;