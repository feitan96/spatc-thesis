import React from 'react'
import AdminBottomBar from "../components/AdminBottomBar"
import { globalStyles } from "../../src/styles/styles";
import { View, Text } from "react-native";

const Analytics = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Analytics</Text>
        <Text style={globalStyles.text}>Analytics data will be displayed here.</Text>
      </View>
      <AdminBottomBar />
    </View>
  )
}

export default Analytics