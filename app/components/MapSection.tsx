"use client"

import type React from "react"
import { useRef, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"
import { colors } from "../../src/styles/styles"

interface MapSectionProps {
  latitude: number | null
  longitude: number | null
  binName: string
}

const MapSection: React.FC<MapSectionProps> = ({ latitude, longitude, binName }) => {
  const mapRef = useRef<MapView>(null)
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard")
  const [expanded, setExpanded] = useState(false)

  const handleFocus = () => {
    if (mapRef.current && latitude && longitude) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
    }
  }

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"))
  }

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  if (!latitude || !longitude) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bin Location</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleMapType} style={styles.controlButton}>
            <MaterialIcons name={mapType === "standard" ? "satellite" : "map"} size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFocus} style={styles.controlButton}>
            <FontAwesome name="crosshairs" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpanded} style={styles.controlButton}>
            <MaterialIcons name={expanded ? "fullscreen-exit" : "fullscreen"} size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={[styles.map, expanded && styles.expandedMap]}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={binName}
          description="Real-time location"
          pinColor={colors.primary}
        />
      </MapView>

      {/* <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinatesLabel}>Coordinates</Text>
        <Text style={styles.coordinates}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
      </View> */}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  controls: {
    flexDirection: "row",
  },
  controlButton: {
    width: 36,
    height: 36,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
  },
  expandedMap: {
    height: 400,
  },
  coordinatesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
})

export default MapSection

