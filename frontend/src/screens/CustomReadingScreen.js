//frontend/src/screens/CustomReadingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import textRecognition from '@react-native-ml-kit/text-recognition';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording } from '../api/reading';

export default function CustomReadingScreen({ route }) {
  const { customText: incomingText } = route.params || {};
  const [customText, setCustomText] = useState(incomingText || '');
  const [showRecorder, setShowRecorder] = useState(!!incomingText);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  const handleRescanImage = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 1 });
      if (result.didCancel || !result.assets?.[0]?.uri) return;

      const ocrResult = await textRecognition.recognize(result.assets[0].uri);
      const text = ocrResult?.text?.trim();

      if (!text || text.split(/\s+/).length < 4) {
        Alert.alert(
          'Không nhận diện được văn bản rõ ràng',
          'Ảnh có thể quá mờ, quá ít chữ, hoặc không chứa văn bản. Vui lòng chụp lại.',
        );
        return;
      }

      setCustomText(text);
      setShowRecorder(true);
    } catch (err) {
      console.error('❌ OCR lỗi:', err);
      Alert.alert('Lỗi khi quét ảnh', err.message || 'Không rõ nguyên nhân');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xoá toàn bộ nội dung?',
      'Bạn có chắc chắn muốn xoá và nhập lại từ đầu không?',
      [
        { text: 'Huỷ' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setCustomText('');
              setShowRecorder(false);
              fadeAnim.setValue(1);
            });
          },
        },
      ],
    );
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

      <View style={styles.buttonGroup}>
        {!showRecorder && (
          <Button title="🚀 Bắt đầu luyện đọc" onPress={handleStartPractice} />
        )}
        {!showRecorder && (
          <Button title="📸 Quét ảnh văn bản" onPress={handleRescanImage} />
        )}
        {showRecorder && (
          <Button title="📸 Chụp lại ảnh văn bản" onPress={handleRescanImage} />
        )}
      </View>

      {showRecorder && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.previewTitle}>📖 Nội dung bạn sẽ đọc:</Text>
          <Text style={styles.preview}>{customText}</Text>

          <AudioRecorder onFinish={handleFinishRecording} />

          <View style={styles.clearButtonContainer}>
            <Button
              title="🗑️ Xoá tất cả"
              color="#b94a46ff"
              onPress={handleClearAll}
            />
          </View>
        </Animated.View>
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
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  previewTitle: { fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
  preview: { fontSize: 16, marginBottom: 20 },
  clearButtonContainer: { marginTop: 16 },
});
