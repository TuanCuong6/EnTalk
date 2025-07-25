//frontend/src/screens/AccountScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../api/account';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getProfile().then(res => setProfile(res.data));
    }, []),
  );

  if (!profile) return null;

  return (
    <View style={styles.container}>
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholder}>
          <Text>Ảnh</Text>
        </View>
      )}
      <Text style={styles.name}>{profile.name}</Text>
      <Button
        title="Cập nhật thông tin"
        onPress={() => navigation.navigate('EditProfile')}
      />
      <Button
        title="Đổi mật khẩu"
        onPress={() => navigation.navigate('ChangePassword')}
      />
      <Button title="Đăng xuất" onPress={logout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
});
