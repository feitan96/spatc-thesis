import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export const UserHome = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({
              type: 'info',
              text1: 'Logged out',
            });
      router.replace('/auth/Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserHome;