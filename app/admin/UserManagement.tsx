import React from 'react'
import AdminBottomBar from "../components/AdminBottomBar"
import { globalStyles } from "../../src/styles/styles";
import { View, Text } from "react-native";

const UserManagement = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>User Management</Text>
        <Text style={globalStyles.text}>Users data will be displayed here.</Text>
      </View>
      <AdminBottomBar />
    </View>
  )
}

export default UserManagement