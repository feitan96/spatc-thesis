"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { colors, shadows } from "../../src/styles/styles"
import EnhancedAdminBottomBar from "../components/AdminBottomBar"
import Spinner from "../components/Spinner"
import UserList from "../components/user-management/UserList"
import { useBinAssignments } from "../../src/hooks/useBinAssignments"
import { useUsers } from "../../src/hooks/useUsers"
import { Search, Plus, RefreshCw, Users } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"

const UserManagement = () => {
  const { users, isLoadingUsers, refreshUsers } = useUsers()
  const { bins, isLoadingBins } = useBinAssignments()
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isLoading = isLoadingUsers || isLoadingBins

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUsers()
    setIsRefreshing(false)
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <Spinner />
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Users size={24} color={colors.white} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>User Management</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bins.length}</Text>
              <Text style={styles.statLabel}>Total Bins</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and actions bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.tertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <RefreshCw size={18} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <UserList users={filteredUsers} onUserDeleted={refreshUsers} />
      </ScrollView>

      {/* Floating Action Button */}
      {/* <TouchableOpacity style={styles.fab}>
        <Plus size={24} color={colors.white} />
      </TouchableOpacity> */}

      <EnhancedAdminBottomBar />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 36, // For status bar
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.medium,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.small,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.primary,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: colors.tertiary,
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 105, // Extra space for bottom bar
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.large,
  },
})

export default UserManagement

