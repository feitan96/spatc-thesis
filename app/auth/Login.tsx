// app/auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';

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
        router.replace("/user/UserHome"); // Navigate to user home
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => router.push("/auth/Register")}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.link}>Register</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  linkText: {
    textAlign: "center",
    color: "#000",
  },
  link: {
    color: "#1E90FF",
  },
});

export default LoginScreen;