"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from "react-native"
import { colors } from "../../../src/styles/styles"
import { X, Check, Trash2, AlertCircle } from "lucide-react-native"
import { useBinAssignments } from "../../../src/hooks/useBinAssignments"
import Spinner from "../Spinner"

interface BinAssignmentModalProps {
  visible: boolean
  userId: string
  userName: string
  onClose: () => void
}

const BinAssignmentModal = ({ visible, userId, userName, onClose }: BinAssignmentModalProps) => {
  const [activeTab, setActiveTab] = useState<"assign" | "unassign">("assign")
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { bins, isLoadingBins, assignUserToBin, unassignUserFromBin, refreshBins } = useBinAssignments()

  // Get assigned and unassigned bins for this user
  const assignedBins = bins.filter((bin) => bin.assignee.includes(userId))
  const unassignedBins = bins.filter((bin) => !bin.assignee.includes(userId))

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedBinId(null)
  }, [activeTab])

  const handleAssignBin = async () => {
    if (!selectedBinId) return

    Alert.alert("Confirm Assignment", "Are you sure you want to assign this bin to the user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Assign",
        onPress: async () => {
          setIsProcessing(true)
          try {
            await assignUserToBin(selectedBinId, userId)
            setSelectedBinId(null)
            Alert.alert("Success", "Bin assigned successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to assign bin")
            console.error(error)
          } finally {
            setIsProcessing(false)
          }
        },
      },
    ])
  }

  const handleUnassignBin = async () => {
    if (!selectedBinId) return

    Alert.alert("Confirm Unassignment", "Are you sure you want to unassign this bin from the user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unassign",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true)
          try {
            await unassignUserFromBin(selectedBinId, userId)
            setSelectedBinId(null)
            Alert.alert("Success", "Bin unassigned successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to unassign bin")
            console.error(error)
          } finally {
            setIsProcessing(false)
          }
        },
      },
    ])
  }

  const renderBinItem = ({ item }: { item: { id: string; bin: string } }) => (
    <TouchableOpacity
      style={[styles.binItem, selectedBinId === item.id && styles.selectedBinItem]}
      onPress={() => setSelectedBinId(item.id)}
      disabled={isProcessing}
    >
      <View style={styles.binIconContainer}>
        <Trash2 size={20} color={colors.primary} />
      </View>
      <View style={styles.binInfo}>
        <Text style={styles.binName}>{item.bin}</Text>
      </View>
      {selectedBinId === item.id && (
        <View style={styles.checkIconContainer}>
          <Check size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  )

  if (!visible) return null

  const isLoading = isLoadingBins

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Bin Assignments for {userName}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "assign" && styles.activeTab]}
            onPress={() => setActiveTab("assign")}
          >
            <Text style={[styles.tabText, activeTab === "assign" && styles.activeTabText]}>Assign Bins</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "unassign" && styles.activeTab]}
            onPress={() => setActiveTab("unassign")}
          >
            <Text style={[styles.tabText, activeTab === "unassign" && styles.activeTabText]}>Unassign Bins</Text>
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
                {unassignedBins.length === 0 ? (
                  <View style={styles.emptyState}>
                    <AlertCircle size={40} color={colors.tertiary} />
                    <Text style={styles.emptyStateText}>All bins are already assigned to this user</Text>
                  </View>
                ) : (
                  <FlatList
                    data={unassignedBins}
                    renderItem={renderBinItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </>
            ) : (
              <>
                {assignedBins.length === 0 ? (
                  <View style={styles.emptyState}>
                    <AlertCircle size={40} color={colors.tertiary} />
                    <Text style={styles.emptyStateText}>No bins are assigned to this user</Text>
                  </View>
                ) : (
                  <FlatList
                    data={assignedBins}
                    renderItem={renderBinItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                  />
                )}
              </>
            )}
          </>
        )}

        {selectedBinId && (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                activeTab === "unassign" && styles.unassignButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={activeTab === "assign" ? handleAssignBin : handleUnassignBin}
              disabled={isProcessing}
            >
              <Text style={styles.actionButtonText}>
                {isProcessing ? "Processing..." : activeTab === "assign" ? "Assign Bin" : "Unassign Bin"}
              </Text>
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
  binItem: {
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
  selectedBinItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  binIconContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  binInfo: {
    flex: 1,
  },
  binName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
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
    marginTop: 12,
  },
})

export default BinAssignmentModal 