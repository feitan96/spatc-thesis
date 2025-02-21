import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../../src/styles/styles";

interface MapSectionProps {
  latitude: number | null;
  longitude: number | null;
  binName: string;
}

const MapSection: React.FC<MapSectionProps> = ({ latitude, longitude, binName }) => {
  const mapRef = useRef<MapView>(null);

  const handleFocus = () => {
    if (mapRef.current && latitude && longitude) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (!latitude || !longitude) return null;

  return (
    <View style={styles.mapSection}>
      <View style={styles.mapHeader}>
        <Text style={styles.sectionTitle}>Bin Location</Text>
        <TouchableOpacity onPress={handleFocus} style={styles.focusIcon}>
          <FontAwesome name="crosshairs" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
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
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
  focusIcon: {
    padding: 8,
  },
});

export default MapSection;