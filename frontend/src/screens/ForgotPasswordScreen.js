//frontend/src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { forgotPassword } from '../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    try {
      await forgotPassword({ email });
      Alert.alert('Đã gửi', 'Mật khẩu mới đã được gửi về email');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi xảy ra');
    }
  };

  return (
    <View>
      <Text>Nhập email để nhận mật khẩu mới</Text>
      <TextInput value={email} onChangeText={setEmail} />
      <Button title="Gửi mật khẩu mới" onPress={handleReset} />
    </View>
  );
}
