// app/auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { globalStyles, colors } from '../../src/styles/styles';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      if (userId === "adminUserId") {
        router.replace("/admin/AdminHome"); // Navigate to admin home
      } else {
        Toast.show({
                  type: 'success',
                  text1: 'User Login Successful!',
                  text2: 'Navigating to Homescreen...',
          });
        router.replace("/user/BinList"); // Navigate to user home
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'User Login Failed',
        text2: 'Try again',
      });
      Alert.alert("Login Failed", (error as Error).message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Login</Text>
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
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/auth/Register")}>
        <Text style={globalStyles.linkText}>
          Don't have an account? <Text style={globalStyles.link}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;