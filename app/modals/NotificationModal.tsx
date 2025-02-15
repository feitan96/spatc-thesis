import React from 'react';
import { Modal, View, Text, Button, StyleSheet, ScrollView } from 'react-native';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: { trashLevel: number; datetime: string }[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose, notifications }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Notifications</Text>
          <ScrollView style={styles.scrollView}>
            {notifications.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <Text>Trash Level: {notification.trashLevel}%</Text>
                <Text>DateTime: {notification.datetime}</Text>
              </View>
            ))}
          </ScrollView>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 300,
  },
  notificationItem: {
    marginBottom: 10,
  },
});

export default NotificationModal;