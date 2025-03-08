import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Trash2 } from "react-native-feather";
import { colors } from "../../src/styles/styles";

interface TrashLevelBubbleProps {
  trashLevel: number;
}

const TrashLevelBubble: React.FC<TrashLevelBubbleProps> = ({ trashLevel }) => {
  return (
    <View style={styles.bubbleContainer}>
      <View style={styles.bubble}>
        <Trash2 stroke={colors.white} width={24} height={24} />
        <Text style={styles.percentage}>{trashLevel}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  bubble: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  percentage: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default TrashLevelBubble;