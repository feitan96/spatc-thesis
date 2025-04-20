"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from "react-native"
import { colors } from "../../../src/styles/styles"
import { X, Check, User, UserMinus } from "lucide-react-native"
import { useBinAssignments } from "../../../src/hooks/useBinAssignments"
import { useUsers } from "../../../src/hooks/useUsers"
import Spinner from "../Spinner"

interface BinAssignmentModalProps {
  visible: boolean
  binName: string | null
  onClose: () => void
}

const BinAssignmentModal = ({ visible, binName, onClose }: BinAssignmentModalProps) => {
  const [activeTab, setActiveTab] = useState<"assign" | "unassign">("assign")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { users, isLoadingUsers } = useUsers()
  const { bins, isLoadingBins, assignUserToBin, unassignUserFromBin } = useBinAssignments()

  // Find the bin assignment object for the selected bin
  const selectedBinAssignment = binName ? bins.find((bin) => bin.bin === binName) : null

  // Get assigned and unassigned users
  const assignedUsers = selectedBinAssignment
    ? users.filter((user) => selectedBinAssignment.assignee.includes(user.id))
    : []

  const unassignedUsers = selectedBinAssignment
    ? users.filter((user) => !selectedBinAssignment.assignee.includes(user.id))
    : []

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedUserId(null)
  }, [activeTab])

  const handleAssignUser = async () => {
    if (!selectedBinAssignment || !selectedUserId) return

    // Show confirmation dialog
    Alert.alert("Confirm Assignment", "Are you sure you want to assign this user to the bin?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Assign",
        onPress: async () => {
          setIsProcessing(true)
          try {
            await assignUserToBin(selectedBinAssignment.id, selectedUserId)
            setSelectedUserId(null)
            Alert.alert("Success", "User assigned successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to assign user")
            console.error(error)
          } finally {
            setIsProcessing(false)
          }
        },
      },
    ])
  }

  const handleUnassignUser = async () => {
    if (!selectedBinAssignment || !selectedUserId) return

    // Show confirmation dialog
    Alert.alert("Confirm Unassignment", "Are you sure you want to unassign this user from the bin?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unassign",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true)
          try {
            await unassignUserFromBin(selectedBinAssignment.id, selectedUserId)
            setSelectedUserId(null)
            Alert.alert("Success", "User unassigned successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to unassign user")
            console.error(error)
          } finally {
            setIsProcessing(false)
          }
        },
      },
    ])
  }

  const renderUserItem = ({ item }: { item: { id: string; firstName: string; lastName: string; email: string } }) => (
    <TouchableOpacity
      style={[styles.userItem, selectedUserId === item.id && styles.selectedUserItem]}
      onPress={() => setSelectedUserId(item.id)}
      disabled={isProcessing}
    >
      <View style={styles.userIconContainer}>
        <User size={20} color={colors.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      {selectedUserId === item.id && (
        <View style={styles.checkIconContainer}>
          <Check size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  )

  if (!visible || !binName) return null

  const isLoading = isLoadingUsers || isLoadingBins

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Users for {binName}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "assign" && styles.activeTab]}
            onPress={() => setActiveTab("assign")}
          >
            <Text style={[styles.tabText, activeTab === "assign" && styles.activeTabText]}>Assign Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "unassign" && styles.activeTab]}
            onPress={() => setActiveTab("unassign")}
          >
            <Text style={[styles.tabText, activeTab === "unassign" && styles.activeTabText]}>Unassign Users</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Spinner />
          </View>
        ) : (
          <>
            {activeTab === "assign" ? (
              <>
                {unassignedUsers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>All users are already assigned to this bin</Text>
                  </View>
                ) : (
                  <FlatList
                    data={unassignedUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </>
            ) : (
              <>
                {assignedUsers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No users are assigned to this bin</Text>
                  </View>
                ) : (
                  <FlatList
                    data={assignedUsers}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </>
            )}
          </>
        )}

        {!isLoading && selectedUserId && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                activeTab === "unassign" && styles.unassignButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={activeTab === "assign" ? handleAssignUser : handleUnassignUser}
              disabled={isProcessing}
            >
              {activeTab === "assign" ? (
                <>
                  <User size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>{isProcessing ? "Processing..." : "Assign User"}</Text>
                </>
              ) : (
                <>
                  <UserMinus size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>{isProcessing ? "Processing..." : "Unassign User"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedUserItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userIconContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  checkIconContainer: {
    backgroundColor: colors.primary,
    padding: 4,
    borderRadius: 12,
  },
  actionButtonContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.tertiary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  unassignButton: {
    backgroundColor: "#e74c3c",
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
  },
})

export default BinAssignmentModal

