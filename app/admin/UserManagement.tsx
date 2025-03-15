import { View, StyleSheet, ScrollView } from "react-native"
import { colors } from "../../src/styles/styles"
import BottomBar from "../components/AdminBottomBar"
import Spinner from "../components/Spinner"
import UserList from "../components/user-management/UserList"
import BinAssignmentManager from "../components/user-management/BinAssignmentManager"
import { useBinAssignments } from "../hooks/useBinAssignments"
import { useUsers } from "../hooks/useUsers"

const UserManagement = () => {
  const { users, isLoadingUsers, refreshUsers } = useUsers()
  const { bins, isLoadingBins, assignUserToBin, unassignUserFromBin } = useBinAssignments()

  const isLoading = isLoadingUsers || isLoadingBins

  if (isLoading) {
    return <Spinner />
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Bin Assignment Section */}
        <BinAssignmentManager
          bins={bins}
          users={users}
          onAssignUser={assignUserToBin}
          onUnassignUser={unassignUserFromBin}
        />

        {/* User List Section */}
        <UserList users={users} onUserDeleted={refreshUsers} />
      </ScrollView>
      <BottomBar />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
})

export default UserManagement

