import { View, Text, StyleSheet } from "react-native"
import type { UserListProps } from "../../../src/types/userManagement"
import { colors } from "../../../src/styles/styles"
import UserCard from "./UserCard"
import { Users } from "lucide-react-native"
import React from "react"

const UserList = ({ users, onUserDeleted }: UserListProps) => {
  return (
    <View style={styles.container}>
      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIconContainer}>
            <Users size={40} color={colors.tertiary} />
          </View>
          <Text style={styles.emptyStateTitle}>No Users Found</Text>
          <Text style={styles.emptyStateText}>
            {users.length === 0
              ? "There are no users in the system yet."
              : "No users match your search criteria. Try a different search term."}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>{users.length} users found</Text>
          <View style={styles.userGrid}>
            {users.map((user) => (
              <UserCard key={user.id} user={user} onUserDeleted={onUserDeleted} />
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultCount: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 12,
  },
  userGrid: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    ...colors.shadows,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default UserList

