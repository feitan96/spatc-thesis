import type React from "react"
import { View, Text, StyleSheet, Image } from "react-native"
import { colors } from "../../src/styles/styles"
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons"

interface WeatherSectionProps {
  weather: {
    weather: { description: string; icon: string }[]
    main: { temp: number; humidity: number }
    wind: { speed: number }
  } | null
  tideData: {
    currentTide: number
    nextHighTide: string
    nextLowTide: string
  } | null
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ weather, tideData }) => {
  if (!weather) return null

  // Capitalize first letter of each word in weather description
  const formatWeatherDescription = (description: string) => {
    return description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Information</Text>

      <View style={styles.weatherMain}>
        <View style={styles.weatherIconContainer}>
          <Image source={{ uri: getWeatherIconUrl(weather.weather[0].icon) }} style={styles.weatherIcon} />
          <Text style={styles.weatherDescription}>{formatWeatherDescription(weather.weather[0].description)}</Text>
        </View>

        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.weatherDetails}>
        <View style={styles.weatherItem}>
          <View style={styles.iconContainer}>
            <Feather name="droplet" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.itemLabel}>Humidity</Text>
            <Text style={styles.itemValue}>{weather.main.humidity}%</Text>
          </View>
        </View>

        <View style={styles.weatherItem}>
          <View style={styles.iconContainer}>
            <Feather name="wind" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.itemLabel}>Wind Speed</Text>
            <Text style={styles.itemValue}>{weather.wind.speed} m/s</Text>
          </View>
        </View>

        {tideData && (
          <View style={styles.weatherItem}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="wave" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.itemLabel}>Current Tide</Text>
              <Text style={styles.itemValue}>{tideData.currentTide} m</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weatherIconContainer: {
    alignItems: "center",
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  weatherDescription: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
  },
  temperatureContainer: {
    alignItems: "center",
  },
  temperature: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  weatherDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weatherItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.secondary,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
})

export default WeatherSection

