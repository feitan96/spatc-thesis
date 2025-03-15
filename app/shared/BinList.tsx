"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, Modal } from "react-native"
import { ref, onValue } from "firebase/database"
import { database } from "../../firebaseConfig"
import { router } from "expo-router"
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner"
import FullScreenMap from "../components/FullScreenMap"
import { useAuth } from "../../src/auth/AuthContext"
import AdminBottomBar from "../components/AdminBottomBar"
import UserBottomBar from "../components/UserBottomBar"
import BinActionDialog from "../components/bin-management/BinActionDialog"
import BinAssignmentModal from "../components/bin-management/BinAssignmentModal"
import { useBinAssignments } from "../../src/hooks/useBinAssignments"
import { TouchableOpacity } from "react-native"
import { MapPin } from "lucide-react-native"

// Import the new BinCardEnhanced component
import BinCardEnhanced from "../components/bin-management/BinCardEnhanced"

interface BinData {
  [key: string]: any
}

const BinList = () => {
  const [bins, setBins] = useState<string[]>([])
  const [binData, setBinData] = useState<BinData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [selectedBin, setSelectedBin] = useState<string | null>(null)
  const [isActionDialogVisible, setIsActionDialogVisible] = useState(false)
  const [isAssignmentModalVisible, setIsAssignmentModalVisible] = useState(false)

  const { userRole, userId } = useAuth()
  const { bins: binAssignments, isLoadingBins } = useBinAssignments()

  useEffect(() => {
    const fetchBins = async () => {
      setIsLoading(true)
      const binsRef = ref(database)

      const unsubscribe = onValue(binsRef, async (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const binNames = Object.keys(data)

          if (userRole === "admin") {
            setBins(binNames)
            setBinData(data)
          } else if (userRole === "user" && userId) {
            // Filter bins based on user assignments
            const assignedBins = await getAssignedBins()
            const filteredBins = binNames.filter((bin) => assignedBins.includes(bin))
            setBins(filteredBins)
            setBinData(data)
          }
        }
        setIsLoading(false)
      })

      return () => unsubscribe()
    }

    fetchBins()
  }, [userRole, userId, binAssignments])

  const getAssignedBins = async () => {
    if (!userId) return []

    // Find bins assigned to this user from binAssignments
    const assignedBins = binAssignments
      .filter((assignment) => assignment.assignee.includes(userId))
      .map((assignment) => assignment.bin)

    return assignedBins
  }

  const handleBinPress = (binName: string) => {
    setSelectedBin(binName)
    setIsActionDialogVisible(true)
  }

  const handleViewDetails = () => {
    if (selectedBin) {
      setIsActionDialogVisible(false)
      router.push({ pathname: "/shared/BinDetails", params: { binName: selectedBin } })
    }
  }

  const handleManageUsers = () => {
    setIsActionDialogVisible(false)
    setIsAssignmentModalVisible(true)
  }

  const handleViewMap = () => {
    setIsMapVisible(true)
  }

  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalVisible(false)
    setSelectedBin(null)
  }

  if (isLoading || isLoadingBins) {
    return <Spinner />
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Bins</Text>
          {userRole === "admin" && (
            <TouchableOpacity onPress={handleViewMap} style={styles.viewMapButton}>
              <MapPin size={18} color={colors.white} />
              <Text style={styles.viewMapButtonText}>View Map</Text>
            </TouchableOpacity>
          )}
        </View>

        {bins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No bins available</Text>
          </View>
        ) : (
          <View style={styles.binGrid}>
            {bins.map((bin) => (
              <BinCardEnhanced key={bin} binName={bin} binData={binData[bin]} onPress={() => handleBinPress(bin)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Dialog */}
      <BinActionDialog
        visible={isActionDialogVisible}
        binName={selectedBin}
        onClose={() => setIsActionDialogVisible(false)}
        onViewDetails={handleViewDetails}
        onManageUsers={handleManageUsers}
        showManageOption={userRole === "admin"}
      />

      {/* Bin Assignment Modal */}
      {userRole === "admin" && (
        <BinAssignmentModal
          visible={isAssignmentModalVisible}
          binName={selectedBin}
          onClose={handleCloseAssignmentModal}
        />
      )}

      {/* Full-screen map modal */}
      <Modal visible={isMapVisible} transparent={true} animationType="slide">
        <FullScreenMap binData={binData} onClose={() => setIsMapVisible(false)} />
      </Modal>

      {userRole === "admin" ? <AdminBottomBar /> : <UserBottomBar />}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  viewMapButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewMapButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  binGrid: {
    width: "100%",
    gap: 8,
    paddingBottom: 130,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
  },
})

export default BinList

