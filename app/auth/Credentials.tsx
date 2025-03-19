"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../../firebaseConfig"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner"
import AuthLayout from "../components/auth/AuthLayout"
import FormInput from "../components/auth/FormInput"
import FormButton from "../components/auth/FormButton"
import AddressSelector from "../components/auth/AddressSelector"
import { User, Phone } from "lucide-react-native"

const CredentialsScreen = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    contactNumber?: string
    address?: string
  }>({})

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setEmail(user.email ?? "")
    } else {
      Alert.alert("Error", "No authenticated user found.")
      router.replace("/auth/Login")
    }
  }, [])

  const validateForm = () => {
    const newErrors: {
      firstName?: string
      lastName?: string
      contactNumber?: string
      address?: string
    } = {}
    let isValid = true

    if (!firstName) {
      newErrors.firstName = "First name is required"
      isValid = false
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required"
      isValid = false
    }

    if (!contactNumber) {
      newErrors.contactNumber = "Contact number is required"
      isValid = false
    }

    if (!address) {
      newErrors.address = "Address is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Error", "No authenticated user found.")
        return
      }

      const userId = user.uid

      // Format phone number: remove leading 0 and add +63 prefix
      let formattedPhoneNumber = contactNumber
      if (formattedPhoneNumber.startsWith("0")) {
        formattedPhoneNumber = "+63" + formattedPhoneNumber.substring(1)
      } else {
        formattedPhoneNumber = "+63" + formattedPhoneNumber
      }

      await setDoc(doc(db, "users", userId), {
        userId,
        email,
        firstName,
        lastName,
        role: "user",
        contactNumber: formattedPhoneNumber,
        address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isDeleted: false,
      })

      Toast.show({
        type: "success",
        text1: "Profile Completed",
        text2: "Your account has been created successfully!",
      })
      router.replace("/auth/Login")
    } catch (error) {
      Alert.alert("Error", (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <AuthLayout title="Complete Your Profile" subtitle="Please provide your personal information" showBackButton>
      <View style={styles.emailContainer}>
        <Text style={styles.emailLabel}>Your Email</Text>
        <Text style={styles.emailValue}>{email}</Text>
      </View>

      <FormInput
        label="First Name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text)
          if (errors.firstName) setErrors({ ...errors, firstName: undefined })
        }}
        placeholder="Enter your first name"
        icon={<User size={20} color={colors.secondary} />}
        error={errors.firstName}
        autoCapitalize="words"
      />

      <FormInput
        label="Last Name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text)
          if (errors.lastName) setErrors({ ...errors, lastName: undefined })
        }}
        placeholder="Enter your last name"
        icon={<User size={20} color={colors.secondary} />}
        error={errors.lastName}
        autoCapitalize="words"
      />

      <FormInput
        label="Contact Number"
        value={contactNumber}
        onChangeText={(text) => {
          // Only allow numeric input
          const numericText = text.replace(/[^0-9]/g, "")
          setContactNumber(numericText)
          if (errors.contactNumber) setErrors({ ...errors, contactNumber: undefined })
        }}
        placeholder="Enter your number (e.g., 09981508697)"
        icon={<Phone size={20} color={colors.secondary} />}
        error={errors.contactNumber}
        keyboardType="phone-pad"
      />
      <Text style={styles.helperText}>
        Enter your Philippine mobile number starting with 0 (e.g., 09XX).
      </Text>

      <AddressSelector
        onAddressChange={(address) => {
          setAddress(address)
          if (errors.address) setErrors({ ...errors, address: undefined })
        }}
        error={errors.address}
      />

      <FormButton title="Complete Registration" onPress={handleSubmit} isLoading={isLoading} />
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  emailContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  emailLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
})

export default CredentialsScreen

