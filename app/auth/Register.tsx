import React, { useState } from "react";
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { globalStyles, colors } from '../../src/styles/styles';
import Spinner from "../components/Spinner";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage(""); // Clear previous error messages

    // Validate email
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

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

      Toast.show({
        type: 'info',
        text1: 'New Account',
        text2: 'Please fill in all credential fields',
      });
      router.replace("/auth/Credentials");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Register</Text>

      {/* Email Input */}
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        placeholderTextColor={colors.tertiary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        placeholderTextColor={colors.tertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Confirm Password Input */}
      <TextInput
        style={globalStyles.input}
        placeholder="Confirm Password"
        placeholderTextColor={colors.tertiary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Error Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* Register Button */}
      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => router.push("/auth/Login")}>
        <Text style={globalStyles.linkText}>
          Already have an account? <Text style={globalStyles.link}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
});

export default RegisterScreen;