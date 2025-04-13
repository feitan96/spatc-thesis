"use client"

import type React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Animated } from "react-native"
import { colors, shadows, trashLevels } from "../../src/styles/styles"
import { Bell, X, AlertTriangle, Clock, Trash2, MapPin } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"

interface NotificationModalProps {
  visible: boolean
  onClose: () => void
  notifications: {
    trashLevel: number
    datetime: any
    bin?: string
    id?: string
    isRead?: boolean
    gps?: {
      latitude: number
      longitude: number
      altitude: number
    }
  }[]
}

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose, notifications }) => {
  const slideAnim = useRef(new Animated.Value(0)).current
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (visible) {
      setShowContent(true)
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowContent(false)
      })
    }
  }, [visible])

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  // Format timestamp function
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return "Unknown time"

    try {
      // Handle Firestore timestamp
      if (timestamp?.toDate) {
        return format(timestamp.toDate(), "MMM d, yyyy - h:mm a")
      }

      // Handle string date
      if (typeof timestamp === "string") {
        return timestamp
      }

      // Handle Date object
      if (timestamp instanceof Date) {
        return format(timestamp, "MMM d, yyyy - h:mm a")
      }

      return "Unknown time"
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return "Unknown time"
    }
  }

  if (!showContent && !visible) return null

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <SafeAreaView style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Bell size={24} color={colors.white} style={styles.titleIcon} />
                <Text style={styles.modalTitle}>Notifications</Text>
              </View>
              {/* <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={22} color={colors.white} />
              </TouchableOpacity> */}
            </View>
          </LinearGradient>

          {/* Notification count */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
            </Text>
          </View>

          {/* Notifications list */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bell size={48} color={colors.tertiary} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyText}>You don't have any notifications at the moment.</Text>
              </View>
            ) : (
              notifications.map((notification, index) => {
                const statusColor = trashLevels.getColor(notification.trashLevel)
                const isCritical = notification.trashLevel >= 90
                const formattedTime = formatTimestamp(notification.datetime)

                return (
                  <View
                    key={notification.id || index}
                    style={[
                      styles.notificationItem,
                      index === notifications.length - 1 && styles.lastNotificationItem,
                      notification.isRead === false && styles.unreadNotification,
                    ]}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
                      {isCritical ? (
                        <AlertTriangle size={22} color={statusColor} />
                      ) : (
                        <Trash2 size={22} color={statusColor} />
                      )}
                    </View>

                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.binName}>{notification.bin || "Trash Bin"}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.levelBadgeText}>{notification.trashLevel}%</Text>
                        </View>
                      </View>

                      <View style={styles.timeContainer}>
                        <Clock size={14} color={colors.tertiary} />
                        <Text style={styles.timeText}>{formattedTime}</Text>
                      </View>

                      {notification.gps && (
                        <View style={styles.gpsContainer}>
                          <MapPin size={14} color={colors.tertiary} style={styles.gpsIcon} />
                          <Text style={styles.gpsText}>
                            {notification.gps.latitude.toFixed(4)}, {notification.gps.longitude.toFixed(4)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )
              })
            )}
          </ScrollView>

          {/* Close button at bottom */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.dismissButton} onPress={handleClose} activeOpacity={0.8}>
              <Text style={styles.dismissButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    ...shadows.large,
  },
  header: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  countText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "500",
  },
  scrollView: {
    maxHeight: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginVertical: 8,
    ...shadows.small,
    borderLeftWidth: 0,
  },
  lastNotificationItem: {
    marginBottom: 16,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  binName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    color: colors.tertiary,
    marginLeft: 4,
  },
  gpsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  gpsIcon: {
    marginRight: 4,
  },
  gpsText: {
    fontSize: 12,
    color: colors.tertiary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  dismissButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    ...shadows.small,
  },
  dismissButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default NotificationModal

