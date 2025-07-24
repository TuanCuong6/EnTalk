// frontend/src/screens/ReadingPracticeScreen.js
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording } from '../api/reading';

export default function ReadingPracticeScreen({ route }) {
  const { reading } = route.params;
  const [audioPath, setAudioPath] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {reading.title} (Level {reading.level})
      </Text>
      <Text style={styles.content}>{reading.content}</Text>

      <View style={{ marginTop: 30 }}>
        <AudioRecorder
          onFinish={async path => {
            setAudioPath(path);
            console.log('✅ Ghi âm xong:', path);
            try {
              const res = await submitRecording(path, reading.id);
              Alert.alert(
                '🎯 Kết quả chấm điểm',
                JSON.stringify(res.data, null, 2),
              );
            } catch (err) {
              console.error('❌ Gửi file lỗi:', err);
              Alert.alert(
                'Lỗi khi gửi file ghi âm',
                err?.response?.data?.message || 'Server lỗi',
              );
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 16 },
});
