"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../firebaseConfig"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner"
import AuthLayout from "../components/auth/AuthLayout"
import FormInput from "../components/auth/FormInput"
import FormButton from "../components/auth/FormButton"
import { Mail, Lock, AlertCircle } from "lucide-react-native"

const RegisterScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}
    let isValid = true

    // Validate email
    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Check if email already exists
      const q = query(collection(db, "users"), where("email", "==", email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        Toast.show({
          type: "info",
          text1: "Account already exists",
          text2: "Navigating to Login...",
        })
        router.replace("/auth/Login")
        return
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: "Please complete your profile",
      })
      router.replace("/auth/Credentials")
    } catch (error) {
      const errorMessage = (error as Error).message
      if (errorMessage.includes("email-already-in-use")) {
        setErrors({
          email: "Email already in use",
        })
      } else {
        setErrors({
          email: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to get started with our service" showBackButton>
      <FormInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text)
          if (errors.email) setErrors({ ...errors, email: undefined })
        }}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        icon={<Mail size={20} color={colors.secondary} />}
        error={errors.email}
      />

      <FormInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text)
          if (errors.password) setErrors({ ...errors, password: undefined })
        }}
        placeholder="Create a password"
        secureTextEntry
        icon={<Lock size={20} color={colors.secondary} />}
        error={errors.password}
      />

      <FormInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text)
          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
        }}
        placeholder="Confirm your password"
        secureTextEntry
        icon={<Lock size={20} color={colors.secondary} />}
        error={errors.confirmPassword}
      />

      <View style={styles.passwordRequirements}>
        <View style={styles.requirementRow}>
          <AlertCircle size={16} color={password.length >= 6 ? colors.success : colors.tertiary} />
          <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
            At least 6 characters
          </Text>
        </View>
      </View>

      <FormButton title="Create Account" onPress={handleRegister} isLoading={isLoading} />

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/auth/Login")}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  passwordRequirements: {
    marginBottom: 16,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: colors.tertiary,
    marginLeft: 8,
  },
  requirementMet: {
    color: colors.success,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: colors.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default RegisterScreen

