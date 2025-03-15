import { View, Text, StyleSheet } from "react-native"
import type { UserListProps } from "../../../src/types/userManagement"
import { colors } from "../../../src/styles/styles"
import UserCard from "./UserCard"

const UserList = ({ users, onUserDeleted }: UserListProps) => {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.sectionTitle}>User Management</Text> */}

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No users found</Text>
        </View>
      ) : (
        users.map((user) => <UserCard key={user.id} user={user} onUserDeleted={onUserDeleted} />)
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  emptyState: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyStateText: {
    color: colors.secondary,
    fontSize: 16,
  },
})

export default UserList

