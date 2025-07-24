//frontend/src/screens/VerifyEmailScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { verifyEmail } from '../api/auth';

export default function VerifyEmailScreen({ route, navigation }) {
  const { name, email, password } = route.params;
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    try {
      await verifyEmail({ email, code, name, password });
      Alert.alert('Thành công', 'Bạn đã xác minh thành công');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không xác minh được');
    }
  };

  return (
    <View>
      <Text>Nhập mã xác nhận gửi đến email</Text>
      <TextInput value={code} onChangeText={setCode} keyboardType="numeric" />
      <Button title="Xác nhận" onPress={handleVerify} />
    </View>
  );
}
