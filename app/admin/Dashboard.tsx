"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../../firebaseConfig"
import { format } from "date-fns"
import { useAuth } from "@/src/auth/AuthContext"
import { colors, shadows, spacing, borderRadius } from "../../src/styles/styles"
import {
  Calendar,
  ChevronDown,
  Users,
  Trash2,
  BarChart3,
  Clock,
  User,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from "lucide-react-native"

interface TrashEmptyingHistory {
  bin: string
  collector: string
  volume: number
  emptiedAt: Date
}

interface UserVolume {
  collector: string
  totalVolume: number
}

interface BinVolume {
  bin: string
  totalVolume: number
}

// Define sort options
type SortOption = {
  id: string
  label: string
  icon: React.ReactNode
  sortFn: (a: TrashEmptyingHistory, b: TrashEmptyingHistory) => number
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [history, setHistory] = useState<TrashEmptyingHistory[]>([])
  const [users, setUsers] = useState<UserVolume[]>([])
  const [bins, setBins] = useState<BinVolume[]>([])
  const [totalVolume, setTotalVolume] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedBin, setSelectedBin] = useState<string | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showBinDropdown, setShowBinDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState<string>("timeDesc")

  const { userRole, firstName, lastName } = useAuth()

  // Define sort options
  const sortOptions: Record<string, SortOption> = {
    timeDesc: {
      id: "timeDesc",
      label: "Time (Newest First)",
      icon: <ArrowDown size={16} color={colors.secondary} />,
      sortFn: (a, b) => b.emptiedAt.getTime() - a.emptiedAt.getTime(),
    },
    timeAsc: {
      id: "timeAsc",
      label: "Time (Oldest First)",
      icon: <ArrowUp size={16} color={colors.secondary} />,
      sortFn: (a, b) => a.emptiedAt.getTime() - b.emptiedAt.getTime(),
    },
    volumeDesc: {
      id: "volumeDesc",
      label: "Volume (Highest First)",
      icon: <ArrowDown size={16} color={colors.secondary} />,
      sortFn: (a, b) => b.volume - a.volume,
    },
    volumeAsc: {
      id: "volumeAsc",
      label: "Volume (Lowest First)",
      icon: <ArrowUp size={16} color={colors.secondary} />,
      sortFn: (a, b) => a.volume - b.volume,
    },
  }

  // Fetch trash emptying history for the selected date
  const fetchHistory = async (date: Date) => {
    setIsLoading(true)
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const q = query(
        collection(db, "trashEmptying"),
        where("emptiedAt", ">=", startOfDay),
        where("emptiedAt", "<=", endOfDay),
        orderBy("emptiedAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      const fetchedHistory: TrashEmptyingHistory[] = []
      const usersMap: { [key: string]: number } = {}
      const binsMap: { [key: string]: number } = {}
      let total = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const entry = {
          bin: data.bin,
          collector: data.collector,
          volume: data.volume,
          emptiedAt: data.emptiedAt.toDate(),
        }
        fetchedHistory.push(entry)

        // Calculate total volume
        total += data.volume

        // Calculate user volumes
        if (!usersMap[data.collector]) {
          usersMap[data.collector] = 0
        }
        usersMap[data.collector] += data.volume

        // Calculate bin volumes
        if (!binsMap[data.bin]) {
          binsMap[data.bin] = 0
        }
        binsMap[data.bin] += data.volume
      })

      // Convert usersMap to array and sort by volume descending
      const usersList = Object.entries(usersMap)
        .map(([collector, totalVolume]) => ({
          collector,
          totalVolume,
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume)

      // Convert binsMap to array and sort by volume descending
      const binsList = Object.entries(binsMap)
        .map(([bin, totalVolume]) => ({
          bin,
          totalVolume,
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume)

      setHistory(fetchedHistory)
      setUsers(usersList)
      setBins(binsList)
      setTotalVolume(total)
    } catch (error) {
      console.error("Error fetching history: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch history when the selected date changes
  useEffect(() => {
    fetchHistory(selectedDate)
  }, [selectedDate])

  // Handle date change
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
    }
  }

  // Filter and sort history based on selected options
  const processedHistory = history
    .filter((item) => {
      return (!selectedUser || item.collector === selectedUser) && (!selectedBin || item.bin === selectedBin)
    })
    .sort(sortOptions[selectedSortOption].sortFn)

  // Get the user with the highest volume
  const topUser = users.length > 0 ? users[0] : null

  // Get the bin with the highest volume
  const topBin = bins.length > 0 ? bins[0] : null

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome, {firstName} {lastName}!
          </Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.datePickerText}>{format(selectedDate, "MMMM d, yyyy")}</Text>
            <ChevronDown size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Total Volume Card */}
          <View style={styles.totalVolumeCard}>
            <View style={styles.totalVolumeIconContainer}>
              <BarChart3 size={24} color={colors.white} />
            </View>
            <Text style={styles.totalVolumeLabel}>Total Volume Collected</Text>
            <Text style={styles.totalVolumeValue}>{totalVolume.toFixed(2)} liters</Text>
          </View>

          {/* Top Collector Card */}
          <View style={styles.topContainer}>
            {topUser && (
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.secondary }]}>
                  <Users size={20} color={colors.white} />
                </View>
                <Text style={styles.statLabel}>Top Collector</Text>
                <Text style={styles.statValue}>{topUser.collector}</Text>
                <Text style={styles.statSubvalue}>{topUser.totalVolume.toFixed(2)} L</Text>
              </View>
            )}

            {/* Top Bin Card */}
            {topBin && (
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.success }]}>
                  <Trash2 size={20} color={colors.white} />
                </View>
                <Text style={styles.statLabel}>Top Bin</Text>
                <Text style={styles.statValue}>{topBin.bin}</Text>
                <Text style={styles.statSubvalue}>{topBin.totalVolume.toFixed(2)} L</Text>
              </View>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortDropdown(true)}>
              <ArrowUpDown size={16} color={colors.primary} />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterButtons}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowUserDropdown(true)}>
              <User size={16} color={colors.secondary} />
              <Text style={styles.filterText} numberOfLines={1}>
                {selectedUser || "All Users"}
              </Text>
              <ChevronDown size={16} color={colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterButton} onPress={() => setShowBinDropdown(true)}>
              <Trash2 size={16} color={colors.secondary} />
              <Text style={styles.filterText} numberOfLines={1}>
                {selectedBin || "All Bins"}
              </Text>
              <ChevronDown size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historyListContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading data...</Text>
            </View>
          ) : processedHistory.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Trash2 size={48} color={colors.tertiary} />
              <Text style={styles.noHistoryText}>No history found for this date.</Text>
            </View>
          ) : (
            <View style={styles.historyListWrapper}>
              <ScrollView 
                style={styles.historyScroll} 
                contentContainerStyle={styles.historyScrollContent}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {processedHistory.map((item, index) => (
                  <View key={index} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.binName}>{item.bin}</Text>
                      <View style={styles.volumeBadge}>
                        <Text style={styles.volumeBadgeText}>{item.volume.toFixed(2)} L</Text>
                      </View>
                    </View>
                    <View style={styles.historyCardContent}>
                      <View style={styles.historyCardItem}>
                        <User size={16} color={colors.secondary} />
                        <Text style={styles.historyCardItemText}>{item.collector}</Text>
                      </View>
                      <View style={styles.historyCardItem}>
                        <Clock size={16} color={colors.secondary} />
                        <Text style={styles.historyCardItemText}>{format(item.emptiedAt, "h:mm a")}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* User Dropdown Modal */}
      <Modal
        visible={showUserDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowUserDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select User</Text>
            <TouchableOpacity
              style={[styles.modalItem, !selectedUser && styles.modalItemSelected]}
              onPress={() => {
                setSelectedUser(null) // "All Users"
                setShowUserDropdown(false)
              }}
            >
              <Text style={styles.modalItemText}>All Users</Text>
              {!selectedUser && <View style={styles.modalItemSelectedIndicator} />}
            </TouchableOpacity>
            {users.map((user) => (
              <TouchableOpacity
                key={user.collector}
                style={[styles.modalItem, selectedUser === user.collector && styles.modalItemSelected]}
                onPress={() => {
                  setSelectedUser(user.collector)
                  setShowUserDropdown(false)
                }}
              >
                <Text style={styles.modalItemText}>{user.collector}</Text>
                {selectedUser === user.collector && <View style={styles.modalItemSelectedIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bin Dropdown Modal */}
      <Modal
        visible={showBinDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBinDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBinDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Bin</Text>
            <TouchableOpacity
              style={[styles.modalItem, !selectedBin && styles.modalItemSelected]}
              onPress={() => {
                setSelectedBin(null) // "All Bins"
                setShowBinDropdown(false)
              }}
            >
              <Text style={styles.modalItemText}>All Bins</Text>
              {!selectedBin && <View style={styles.modalItemSelectedIndicator} />}
            </TouchableOpacity>
            {bins.map((bin) => (
              <TouchableOpacity
                key={bin.bin}
                style={[styles.modalItem, selectedBin === bin.bin && styles.modalItemSelected]}
                onPress={() => {
                  setSelectedBin(bin.bin)
                  setShowBinDropdown(false)
                }}
              >
                <Text style={styles.modalItemText}>{bin.bin}</Text>
                {selectedBin === bin.bin && <View style={styles.modalItemSelectedIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Dropdown Modal */}
      <Modal
        visible={showSortDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {Object.values(sortOptions).map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.modalItem, selectedSortOption === option.id && styles.modalItemSelected]}
                onPress={() => {
                  setSelectedSortOption(option.id)
                  setShowSortDropdown(false)
                }}
              >
                <View style={styles.sortOptionContainer}>
                  {option.icon}
                  <Text style={styles.modalItemText}>{option.label}</Text>
                </View>
                {selectedSortOption === option.id && <View style={styles.modalItemSelectedIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Extra space for bottom bar
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  totalVolumeCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
    ...shadows.medium,
  },
  totalVolumeIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: borderRadius.round,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  totalVolumeLabel: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  totalVolumeValue: {
    fontSize: 28,
    color: colors.white,
    fontWeight: "bold",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
    justifyContent: "center",
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  statSubvalue: {
    fontSize: 14,
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  sortOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    ...shadows.small,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    marginHorizontal: spacing.xs,
  },
  historyListContainer: {
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.small,
    overflow: "hidden",
  },
  historyListWrapper: {
    height: 500,
  },
  historyScroll: {
    flex: 1,
  },
  historyScrollContent: {
    padding: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.secondary,
    fontSize: 16,
  },
  emptyStateContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noHistoryText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  binName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  volumeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.lg,
  },
  volumeBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  historyCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyCardItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyCardItemText: {
    fontSize: 14,
    color: colors.secondary,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.large,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  modalItemSelected: {
    backgroundColor: `${colors.primary}10`, // 10% opacity
  },
  modalItemText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  modalItemSelectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
})

export default Dashboard

