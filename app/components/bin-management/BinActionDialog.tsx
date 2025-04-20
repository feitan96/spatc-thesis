import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native"
import { colors } from "../../../src/styles/styles"
import { Info, Users } from "lucide-react-native"

interface BinActionDialogProps {
  visible: boolean
  binName: string | null
  onClose: () => void
  onViewDetails: () => void
  onManageUsers: () => void
  showManageOption: boolean
}

const BinActionDialog = ({
  visible,
  binName,
  onClose,
  onViewDetails,
  onManageUsers,
  showManageOption,
}: BinActionDialogProps) => {
  if (!visible || !binName) return null

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>Bin: {binName}</Text>
              <Text style={styles.subtitle}>What would you like to do?</Text>

              <TouchableOpacity style={styles.option} onPress={onViewDetails}>
                <View style={styles.iconContainer}>
                  <Info size={20} color={colors.white} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>View Details</Text>
                  <Text style={styles.optionDescription}>See bin status, fill level, and other information</Text>
                </View>
              </TouchableOpacity>

              {showManageOption && (
                <TouchableOpacity style={styles.option} onPress={onManageUsers}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
                    <Users size={20} color={colors.white} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Manage Users</Text>
                    <Text style={styles.optionDescription}>Assign or unassign users to this bin</Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.secondary,
  },
  cancelButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "500",
  },
})

export default BinActionDialog

