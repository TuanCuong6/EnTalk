//frontend/src/screens/AccountScreen.js
import React, { useState, useContext } from 'react';
import { Image, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme, Switch } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { getProfile } from '../api/account';
import { useFocusEffect } from '@react-navigation/native';

export default function AccountScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const { colors } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      getProfile().then(res => setProfile(res.data));
    }, []),
  );

  if (!profile) return null;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Surface
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <Surface style={styles.placeholder}>
            <Text style={{ color: colors.onSurfaceVariant }}>Ảnh</Text>
          </Surface>
        )}

        <Text
          variant="titleLarge"
          style={{ marginBottom: 20, color: colors.onSurface }}
        >
          {profile.name}
        </Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.button}
        >
          Cập nhật thông tin
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('ChangePassword')}
          style={styles.button}
        >
          Đổi mật khẩu
        </Button>

        <Surface style={styles.themeToggle}>
          <Text style={{ color: colors.onSurface, marginBottom: 8 }}>
            Giao diện: {isDark ? 'Tối 🌙' : 'Sáng ☀️'}
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </Surface>

        <Button
          mode="contained"
          onPress={logout}
          buttonColor="#FF4C4C"
          textColor="white"
          style={styles.logoutButton}
        >
          Đăng xuất
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  logoutButton: {
    width: '100%',
    marginTop: 20,
  },
  themeToggle: {
    marginTop: 30,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
});
