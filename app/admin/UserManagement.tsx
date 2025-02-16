import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { colors } from "../../src/styles/styles";
import BottomBar from "../components/AdminBottomBar";
import Spinner from "../components/Spinner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  isDeleted: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users with role "user" and isDeleted: false
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === "user" && !data.isDeleted) {
            fetchedUsers.push({
              id: doc.id,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              contactNumber: data.contactNumber,
              address: data.address,
              isDeleted: data.isDeleted,
            });
          }
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle soft delete
  const handleSoftDelete = async (userId: string) => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { isDeleted: true });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId)); // Remove the user from the list
      setIsModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error soft deleting user: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
        </View>

        {users.map((user) => (
          <View key={user.id} style={styles.userItem}>
            <Text style={styles.userText}>
              {user.firstName} {user.lastName}
            </Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                setSelectedUser(user);
                setIsModalVisible(true);
              }}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* User Details Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <Text style={styles.modalTitle}>User Details</Text>
                <Text style={styles.modalText}>First Name: {selectedUser.firstName}</Text>
                <Text style={styles.modalText}>Last Name: {selectedUser.lastName}</Text>
                <Text style={styles.modalText}>Email: {selectedUser.email}</Text>
                <Text style={styles.modalText}>Contact: {selectedUser.contactNumber}</Text>
                <Text style={styles.modalText}>Address: {selectedUser.address}</Text>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleSoftDelete(selectedUser.id)}
                >
                  <Text style={styles.deleteButtonText}>Soft Delete</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  userItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userText: {
    fontSize: 16,
    color: colors.primary,
  },
  viewButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    width: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserManagement;