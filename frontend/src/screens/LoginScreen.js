//frontend/src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { login as apiLogin } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { setupFCM } from '../utils/notification';
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      const res = await apiLogin({ email, password });
      console.log('🎯 API login response:', res.data);
      const { token, user } = res.data;

      await login(token, user);
      await setupFCM();
      Alert.alert('Đăng nhập thành công');
    } catch (err) {
      console.log('❌ Login failed error:', err?.response?.data || err.message);
      Alert.alert('Đăng nhập thất bại', err.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <View>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Text>Mật khẩu</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Đăng nhập" onPress={handleLogin} />
      <Button
        title="Chưa có tài khoản? Đăng ký"
        onPress={() => navigation.navigate('Register')}
      />
      <Button
        title="Quên mật khẩu?"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </View>
  );
}
