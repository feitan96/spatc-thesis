import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  ActivityIndicator,
  Animated
} from "react-native";
import { ref, onValue } from "firebase/database";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { database, db } from "../../firebaseConfig";
import { useAuth } from "../../src/auth/AuthContext";

// You may want to update these colors in your styles file
const colors = {
  primary: "#3B82F6", // Modern blue
  primaryDark: "#2563EB",
  secondary: "#64748B",
  white: "#FFFFFF",
  background: "#F8FAFC",
  error: "#EF4444",
  success: "#10B981",
  text: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
  overlay: "rgba(15, 23, 42, 0.6)"
};

interface FloatingTrashBubbleProps {
  binName: string;
}

const FloatingTrashBubble: React.FC<FloatingTrashBubbleProps> = ({ binName }) => {
  const [trashLevel, setTrashLevel] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState<"confirmation" | "emptying" | "results">("confirmation");
  const [currentTrashLevel, setCurrentTrashLevel] = useState<number | null>(null);
  const [newTrashLevel, setNewTrashLevel] = useState<number | null>(null);
  const [volumeEmptied, setVolumeEmptied] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { firstName, lastName, userId } = useAuth();
  
  // Animation value for pulse effect
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Start pulse animation when trash level is high
  useEffect(() => {
    if (trashLevel && trashLevel > 80) {
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
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [trashLevel, pulseAnim]);

  // Fetch trashLevel from Firebase
  useEffect(() => {
    if (binName) {
      const trashLevelRef = ref(database, `${binName}/trashLevel`);
      const unsubscribe = onValue(trashLevelRef, (snapshot) => {
        const level = snapshot.val();
        if (level !== null) {
          setTrashLevel(level);
        }
      });
      return () => unsubscribe();
    }
  }, [binName]);

  // Calculate volume of trash emptied (cylinder only)
  const calculateVolume = (trashLevelDifference: number) => {
    const r = 10; // Radius in inches
    const h = 24; // Height in inches

    // Volume of the cylindrical part (π * r^2 * h)
    const V_cylinder = Math.PI * Math.pow(r, 2) * h;

    // Convert total volume from cubic inches to liters
    // (1 cubic inch = 0.016387064 liters)
    const totalVolumeLiters = V_cylinder * 0.016387064;

    // Adjust volume based on trash level percentage
    const volumeLiters = totalVolumeLiters * (trashLevelDifference / 100);

    return volumeLiters;
  };

  // Post emptying data to Firestore
  const postTrashEmptying = async (volume: number) => {
    try {
      await addDoc(collection(db, "trashEmptying"), {
        bin: binName,
        volume: volume,
        collector: `${firstName} ${lastName}`,
        userId,
        emptiedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error posting trash emptying data: ", error);
    }
  };

  // Handle emptying process
  const handleEmptyTrash = () => {
    if (trashLevel !== null) {
      setCurrentTrashLevel(trashLevel);
      setModalScreen("emptying");
      setNewTrashLevel(null);
      setVolumeEmptied(null);
    }
  };

  // Handle "Done" button click
  const handleDone = () => {
    if (currentTrashLevel !== null) {
      setIsLoading(true);
      
      // Create a reference to the trash level
      const trashLevelRef = ref(database, `${binName}/trashLevel`);
      
      // Create a timeout ID for cleanup
      let timeoutId: NodeJS.Timeout;
      
      // Set up the listener and store the unsubscribe function
      const unsubscribeListener = onValue(
        trashLevelRef, 
        (snapshot) => {
          const updatedTrashLevel = snapshot.val();
          
          if (updatedTrashLevel !== null && updatedTrashLevel !== currentTrashLevel) {
            // Clear the timeout since we got a valid response
            if (timeoutId) clearTimeout(timeoutId);
            
            setNewTrashLevel(updatedTrashLevel);
            const levelDifference = currentTrashLevel - updatedTrashLevel;
            const volume = calculateVolume(levelDifference);
            setVolumeEmptied(volume);
            postTrashEmptying(volume);
            setModalScreen("results");
            setIsLoading(false);
            
            // Unsubscribe from the listener
            if (unsubscribeListener) unsubscribeListener();
          }
        },
        {
          // This ensures we only get called when there's an actual change
          onlyOnce: false
        }
      );
      
      // Set a timeout to handle case where trash level doesn't change
      timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          // Unsubscribe from the listener when timing out
          if (unsubscribeListener) unsubscribeListener();
          // Could show an error message here
        }
      }, 10000); // 10 second timeout
    }
  };

  // Get color based on trash level
  const getTrashLevelColor = (level: number) => {
    if (level < 40) return colors.success;
    if (level < 70) return colors.secondary;
    return colors.error;
  };

  if (trashLevel === null) {
    return null;
  }

  return (
    <>
      {/* Floating Bubble */}
      <Animated.View
        style={[
          styles.bubbleContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            { backgroundColor: getTrashLevelColor(trashLevel) }
          ]}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="trash-can-outline" size={24} color={colors.white} />
          <Text style={styles.text}>{trashLevel}%</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalScreen === "confirmation" && (
              <>
                <View style={styles.iconContainer}>
                  <Icon name="trash-can-outline" size={40} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Empty Trash Bin</Text>
                <Text style={styles.binName}>{binName}</Text>
                <Text style={styles.modalText}>
                  Current trash level: <Text style={styles.highlight}>{trashLevel}%</Text>
                </Text>
                <View style={styles.buttonContainer}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.button}
                    onPress={handleEmptyTrash}
                  >
                    <Text style={styles.buttonText}>Empty Now</Text>
                  </Pressable>
                </View>
              </>
            )}

            {modalScreen === "emptying" && (
              <>
                <View style={styles.iconContainer}>
                  <Icon name="progress-clock" size={40} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Emptying in Progress</Text>
                <Text style={styles.modalText}>
                  Please empty the trash bin and press "Done" when finished.
                </Text>
                <Text style={styles.modalText}>
                  Initial trash level: <Text style={styles.highlight}>{currentTrashLevel}%</Text>
                </Text>
                <View style={styles.buttonContainer}>
                  <Pressable 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.button} 
                    onPress={handleDone}
                    disabled={isLoading}
                  >
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
                <View style={styles.iconContainer}>
                  <Icon name="check-circle-outline" size={40} color={colors.success} />
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
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Current Level</Text>
                    <Text style={styles.resultValue}>{newTrashLevel}%</Text>
                  </View>
                </View>
                <Pressable 
                  style={styles.button} 
                  onPress={() => {
                    setIsModalVisible(false);
                    setModalScreen("confirmation");
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
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bubble: {
    borderRadius: 50,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 16,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.text,
  },
  binName: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "500",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: colors.textLight,
    lineHeight: 22,
  },
  highlight: {
    color: colors.primary,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    width: "100%",
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});

export default FloatingTrashBubble;