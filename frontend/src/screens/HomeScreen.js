// frontend/src/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 EnTalk - Luyện đọc tiếng Anh</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TopicList')}
      >
        <Text style={styles.buttonText}>📂 Xem bài đọc theo chủ đề</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CustomReadingScreen')}
      >
        <Text style={styles.buttonText}>📝 Tự nhập nội dung để luyện</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: { color: 'white', fontSize: 16, textAlign: 'center' },
});
