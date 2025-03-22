"use client"

import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import type { UserCardProps } from "../../../src/types/userManagement"
import { colors } from "../../../src/styles/styles"
import { useUsers } from "../../../src/hooks/useUsers"
import { useBinAssignments } from "../../../src/hooks/useBinAssignments"
import { Users, Trash2, X, BarChart3 } from "lucide-react-native"
import BinAssignmentModal from "./BinAssignmentModal"
import { router } from "expo-router"

const UserCard = ({ user, onUserDeleted }: UserCardProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isBinAssignmentModalVisible, setIsBinAssignmentModalVisible] = useState(false)
  const { softDeleteUser } = useUsers()
  const { bins } = useBinAssignments()

  // Get assigned bins for this user
  const assignedBins = bins
    .filter((bin) => bin.assignee.includes(user.id))
    .map((bin) => bin.bin)

  const handleDelete = async () => {
    const success = await softDeleteUser(user.id)
    if (success) {
      setIsModalVisible(false)
      onUserDeleted()
    }
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {assignedBins.length > 0 && (
            <View style={styles.assignedBinsContainer}>
              <Text style={styles.assignedBinsLabel}>Assigned Bins:</Text>
              <View style={styles.binTags}>
                {assignedBins.map((bin) => (
                  <View key={bin} style={styles.binTag}>
                    <Text style={styles.binTagText}>{bin}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      {/* User Details Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>
                  {user.firstName} {user.lastName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{user.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact:</Text>
                <Text style={styles.detailValue}>{user.contactNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{user.address}</Text>
              </View>

              {assignedBins.length > 0 && (
                <View style={styles.assignedBinsSection}>
                  <Text style={styles.sectionTitle}>Assigned Bins</Text>
                  <View style={styles.binTags}>
                    {assignedBins.map((bin) => (
                      <View key={bin} style={styles.binTag}>
                        <Text style={styles.binTagText}>{bin}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.analyticsButton]}
                onPress={() => {
                  setIsModalVisible(false)
                  router.push({
                    pathname: "/user/Analytics",
                    params: { userId: user.id }
                  })
                }}
              >
                <BarChart3 size={20} color={colors.white} />
                <Text style={styles.modalButtonText}>View Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.assignButton]}
                onPress={() => {
                  setIsModalVisible(false)
                  setIsBinAssignmentModalVisible(true)
                }}
              >
                <Users size={20} color={colors.white} />
                <Text style={styles.modalButtonText}>Manage Bin Assignments</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDelete}>
                <Trash2 size={20} color={colors.white} />
                <Text style={styles.modalButtonText}>Delete User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bin Assignment Modal */}
      <BinAssignmentModal
        visible={isBinAssignmentModalVisible}
        userId={user.id}
        userName={`${user.firstName} ${user.lastName}`}
        onClose={() => setIsBinAssignmentModalVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: colors.secondary,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.tertiary,
    gap: 12,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  analyticsButton: {
    backgroundColor: colors.secondary,
  },
  assignButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  assignedBinsContainer: {
    marginTop: 8,
  },
  assignedBinsLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  binTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  binTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  binTagText: {
    fontSize: 12,
    color: colors.primary,
  },
  assignedBinsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: `${colors.tertiary}30`,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
})

export default UserCard

