//frontend/src/screens/AccountScreen.js
import React, { useContext } from 'react';
import { View, Button, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function AccountScreen() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    Alert.alert('Đã đăng xuất');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Đăng xuất" onPress={handleLogout} />
    </View>
  );
}
