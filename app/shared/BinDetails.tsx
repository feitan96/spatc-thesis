"use client"

import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet, StatusBar, RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ref, onValue } from "firebase/database"
import { database, db } from "../../firebaseConfig"
import { useLocalSearchParams } from "expo-router"
import axios from "axios"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"
import { format, toZonedTime } from "date-fns-tz"
import { colors } from "../../src/styles/styles"
import Spinner from "../components/Spinner"
import Header from "../components/Header"
import BinDataSection from "../components/BinDataSection"
import WeatherSection from "../components/WeatherSection"
import MapSection from "../components/MapSection"
import NotificationModal from "../modals/NotificationModal"
import AdminBottomBar from "../components/AdminBottomBar"
import UserBottomBar from "../components/UserBottomBar"
import { useAuth } from "../../src/auth/AuthContext"
import TrashLevelChart from "../components/TrashLevelChart"
import FloatingTrashBubble from "../components/FloatingTrashBubble"

interface Notification {
  trashLevel: number
  datetime: string
  bin: string
}

interface WeatherData {
  weather: { description: string; icon: string }[]
  main: { temp: number; humidity: number }
  wind: { speed: number }
}

interface TideData {
  currentTide: number
  nextHighTide: string
  nextLowTide: string
}

const BinDetails = () => {
  const { binName } = useLocalSearchParams<{ binName: string }>()
  const [trashLevel, setTrashLevel] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const API_KEY = "d1b379e89fe87076140d9462009828b2"
  const WORLD_TIDES_API_KEY = "490af8cc-8cb4-4c81-a717-be6b6c718762"

  const [binData, setBinData] = useState({
    distance: null,
    gps: {
      altitude: null,
      latitude: null,
      longitude: null,
    },
  })

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [tideData, setTideData] = useState<TideData | null>(null)

  const { userRole } = useAuth()

  // Fetch bin data
  useEffect(() => {
    if (binName) {
      const binRef = ref(database, binName)
      const unsubscribe = onValue(binRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const newDistance = data["distance(cm)"]
          setBinData({
            distance: newDistance,
            gps: data.gps,
          })

          if (newDistance <= 100) {
            setIsValidating(true)
          } else {
            setIsValidating(false)
          }
        }
        setIsLoading(false)
      })

      return () => unsubscribe()
    }
  }, [binName])

  // Calculate trash level percentage
  useEffect(() => {
    const calculateTrashLevel = (distance: number): number => {
      const maxDistance = 60
      const minDistance = 2
      if (distance >= maxDistance) return 0
      if (distance <= minDistance) return 60
      return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100)
    }

    if (binData.distance !== null) {
      const level = calculateTrashLevel(binData.distance)
      setTrashLevel(level)
    }
  }, [binData.distance])

  // Validate trash level and add notification
  useEffect(() => {
    if (isValidating) {
      const timer = setTimeout(async () => {
        if (binData.distance !== null && binData.distance <= 100) {
          if ([90, 95, 100].includes(trashLevel)) {
            const now = new Date()
            const timeZone = "Asia/Manila"
            const zonedDate = toZonedTime(now, timeZone)
            const formattedDatetime = format(zonedDate, "yyyy-MM-dd hh:mm:ss aa")
            const notification = { trashLevel, datetime: formattedDatetime, bin: binName }
            setHasNewNotifications(true)
            setNotifications((prev) => [...prev, notification])
          }
        }
        setIsValidating(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isValidating, binData.distance, trashLevel])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!binName) return

      try {
        const querySnapshot = await getDocs(collection(db, "notifications"))
        const fetchedNotifications = querySnapshot.docs
          .map((doc) => {
            const data = doc.data()
            return {
              trashLevel: data.trashLevel,
              datetime: data.datetime,
              bin: data.bin,
            }
          })
          .filter((notification) => notification.bin === binName)

        fetchedNotifications.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
        setNotifications(fetchedNotifications)
      } catch (error) {
        console.error("Error fetching notifications: ", error)
      }
    }

    fetchNotifications()
  }, [binName])

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (binData.gps.latitude && binData.gps.longitude) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&appid=${API_KEY}&units=metric`,
          )
          setWeather(response.data)
        } catch (error) {
          console.error("Error fetching weather data: ", error)
        }
      }
    }

    fetchWeather()
  }, [binData.gps.latitude, binData.gps.longitude])

  // Post trash level to Firestore
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const postTrashLevel = async () => {
      try {
        const lastPostKey = `lastPost_${binName}`
        const lastPostTimestamp = await AsyncStorage.getItem(lastPostKey)
        const currentTime = new Date().getTime()

        if (lastPostTimestamp && currentTime - Number(lastPostTimestamp) < 1 * 60 * 1000) {
          return
        }

        await addDoc(collection(db, "trashLevels"), {
          bin: binName,
          trashLevel: trashLevel,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        await AsyncStorage.setItem(lastPostKey, currentTime.toString())
      } catch (error) {
        console.error("Error posting trash level: ", error)
      }
    }

    if (binName && trashLevel !== null) {
      timeoutId = setTimeout(() => {
        postTrashLevel()
      }, 10000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [binName, trashLevel])

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)

    // Fetch weather data
    if (binData.gps.latitude && binData.gps.longitude) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${binData.gps.latitude}&lon=${binData.gps.longitude}&appid=${API_KEY}&units=metric`,
        )
        setWeather(response.data)
      } catch (error) {
        console.error("Error fetching weather data: ", error)
      }
    }

    // Fetch notifications
    try {
      const querySnapshot = await getDocs(collection(db, "notifications"))
      const fetchedNotifications = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            trashLevel: data.trashLevel,
            datetime: data.datetime,
            bin: data.bin,
          }
        })
        .filter((notification) => notification.bin === binName)

      fetchedNotifications.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      setNotifications(fetchedNotifications)
    } catch (error) {
      console.error("Error fetching notifications: ", error)
    }

    setRefreshing(false)
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        title={binName || "Unknown"}
        onNotificationPress={() => setIsModalVisible(true)}
        hasNewNotifications={hasNewNotifications}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <BinDataSection distance={binData.distance} gps={binData.gps} trashLevel={trashLevel} />

        <WeatherSection weather={weather} tideData={tideData} />

        <TrashLevelChart binName={binName} />

        <MapSection latitude={binData.gps.latitude} longitude={binData.gps.longitude} binName={binName || "Unknown"} />
      </ScrollView>

      <FloatingTrashBubble binName={binName} />

      <NotificationModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          setHasNewNotifications(false)
        }}
        notifications={notifications}
      />

      {userRole === "admin" ? <AdminBottomBar /> : <UserBottomBar />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
})

export default BinDetails

