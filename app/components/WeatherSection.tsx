import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/styles/styles";

interface WeatherSectionProps {
  weather: {
    weather: { description: string }[];
    main: { temp: number; humidity: number };
    wind: { speed: number };
  } | null;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ weather }) => {
  if (!weather) return null;

  return (
    <View style={styles.weatherSection}>
      <Text style={styles.sectionTitle}>Weather Information</Text>
      <Text style={styles.dataText}>Weather: {weather.weather[0].description}</Text>
      <Text style={styles.dataText}>Temperature: {weather.main.temp}°C</Text>
      <Text style={styles.dataText}>Humidity: {weather.main.humidity}%</Text>
      <Text style={styles.dataText}>Wind Speed: {weather.wind.speed} m/s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  dataText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
});

export default WeatherSection;