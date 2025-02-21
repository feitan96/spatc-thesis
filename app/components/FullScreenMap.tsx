import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../../src/styles/styles";

interface FullScreenMapProps {
  binData: { [key: string]: any };
  onClose: () => void;
}

const FullScreenMap: React.FC<FullScreenMapProps> = ({ binData, onClose }) => {
  // Extract all bin locations
  const binLocations = Object.keys(binData).map((binName) => {
    const bin = binData[binName];
    return {
      name: binName,
      latitude: bin.gps?.latitude,
      longitude: bin.gps?.longitude,
    };
  }).filter((bin) => bin.latitude && bin.longitude); // Filter out bins without valid coordinates

  // Calculate the region to fit all markers
  const initialRegion = binLocations.length > 0 ? {
    latitude: binLocations[0].latitude,
    longitude: binLocations[0].longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  } : undefined;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {binLocations.map((bin, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: bin.latitude, longitude: bin.longitude }}
            title={bin.name}
            description={`Real-time location`}
          />
        ))}
      </MapView>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <FontAwesome name="times" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
});

export default FullScreenMap;