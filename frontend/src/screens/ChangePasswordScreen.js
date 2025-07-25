//frontend/src/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { changePassword } from '../api/account';

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = async () => {
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi server');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Mật khẩu cũ"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Nhập lại mật khẩu mới"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Đổi mật khẩu" onPress={handleChange} />
    </View>
  );
}
