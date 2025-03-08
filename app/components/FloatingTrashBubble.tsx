// components/FloatingTrashBubble.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/styles/styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Assuming you're using MaterialCommunityIcons

interface FloatingTrashBubbleProps {
  validatedTrashLevel: number;
}

const FloatingTrashBubble: React.FC<FloatingTrashBubbleProps> = ({ validatedTrashLevel }) => {
  return (
    <View style={styles.bubble}>
      <Icon name="trash-can-outline" size={24} color={colors.white} />
      <Text style={styles.text}>{validatedTrashLevel}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default FloatingTrashBubble;