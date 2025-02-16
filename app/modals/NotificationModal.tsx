import type React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { globalStyles, colors } from "../../src/styles/styles";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: { trashLevel: number; datetime: string }[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose, notifications }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView}>
            {notifications.length === 0 ? ( // Check if notifications array is empty
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>No notifications available.</Text>
              </View>
            ) : (
              notifications.map((notification, index) => (
                <View key={index} style={styles.notificationItem}>
                  <View style={styles.iconContainer}>
                    <FontAwesome
                      name={notification.trashLevel >= 90 ? "exclamation-triangle" : "info-circle"}
                      size={24}
                      color={notification.trashLevel >= 90 ? colors.secondary : colors.primary}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.trashLevelText}>
                      Trash Level: <Text style={styles.trashLevelValue}>{notification.trashLevel}%</Text>
                    </Text>
                    <Text style={styles.datetimeText}>{notification.datetime}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    ...globalStyles.shadow,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    maxHeight: "100%",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  trashLevelText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  trashLevelValue: {
    fontWeight: "bold",
  },
  datetimeText: {
    fontSize: 14,
    color: colors.tertiary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.tertiary,
    textAlign: "center",
  },
});

export default NotificationModal;