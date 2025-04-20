"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth, db } from "../../firebaseConfig"
import { doc, getDoc } from "firebase/firestore"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner"
import { useAuth } from "../../src/auth/AuthContext"
import AuthLayout from "../components/auth/AuthLayout"
import FormInput from "../components/auth/FormInput"
import FormButton from "../components/auth/FormButton"
import { Mail, Lock } from "lucide-react-native"

const LoginScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isResetLoading, setIsResetLoading] = useState(false)

  const { setUserRole, setFirstName, setLastName } = useAuth()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    let isValid = true

    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userId = userCredential.user.uid

      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userRole = userDoc.data().role
        const firstName = userDoc.data().firstName
        const lastName = userDoc.data().lastName

        setUserRole(userRole)
        setFirstName(firstName)
        setLastName(lastName)

        if (userRole === "admin") {
          router.replace("/admin/Dashboard")
        } else if (userRole === "user") {
          Toast.show({
            type: "success",
            text1: "Login Successful!",
            text2: `Welcome back, ${firstName}!`,
          })
          router.replace("/shared/BinList")
        } else {
          Alert.alert("Error", "Unknown user role.")
        }
      } else {
        Alert.alert("Error", "User document not found.")
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid email or password",
      })
      setErrors({
        password: "Invalid email or password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setErrors({
        email: "Please enter your email address",
      })
      return
    }

    setIsResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      Toast.show({
        type: "success",
        text1: "Password Reset Email Sent",
        text2: "Check your email to reset your password.",
      })
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Password Reset Failed",
        text2: (error as Error).message,
      })
    } finally {
      setIsResetLoading(false)
    }
  }

  if (isLoading && !isResetLoading) {
    return <Spinner />
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
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
        placeholder="Enter your password"
        secureTextEntry
        icon={<Lock size={20} color={colors.secondary} />}
        error={errors.password}
      />

      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handlePasswordReset} disabled={isResetLoading}>
        <Text style={styles.forgotPasswordText}>{isResetLoading ? "Sending reset email..." : "Forgot password?"}</Text>
      </TouchableOpacity>

      <FormButton title="Sign In" onPress={handleLogin} isLoading={isLoading} />

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/auth/Register")}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  )
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: colors.secondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default LoginScreen

