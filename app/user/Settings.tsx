import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomBar from "../components/BottomBar";
import { colors, globalStyles } from "../../src/styles/styles";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const SettingsScreen = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as typeof userData);
        } else {
          console.error("User document does not exist.");
        }
      }
    };

    fetchUserData();
  }, []);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    const { firstName, lastName, contactNumber, address } = userData;

    // Validate fields
    if (!firstName || !lastName || !contactNumber || !address) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          contactNumber,
          address,
          updatedAt: new Date(),
        });

        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your changes have been saved successfully.",
        });

        setIsEditing(false); // Exit edit mode
      }
    } catch (error) {
      console.error("Error updating user data: ", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "An error occurred while saving your changes.",
      });
    }
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
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Display user data */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
            />
          ) : (
            <Text style={styles.value}>{userData.firstName}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
            />
          ) : (
            <Text style={styles.value}>{userData.lastName}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Contact Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.contactNumber}
              onChangeText={(value) => handleInputChange("contactNumber", value)}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{userData.contactNumber}</Text>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={userData.address}
              onChangeText={(value) => handleInputChange("address", value)}
            />
          ) : (
            <Text style={styles.value}>{userData.address}</Text>
          )}
        </View>

        {/* Edit/Save Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
        >
          <FontAwesome
            name={isEditing ? "save" : "edit"}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.editButtonText}>
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome
            name="sign-out"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <BottomBar />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.tertiary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: colors.primary,
  },
  input: {
    fontSize: 18,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    ...globalStyles.shadow,
  },
  editButtonText: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    ...globalStyles.shadow,
  },
  logoutButtonText: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 8,
  },
});

export default SettingsScreen;