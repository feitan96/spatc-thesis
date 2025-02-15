import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { router } from "expo-router";
import uuid from 'react-native-uuid';
import Toast from "react-native-toast-message";
import { globalStyles, colors } from '../../src/styles/styles';

const CredentialsScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email ?? "");
    }
  }, []);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !contactNumber || !address) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    try {
      const userId = uuid.v4();
      const docRef = await addDoc(collection(db, "users"), {
        userId,
        email,
        firstName,
        lastName,
        role: "user",
        contactNumber,
        address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDeleted: false,
      });
      Alert.alert("Credentials Saved Successfully!");
      Toast.show({
            type: 'success',
            text1: 'Account Creation Successful!',
            text2: 'Navigating to Homescreen...',
        });
      router.replace("/user/UserHome");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Enter Your Credentials</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="First Name"
        placeholderTextColor={colors.tertiary}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Last Name"
        placeholderTextColor={colors.tertiary}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Contact Number"
        placeholderTextColor={colors.tertiary}
        value={contactNumber}
        onChangeText={setContactNumber}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Address"
        placeholderTextColor={colors.tertiary}
        value={address}
        onChangeText={setAddress}
      />
      <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
        <Text style={globalStyles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CredentialsScreen;