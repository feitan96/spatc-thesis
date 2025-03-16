"use client"

import type React from "react"

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
  Alert,
} from "react-native"
import { useAuth } from "../../src/auth/AuthContext"
import EnhancedAdminBottomBar from "../components/AdminBottomBar"
import EnhancedUserBottomBar from "../components/UserBottomBar"
import { colors, shadows, spacing, borderRadius } from "../../src/styles/styles"
import { auth, db } from "../../firebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { router } from "expo-router"
import Toast from "react-native-toast-message"
import Spinner from "../components/Spinner"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  Info,
} from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

interface UserData {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  address: string
  role?: string
}

const SettingsScreen = () => {
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { userRole, firstName, lastName } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const userId = auth.currentUser?.uid
        if (userId) {
          const userDocRef = doc(db, "users", userId)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData)
          } else {
            console.error("User document does not exist.")
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth)
            router.replace("/auth/Login")
          } catch (error) {
            console.error("Error signing out: ", error)
            Toast.show({
              type: "error",
              text1: "Logout Failed",
              text2: "An error occurred while logging out.",
            })
          }
        },
        style: "destructive",
      },
    ])
  }

  const renderProfileField = (
    label: string,
    value: string,
    field: string,
    icon: React.ReactNode,
    keyboardType: "default" | "email-address" | "phone-pad" = "default",
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIconContainer}>{icon}</View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && field !== "email" ? (
          <TextInput
            style={styles.fieldInput}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            keyboardType={keyboardType}
            placeholderTextColor={colors.tertiary}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    </View>
  )

  const renderSettingItem = (
    title: string,
    icon: React.ReactNode,
    onPress: () => void,
    iconBgColor = `${colors.primary}15`,
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIconContainer, { backgroundColor: iconBgColor }]}>{icon}</View>
      <Text style={styles.settingTitle}>{title}</Text>
      <ChevronRight size={20} color={colors.tertiary} />
    </TouchableOpacity>
  )

  if (isLoading) {
    return <Spinner />
  }

  const initials = userData.firstName.charAt(0) + userData.lastName.charAt(0)

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header with profile summary */}
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <View style={styles.profileSummary}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {userData.firstName} {userData.lastName}
                  </Text>
                  <Text style={styles.profileRole}>{userData.role === "admin" ? "Administrator" : "User"}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
              >
                {isEditing ? <Save size={18} color={colors.primary} /> : <Edit2 size={18} color={colors.primary} />}
                <Text style={styles.editButtonText}>{isEditing ? "Save" : "Edit"}</Text>
              </TouchableOpacity>
            </View>

            {renderProfileField(
              "First Name",
              userData.firstName,
              "firstName",
              <User size={20} color={colors.primary} />,
            )}

            {renderProfileField("Last Name", userData.lastName, "lastName", <User size={20} color={colors.primary} />)}

            {renderProfileField(
              "Email",
              userData.email,
              "email",
              <Mail size={20} color={colors.primary} />,
              "email-address",
            )}

            {renderProfileField(
              "Contact Number",
              userData.contactNumber,
              "contactNumber",
              <Phone size={20} color={colors.primary} />,
              "phone-pad",
            )}

            {renderProfileField("Address", userData.address, "address", <MapPin size={20} color={colors.primary} />)}
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {renderSettingItem(
              "Notifications",
              <Bell size={20} color={colors.secondary} />,
              () => Alert.alert("Notifications", "Notification settings will be available soon."),
              `${colors.secondary}15`,
            )}

            {userRole === "admin" &&
              renderSettingItem("Admin Controls", <Shield size={20} color={colors.primary} />, () =>
                router.push("/admin/UserManagement"),
              )}

            {renderSettingItem(
              "Help & Support",
              <HelpCircle size={20} color={colors.success} />,
              () => Alert.alert("Help & Support", "Support features will be available soon."),
              `${colors.success}15`,
            )}

            {renderSettingItem(
              "About",
              <Info size={20} color={colors.tertiary} />,
              () => Alert.alert("About", "Trash Collection System v1.0"),
              `${colors.tertiary}15`,
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.white} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {userRole === "admin" ? <EnhancedAdminBottomBar /> : <EnhancedUserBottomBar />}

      <Toast />
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for bottom bar
  },
  header: {
    marginBottom: spacing.md,
  },
  headerGradient: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.medium,
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.xs,
  },
  profileRole: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}30`,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  fieldInput: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
    paddingBottom: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.tertiary}30`,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e74c3c",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    ...shadows.medium,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginLeft: spacing.sm,
  },
  versionContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  versionText: {
    fontSize: 12,
    color: colors.tertiary,
  },
})

export default SettingsScreen

