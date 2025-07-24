//frontend/src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { register } from "../api/auth";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email không hợp lệ", "Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    try {
      await register({ name, email, password });
      Alert.alert("Đăng ký thành công", "Vui lòng kiểm tra email để xác nhận");
      navigation.navigate("VerifyEmail", { name, email, password });
    } catch (err) {
      console.log("Register error:", err?.response?.data);
      Alert.alert("Lỗi", err.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  return (
    <View>
      <Text>Tên</Text>
      <TextInput value={name} onChangeText={setName} />
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Text>Mật khẩu</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Đăng ký" onPress={handleRegister} />
      <Button
        title="Đã có tài khoản? Đăng nhập"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}
