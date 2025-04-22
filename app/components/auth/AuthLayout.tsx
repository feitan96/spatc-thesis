import type React from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native"
import { colors, shadows } from "../../../src/styles/styles"
import { ArrowLeft } from "lucide-react-native"
import { router } from "expo-router"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBackPress?: () => void
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, showBackButton = false, onBackPress }) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {showBackButton && (
              <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <ArrowLeft size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <Image 
                source={require("../../../assets/images/icon.png")} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.formContainer}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    ...shadows.small,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoImage: {
    width: 120, // Adjust as needed
    height: 120, // Adjust as needed
    ...shadows.medium,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.medium,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    maxWidth: "80%",
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    ...shadows.medium,
  },
})

export default AuthLayout

