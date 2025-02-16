"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import BottomBar from "../components/BottomBar"
import { colors, globalStyles } from "../../src/styles/styles"
import { auth, db } from "../../firebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import Spinner from "../components/Spinner"

const SettingsScreen = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    const { firstName, lastName, contactNumber, address } = userData

    if (!firstName || !lastName || !contactNumber || !address) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "All fields are required.",
      })
      return
    }

    setIsLoading(true)
    try {
      const userId = auth.currentUser?.uid
      if (userId) {
        const userDocRef = doc(db, "users", userId)
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          contactNumber,
          address,
          updatedAt: new Date(),
        })

        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your changes have been saved successfully.",
        })

        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating user data: ", error)
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "An error occurred while saving your changes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.replace("/auth/Login")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  const renderField = (label: string, value: string, field: string) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      {isEditing && field !== "email" ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          keyboardType={field === "contactNumber" ? "phone-pad" : "default"}
        />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  )

  
  if (isLoading) {
    return <Spinner />
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>

        {renderField("First Name", userData.firstName, "firstName")}
        {renderField("Last Name", userData.lastName, "lastName")}
        {renderField("Email", userData.email, "email")}
        {renderField("Contact Number", userData.contactNumber, "contactNumber")}
        {renderField("Address", userData.address, "address")}

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
        >
          <FontAwesome name={isEditing ? "save" : "edit"} size={24} color={colors.white} />
          <Text style={styles.buttonText}>{isEditing ? "Save Changes" : "Edit Profile"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={24} color={colors.white} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomBar />
      <Toast />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    ...globalStyles.shadow,
  },
  label: {
    fontSize: 14,
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
    borderBottomColor: colors.tertiary,
    paddingVertical: 4,
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
  editButton: {
    backgroundColor: colors.secondary,
  },
  logoutButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    marginLeft: 8,
  },
})

export default SettingsScreen

