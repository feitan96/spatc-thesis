"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ActivityIndicator, Animated } from "react-native"
import { ref, onValue } from "firebase/database"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { database, db } from "../../firebaseConfig"
import { useAuth } from "../../src/auth/AuthContext"
import { colors, trashLevels, shadows, spacing, borderRadius } from "../../src/styles/styles"
import { Trash2, Clock, CheckCircle } from "lucide-react-native"

interface FloatingTrashBubbleProps {
  binName: string
}

const FloatingTrashBubble: React.FC<FloatingTrashBubbleProps> = ({ binName }) => {
  const [trashLevel, setTrashLevel] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalScreen, setModalScreen] = useState<"confirmation" | "emptying" | "results">("confirmation")
  const [currentTrashLevel, setCurrentTrashLevel] = useState<number | null>(null)
  const [newTrashLevel, setNewTrashLevel] = useState<number | null>(null)
  const [volumeEmptied, setVolumeEmptied] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { firstName, lastName, userId, userRole } = useAuth()

  // Animation value for pulse effect
  const pulseAnim = useState(new Animated.Value(1))[0]

  // Start pulse animation when trash level is high
  useEffect(() => {
    if (trashLevel && trashLevel >= trashLevels.thresholds.critical) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [trashLevel, pulseAnim])

  // Fetch trashLevel from Firebase
  useEffect(() => {
    if (binName) {
      const trashLevelRef = ref(database, `${binName}/trashLevel`)
      const unsubscribe = onValue(trashLevelRef, (snapshot) => {
        const level = snapshot.val()
        if (level !== null) {
          setTrashLevel(level)
        }
      })
      return () => unsubscribe()
    }
  }, [binName])

  // Calculate volume of trash emptied (cylinder only)
  const calculateVolume = (trashLevelDifference: number) => {
    const r = 20 // Radius in centimeters
    const h = 40 // Height in centimeters

    // Volume of the cylindrical part (π * r^2 * h) in cubic centimeters
    const V_cylinder = Math.PI * Math.pow(r, 2) * h

    // Convert total volume from cubic centimeters to liters
    // (1 liter = 1000 cubic centimeters)
    const totalVolumeLiters = V_cylinder / 1000

    // Adjust volume based on trash level percentage
    const volumeLiters = totalVolumeLiters * (trashLevelDifference / 100)

    return volumeLiters
}

  // Post emptying data to Firestore
  const postTrashEmptying = async (volume: number) => {
    try {
      await addDoc(collection(db, "trashEmptying"), {
        bin: binName,
        volume: volume,
        collector: `${firstName} ${lastName}`,
        userId,
        emptiedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error posting trash emptying data: ", error)
    }
  }

  // Handle emptying process
  const handleEmptyTrash = () => {
    if (trashLevel !== null) {
      setCurrentTrashLevel(trashLevel)
      setModalScreen("emptying")
      setNewTrashLevel(null)
      setVolumeEmptied(null)
    }
  }

  // Handle "Done" button click
  const handleDone = () => {
    if (currentTrashLevel !== null) {
      setIsLoading(true)

      // Create a reference to the trash level
      const trashLevelRef = ref(database, `${binName}/trashLevel`)

      // Create a timeout ID for cleanup
      let timeoutId: NodeJS.Timeout

      // Set up the listener and store the unsubscribe function
      const unsubscribeListener = onValue(
        trashLevelRef,
        (snapshot) => {
          const updatedTrashLevel = snapshot.val()

          if (updatedTrashLevel !== null && updatedTrashLevel !== currentTrashLevel) {
            // Clear the timeout since we got a valid response
            if (timeoutId) clearTimeout(timeoutId)

            setNewTrashLevel(updatedTrashLevel)
            const levelDifference = currentTrashLevel - updatedTrashLevel
            const volume = calculateVolume(levelDifference)
            setVolumeEmptied(volume)
            postTrashEmptying(volume)
            setModalScreen("results")
            setIsLoading(false)

            // Unsubscribe from the listener
            if (unsubscribeListener) unsubscribeListener()
          }
        },
        {
          // This ensures we only get called when there's an actual change
          onlyOnce: false,
        },
      )

      // Set a timeout to handle case where trash level doesn't change
      timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          // Unsubscribe from the listener when timing out
          if (unsubscribeListener) unsubscribeListener()
          // Could show an error message here
        }
      }, 10000) // 10 second timeout
    }
  }

  if (trashLevel === null) {
    return null
  }

  const handleBubblePress = () => {
    if (userRole === 'user') {
      setIsModalVisible(true);
    }
  };

  // Get status color using the trashLevels helper
  const statusColor = trashLevels.getColor(trashLevel)
  const statusText = trashLevels.getStatusText(trashLevel)

  return (
    <>
      {/* Floating Bubble */}
      <Animated.View style={[styles.bubbleContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.bubble, 
            { backgroundColor: statusColor },
            userRole !== 'user' && styles.disabledBubble
          ]}
          onPress={handleBubblePress}
          activeOpacity={userRole === 'user' ? 0.8 : 1}
        >
          <Trash2 size={22} color={colors.white} />
          <Text style={styles.bubbleText}>{trashLevel}%</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalScreen === "confirmation" && (
              <>
                <View style={styles.iconContainer}>
                  <Trash2 size={28} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Empty Trash Bin</Text>
                <Text style={styles.binName}>{binName}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Current Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                  </View>
                </View>
                <Text style={styles.trashLevelText}>
                  Trash Level: <Text style={[styles.trashLevelValue, { color: statusColor }]}>{trashLevel}%</Text>
                </Text>
                <View style={styles.buttonContainer}>
                  <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.button, styles.primaryButton]} onPress={handleEmptyTrash}>
                    <Text style={styles.buttonText}>Empty Now</Text>
                  </Pressable>
                </View>
              </>
            )}

            {modalScreen === "emptying" && (
              <>
                <View style={styles.iconContainer}>
                  <Clock size={28} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Emptying in Progress</Text>
                <Text style={styles.modalText}>Please empty the trash bin and press "Done" when finished.</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Initial trash level:</Text>
                  <Text style={styles.infoValue}>{currentTrashLevel}%</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.button, styles.primaryButton]} onPress={handleDone} disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Done</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}

            {modalScreen === "results" && (
              <>
                <View style={[styles.iconContainer, styles.successIconContainer]}>
                  <CheckCircle size={28} color={colors.success} />
                </View>
                <Text style={styles.modalTitle}>Success!</Text>
                <View style={styles.resultContainer}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Volume Emptied</Text>
                    <Text style={styles.resultValue}>{volumeEmptied?.toFixed(2)} liters</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Previous Level</Text>
                    <Text style={styles.resultValue}>{currentTrashLevel}%</Text>
                  </View>
                  <View style={[styles.resultItem, styles.lastResultItem]}>
                    <Text style={styles.resultLabel}>Current Level</Text>
                    <Text style={styles.resultValue}>{newTrashLevel}%</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.doneButton}
                  onPress={() => {
                    setIsModalVisible(false)
                    setModalScreen("confirmation")
                  }}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  bubbleContainer: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    borderRadius: borderRadius.round,
    ...shadows.large,
  },
  bubble: {
    borderRadius: borderRadius.round,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: spacing.xs,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    ...shadows.medium,
  },
  iconContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.round,
  },
  successIconContainer: {
    backgroundColor: `${colors.success}20`, // 20% opacity
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.primary,
  },
  binName: {
    fontSize: 18,
    marginBottom: spacing.md,
    textAlign: "center",
    color: colors.secondary,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.secondary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  trashLevelText: {
    fontSize: 16,
    marginBottom: spacing.lg,
    color: colors.secondary,
  },
  trashLevelValue: {
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginBottom: spacing.lg,
    textAlign: "center",
    color: colors.secondary,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.lg,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: "100%",
    marginBottom: spacing.lg,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.secondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: spacing.md,
    height: 50,
    ...shadows.small,
  },
  disabledBubble: {
    opacity: 0.7,
  },
})

export default FloatingTrashBubble

