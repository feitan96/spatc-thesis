"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Picker } from "@react-native-picker/picker"
import type { BinAssignmentManagerProps, User } from "../../../src/types/userManagement"
import { colors } from "../../../src/styles/styles"
import React from "react"

const BinAssignmentManager = ({ bins, users, onAssignUser, onUnassignUser }: BinAssignmentManagerProps) => {
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null)
  const [selectedBinName, setSelectedBinName] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedAssignedUserId, setSelectedAssignedUserId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)

  // Update available and assigned users when a bin is selected
  useEffect(() => {
    if (selectedBinId) {
      const selectedBin = bins.find((bin) => bin.id === selectedBinId)
      if (selectedBin) {
        const assignedUserIds = selectedBin.assignee
        const assignedUsersList = users.filter((user) => assignedUserIds.includes(user.id))
        const availableUsersList = users.filter((user) => !assignedUserIds.includes(user.id))

        setAssignedUsers(assignedUsersList)
        setAvailableUsers(availableUsersList)
      }
    } else {
      setAvailableUsers([])
      setAssignedUsers([])
    }
  }, [selectedBinId, bins, users])

  // Handle bin selection
  const handleBinSelect = (binId: string) => {
    const selectedBin = bins.find((bin) => bin.id === binId)
    setSelectedBinId(binId)
    setSelectedBinName(selectedBin ? selectedBin.bin : null)
    setSelectedUserId(null)
    setSelectedAssignedUserId(null)
  }

  // Handle user assignment
  const handleAssignUser = async () => {
    if (!selectedBinId || !selectedUserId) return

    setIsAssigning(true)
    try {
      const success = await onAssignUser(selectedBinId, selectedUserId)
      if (success) {
        setSelectedUserId(null)
      }
    } finally {
      setIsAssigning(false)
    }
  }

  // Handle user unassignment
  const handleUnassignUser = async () => {
    if (!selectedBinId || !selectedAssignedUserId) return

    setIsUnassigning(true)
    try {
      const success = await onUnassignUser(selectedBinId, selectedAssignedUserId)
      if (success) {
        setSelectedAssignedUserId(null)
      }
    } finally {
      setIsUnassigning(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bin Assignment Manager</Text>

      {/* Bin Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select a Bin</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBinId || ""}
            onValueChange={(itemValue) => handleBinSelect(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a bin" value="" />
            {bins.map((bin) => (
              <Picker.Item key={bin.id} label={bin.bin} value={bin.id} />
            ))}
          </Picker>
        </View>
      </View>

      {selectedBinId && (
        <>
          {/* Assign User Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assign User to {selectedBinName}</Text>
            {availableUsers.length === 0 ? (
              <Text style={styles.emptyText}>No available users to assign</Text>
            ) : (
              <>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedUserId || ""}
                    onValueChange={(itemValue) => setSelectedUserId(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a user to assign" value="" />
                    {availableUsers.map((user) => (
                      <Picker.Item key={user.id} label={`${user.firstName} ${user.lastName}`} value={user.id} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, (!selectedUserId || isAssigning) && styles.disabledButton]}
                  onPress={handleAssignUser}
                  disabled={!selectedUserId || isAssigning}
                >
                  <Text style={styles.actionButtonText}>{isAssigning ? "Assigning..." : "Assign User"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Unassign User Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Unassign User from {selectedBinName}</Text>
            {assignedUsers.length === 0 ? (
              <Text style={styles.emptyText}>No assigned users to unassign</Text>
            ) : (
              <>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedAssignedUserId || ""}
                    onValueChange={(itemValue) => setSelectedAssignedUserId(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a user to unassign" value="" />
                    {assignedUsers.map((user) => (
                      <Picker.Item key={user.id} label={`${user.firstName} ${user.lastName}`} value={user.id} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.unassignButton,
                    (!selectedAssignedUserId || isUnassigning) && styles.disabledButton,
                  ]}
                  onPress={handleUnassignUser}
                  disabled={!selectedAssignedUserId || isUnassigning}
                >
                  <Text style={styles.actionButtonText}>{isUnassigning ? "Unassigning..." : "Unassign User"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    backgroundColor: "transparent",
  },
  actionButton: {
    backgroundColor: colors.secondary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  unassignButton: {
    backgroundColor: "#e74c3c",
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyText: {
    textAlign: "center",
    color: colors.secondary,
    marginVertical: 12,
    fontSize: 14,
  },
})

export default BinAssignmentManager

