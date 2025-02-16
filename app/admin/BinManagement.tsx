import React from 'react'
import AdminBottomBar from "../components/AdminBottomBar"
import { colors, globalStyles } from "../../src/styles/styles";
import { View, Text, StyleSheet } from "react-native";


const BinManagement = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Bin Management</Text>
        <Text style={globalStyles.text}>Bins data will be displayed here.</Text>
      </View>
      <AdminBottomBar />
    </View>
  )
}

export default BinManagement