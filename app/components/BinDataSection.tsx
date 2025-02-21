import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/styles/styles";

interface BinDataSectionProps {
  distance: number | null;
  validatedTrashLevel: number;
  gps: {
    altitude: number | null;
    latitude: number | null;
    longitude: number | null;
  };
}

const BinDataSection: React.FC<BinDataSectionProps> = ({ distance, validatedTrashLevel, gps }) => {
  return (
    <View style={styles.dataSection}>
      <Text style={styles.dataText}>Distance: {distance} cm</Text>
      <Text style={styles.dataText}>Validated Trash Level: {validatedTrashLevel}%</Text>
      <Text style={styles.dataText}>Altitude: {gps.altitude}</Text>
      <Text style={styles.dataText}>Latitude: {gps.latitude}</Text>
      <Text style={styles.dataText}>Longitude: {gps.longitude}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dataSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  dataText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 8,
  },
});

export default BinDataSection;