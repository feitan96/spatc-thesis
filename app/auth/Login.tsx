// app/auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, TextInput, Alert, Text, TouchableOpacity } from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { globalStyles, colors } from '../../src/styles/styles';
import Spinner from "../components/Spinner";
import { useAuth } from "./AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setUserRole } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        
        setUserRole(userRole);

        if (userRole === "admin") {
          router.replace("/shared/BinList");
        } else if (userRole === "user") {
          Toast.show({
            type: 'success',
            text1: 'User Login Successful!',
            text2: 'Navigating to Homescreen...',
          });
          router.replace("/shared/BinList");
        } else {
          Alert.alert("Error", "Unknown user role.");
        }
      } else {
        Alert.alert("Error", "User document not found.");
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'User Login Failed',
        text2: 'Try again',
      });
      Alert.alert("Login Failed", (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: 'success',
        text1: 'Password Reset Email Sent',
        text2: 'Check your email to reset your password.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Password Reset Failed',
        text2: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

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
      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={globalStyles.linkText}>
          Forgot Password? <Text style={globalStyles.link}>Reset Password</Text>
        </Text>
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