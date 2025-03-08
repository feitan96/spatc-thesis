// components/FloatingTrashBubble.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
import { colors } from "../../src/styles/styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebaseConfig";
import { useAuth } from "../auth/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface FloatingTrashBubbleProps {
  binName: string;
}

const FloatingTrashBubble: React.FC<FloatingTrashBubbleProps> = ({ binName }) => {
  const [validatedTrashLevel, setValidatedTrashLevel] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState<"confirmation" | "emptying" | "results">("confirmation");
  const [currentTrashLevel, setCurrentTrashLevel] = useState<number | null>(null);
  const [newTrashLevel, setNewTrashLevel] = useState<number | null>(null);
  const [volumeEmptied, setVolumeEmptied] = useState<number | null>(null);
  const { firstName, lastName, userId } = useAuth();

  // Fetch trashLevel from Firebase
  useEffect(() => {
    if (binName) {
      const trashLevelRef = ref(database, `${binName}/trashLevel`);
      const unsubscribe = onValue(trashLevelRef, (snapshot) => {
        const trashLevel = snapshot.val();
        if (trashLevel !== null) {
          setValidatedTrashLevel(trashLevel);
        }
      });
      return () => unsubscribe();
    }
  }, [binName]);

  // Calculate volume of trash emptied
  const calculateVolume = (trashLevel: number) => {
    const r = 10; // Radius in cm
    const h = 24; // Height of cylindrical section in cm

    // Volume of the cylindrical part
    const V_cylinder = Math.PI * Math.pow(r, 2) * h;

    // Volume of the hemispherical bottom
    const V_hemisphere = (2 / 3) * Math.PI * Math.pow(r, 3);

    // Total volume in cm³
    const V_total = V_cylinder + V_hemisphere;

    // Convert to liters (1 liter = 1000 cm³)
    const volumeLiters = (V_total * (trashLevel / 100)) / 1000;

    return volumeLiters;
  };

  // Post emptying data to Firestore
  const postTrashEmptying = async (volume: number) => {
    try {
      await addDoc(collection(db, "trashEmptying"), {
        bin: binName,
        volume: volume,
        collector: `${firstName} ${lastName}`,
        userId, // Include the user ID
        emptiedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error posting trash emptying data: ", error);
    }
  };

  // Handle emptying process
  const handleEmptyTrash = async () => {
    if (currentTrashLevel !== null) {
      setModalScreen("emptying");
      setNewTrashLevel(null);
      setVolumeEmptied(null);
    }
  };

  // Handle "Done" button click
  const handleDone = () => {
    if (currentTrashLevel !== null) {
      // Listen for changes in trashLevel
      const trashLevelRef = ref(database, `${binName}/trashLevel`);
      onValue(trashLevelRef, (snapshot) => {
        const updatedTrashLevel = snapshot.val();
        if (updatedTrashLevel !== null && updatedTrashLevel !== currentTrashLevel) {
          setNewTrashLevel(updatedTrashLevel);
          const volume = calculateVolume(currentTrashLevel - updatedTrashLevel);
          setVolumeEmptied(volume);
          postTrashEmptying(volume);
          setModalScreen("results");
        }
      });
    }
  };

  if (validatedTrashLevel === null) {
    return null;
  }

  return (
    <>
      {/* Floating Bubble */}
      <TouchableOpacity
        style={styles.bubbleContainer}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8} // Add a slight opacity effect on press
      >
        <View style={styles.bubble}>
          <Icon name="trash-can-outline" size={24} color={colors.white} />
          <Text style={styles.text}>{validatedTrashLevel}%</Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {modalScreen === "confirmation" && (
        <>
          <Text style={styles.modalTitle}>Empty Trashbin: {binName}?</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.buttonText}>No</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                setCurrentTrashLevel(validatedTrashLevel);
                handleEmptyTrash();
              }}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </Pressable>
          </View>
        </>
      )}

      {modalScreen === "emptying" && (
        <>
          <Text style={styles.modalTitle}>Emptying Trashbin...</Text>
          <Text style={styles.modalText}>Current Trash Level: {currentTrashLevel}%</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={handleDone}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          </View>
        </>
      )}

      {modalScreen === "results" && (
        <>
          <Text style={styles.modalTitle}>Trash Emptied Successfully!</Text>
          <Text style={styles.modalText}>Volume Emptied: {volumeEmptied?.toFixed(2)} liters</Text>
          <Text style={styles.modalText}>New Trash Level: {newTrashLevel}%</Text>
          <Pressable style={[styles.button, styles.confirmButton]} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>Confirm</Text>
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
    bottom: 80,
    right: 20,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  bubble: {
    backgroundColor: colors.primary,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.primary,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
    minHeight: 50,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FloatingTrashBubble;