import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { colors } from '../../src/styles/styles'
import { useUsers } from '../../src/hooks/useUsers'
import { useBinAssignments } from '../../src/hooks/useBinAssignments'
import { Users } from 'lucide-react-native'

interface BinAssigneeProps {
  binName: string
}

const BinAssignee = ({ binName }: BinAssigneeProps) => {
  const { users } = useUsers()
  const { bins } = useBinAssignments()

  // Find the bin assignment for this bin
  const binAssignment = bins.find(b => b.bin === binName)
  
  // Get assigned users
  const assignedUsers = users.filter(user => 
    binAssignment?.assignee.includes(user.id)
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={24} color={colors.primary} />
        <Text style={styles.title}>Assigned Users</Text>
      </View>

      <View style={styles.userList}>
        {assignedUsers.length > 0 ? (
          assignedUsers.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noUsers}>No users assigned to this bin</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  userList: {
    gap: 8,
  },
  userItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.tertiary,
    marginTop: 4,
  },
  noUsers: {
    textAlign: 'center',
    color: colors.tertiary,
    fontSize: 16,
    padding: 12,
  },
})

export default BinAssignee