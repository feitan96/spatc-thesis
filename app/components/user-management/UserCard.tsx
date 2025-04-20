"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated } from "react-native"
import type { UserCardProps } from "../../../src/types/userManagement"
import { colors, shadows } from "../../../src/styles/styles"
import { useUsers } from "../../../src/hooks/useUsers"
import { useBinAssignments } from "../../../src/hooks/useBinAssignments"
import { Trash2, X, BarChart3, Mail, Phone, MapPin, AlertTriangle, ChevronRight, Shield } from "lucide-react-native"
import BinAssignmentModal from "./BinAssignmentModal"
import { router } from "expo-router"
import { useRef, useEffect } from "react"
import React from "react"

const UserCard = ({ user, onUserDeleted }: UserCardProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isBinAssignmentModalVisible, setIsBinAssignmentModalVisible] = useState(false)
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)
  const { softDeleteUser } = useUsers()
  const { bins } = useBinAssignments()
  const slideAnim = useRef(new Animated.Value(0)).current

  // Get assigned bins for this user
  const assignedBins = bins.filter((bin) => bin.assignee.includes(user.id)).map((bin) => bin.bin)

  useEffect(() => {
    if (isModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isModalVisible])

  const handleDelete = async () => {
    const success = await softDeleteUser(user.id)
    if (success) {
      setIsDeleteConfirmVisible(false)
      setIsModalVisible(false)
      onUserDeleted()
    }
  }

  // Generate initials for avatar
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setIsModalVisible(true)} activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={styles.emailContainer}>
            <Mail size={14} color={colors.secondary} style={styles.infoIcon} />
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {assignedBins.length > 0 && (
            <View style={styles.binTagsContainer}>
              <View style={styles.binTag}>
                <Text style={styles.binTagText}>
                  {assignedBins.length} bin{assignedBins.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          )}
        </View>

        <ChevronRight size={20} color={colors.tertiary} />
      </TouchableOpacity>

      {/* User Details Modal */}
      <Modal visible={isModalVisible} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatarContainer}>
                <Text style={styles.modalAvatarText}>{initials}</Text>
              </View>
              <Text style={styles.modalTitle}>
                {user.firstName} {user.lastName}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <X size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                <View style={styles.infoItem}>
                  <Mail size={20} color={colors.primary} style={styles.infoItemIcon} />
                  <View>
                    <Text style={styles.infoItemLabel}>Email</Text>
                    <Text style={styles.infoItemValue}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Phone size={20} color={colors.primary} style={styles.infoItemIcon} />
                  <View>
                    <Text style={styles.infoItemLabel}>Phone</Text>
                    <Text style={styles.infoItemValue}>{user.contactNumber}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <MapPin size={20} color={colors.primary} style={styles.infoItemIcon} />
                  <View>
                    <Text style={styles.infoItemLabel}>Address</Text>
                    <Text style={styles.infoItemValue}>{user.address}</Text>
                  </View>
                </View>
              </View>

              {assignedBins.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Assigned Bins</Text>
                  <View style={styles.binsList}>
                    {assignedBins.map((bin) => (
                      <View key={bin} style={styles.binItem}>
                        <Trash2 size={18} color={colors.primary} style={styles.binItemIcon} />
                        <Text style={styles.binItemText}>{bin}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.analyticsButton]}
                  onPress={() => {
                    setIsModalVisible(false)
                    router.push({
                      pathname: "/user/Analytics",
                      params: { userId: user.id },
                    })
                  }}
                >
                  <BarChart3 size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.assignButton]}
                  onPress={() => {
                    setIsModalVisible(false)
                    setIsBinAssignmentModalVisible(true)
                  }}
                >
                  <Shield size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Assign Bins</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.deleteButton} onPress={() => setIsDeleteConfirmVisible(true)}>
                <Trash2 size={20} color={colors.white} />
                <Text style={styles.deleteButtonText}>Delete User</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteConfirmVisible} transparent animationType="fade">
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconContainer}>
              <AlertTriangle size={32} color="#e74c3c" />
            </View>
            <Text style={styles.confirmTitle}>Delete User</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setIsDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, styles.confirmDeleteButton]} onPress={handleDelete}>
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
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
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.medium,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.secondary,
  },
  binTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  binTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  binTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    ...shadows.large,
  },
  modalHeader: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoItemIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoItemLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  binsList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  binItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  binItemIcon: {
    marginRight: 12,
  },
  binItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    ...shadows.small,
  },
  analyticsButton: {
    backgroundColor: colors.secondary,
  },
  assignButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  deleteButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    ...shadows.large,
  },
  confirmIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    backgroundColor: "#e74c3c",
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default UserCard

