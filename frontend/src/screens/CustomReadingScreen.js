//frontend/src/screens/CustomReadingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording } from '../api/reading';

export default function CustomReadingScreen() {
  const [customText, setCustomText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);

  const handleStartPractice = () => {
    if (!customText.trim()) {
      Alert.alert('Vui lòng nhập nội dung để luyện đọc');
      return;
    }
    setShowRecorder(true);
  };

  const handleFinishRecording = async path => {
    try {
      const res = await submitRecording(path, null, customText);
      Alert.alert('🎯 Kết quả chấm điểm', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error('❌ Lỗi gửi file:', err);
      Alert.alert(
        'Lỗi khi gửi file ghi âm',
        err?.response?.data?.message || 'Server lỗi',
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>📝 Nhập đoạn văn bạn muốn luyện:</Text>
      <TextInput
        multiline
        placeholder="Ví dụ: The quick brown fox jumps over the lazy dog..."
        style={styles.input}
        value={customText}
        onChangeText={setCustomText}
      />
      {!showRecorder && (
        <Button title="🚀 Bắt đầu luyện đọc" onPress={handleStartPractice} />
      )}
      {showRecorder && (
        <>
          <Text style={styles.previewTitle}>📖 Nội dung bạn sẽ đọc:</Text>
          <Text style={styles.preview}>{customText}</Text>
          <AudioRecorder onFinish={handleFinishRecording} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    minHeight: 120,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  previewTitle: { fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
  preview: { fontSize: 16, marginBottom: 20 },
});
