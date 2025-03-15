import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
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

interface BinAssignment {
  id: string;
  bin: string;
  assignee: string[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bins, setBins] = useState<BinAssignment[]>([]);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [selectedAssignedUser, setSelectedAssignedUser] = useState<string | null>(null);

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

  // Fetch all bins from binAssignments collection
  useEffect(() => {
    const fetchBins = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "binAssignments"));
        const fetchedBins: BinAssignment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedBins.push({
            id: doc.id,
            bin: data.bin,
            assignee: data.assignee || [],
          });
        });
        setBins(fetchedBins);
      } catch (error) {
        console.error("Error fetching bins: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBins();
  }, []);

  // Update available and assigned users when a bin is selected
  useEffect(() => {
    if (selectedBin) {
      const selectedBinData = bins.find((bin) => bin.bin === selectedBin);
      if (selectedBinData) {
        const assignedUserIds = selectedBinData.assignee;
        const filteredUsers = users.filter((user) => !assignedUserIds.includes(user.id));
        const assignedUsersList = users.filter((user) => assignedUserIds.includes(user.id));
        setAvailableUsers(filteredUsers);
        setAssignedUsers(assignedUsersList);
      }
    } else {
      setAvailableUsers([]);
      setAssignedUsers([]);
    }
  }, [selectedBin, bins, users]);

  // Handle bin selection
  const handleBinSelect = (bin: string | null) => {
    setSelectedBin(bin);
    setSelectedAssignedUser(null); // Reset selected assigned user
  };

  // Handle user assignment to bin
  const handleAssignUser = async (userId: string) => {
    if (!selectedBin) return;

    setIsLoading(true);
    try {
      const selectedBinData = bins.find((bin) => bin.bin === selectedBin);
      if (selectedBinData) {
        const binDocRef = doc(db, "binAssignments", selectedBinData.id);
        await updateDoc(binDocRef, {
          assignee: [...selectedBinData.assignee, userId],
        });
        alert("User assigned successfully!");
        setSelectedBin(null); // Reset selected bin
      }
    } catch (error) {
      console.error("Error assigning user: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user unassignment from bin
  const handleUnassignUser = async () => {
    if (!selectedBin || !selectedAssignedUser) return;

    setIsLoading(true);
    try {
      const selectedBinData = bins.find((bin) => bin.bin === selectedBin);
      if (selectedBinData) {
        const binDocRef = doc(db, "binAssignments", selectedBinData.id);
        const updatedAssignee = selectedBinData.assignee.filter((id) => id !== selectedAssignedUser);
        await updateDoc(binDocRef, {
          assignee: updatedAssignee,
        });
        alert("User unassigned successfully!");
        setSelectedBin(null); // Reset selected bin
        setSelectedAssignedUser(null); // Reset selected assigned user
      }
    } catch (error) {
      console.error("Error unassigning user: ", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
        </View> */}

        {/* Bin Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign/Unassign User to/from Bin</Text>
          <Picker
            selectedValue={selectedBin}
            onValueChange={(itemValue) => handleBinSelect(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a bin" value={null} />
            {bins.map((bin) => (
              <Picker.Item key={bin.id} label={bin.bin} value={bin.bin} />
            ))}
          </Picker>

          {/* Assign User Section */}
          {selectedBin && (
            <>
              <Text style={styles.subSectionTitle}>Assign User</Text>
              <Picker
                selectedValue={null}
                onValueChange={(itemValue) => {
                  if (itemValue) handleAssignUser(itemValue);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select a user to assign" value={null} />
                {availableUsers.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={`${user.firstName} ${user.lastName}`}
                    value={user.id}
                  />
                ))}
              </Picker>
            </>
          )}

          {/* Unassign User Section */}
          {selectedBin && assignedUsers.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>Unassign User</Text>
              <Picker
                selectedValue={selectedAssignedUser}
                onValueChange={(itemValue) => setSelectedAssignedUser(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select a user to unassign" value={null} />
                {assignedUsers.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={`${user.firstName} ${user.lastName}`}
                    value={user.id}
                  />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUnassignUser}
                disabled={!selectedAssignedUser}
              >
                <Text style={styles.confirmButtonText}>Confirm Unassign</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* User List */}
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
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
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