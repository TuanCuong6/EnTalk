// frontend/src/screens/ReadingPracticeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording, getReadingById } from '../api/reading';

export default function ReadingPracticeScreen({ route }) {
  const { readingId, reading: readingFromParams } = route.params || {};
  const [reading, setReading] = useState(readingFromParams || null);
  const [audioPath, setAudioPath] = useState(null);
  const [loading, setLoading] = useState(readingFromParams ? false : true);

  useEffect(() => {
    if (!reading && readingId) {
      const fetchReading = async () => {
        try {
          const res = await getReadingById(readingId);
          setReading(res.data);
        } catch (err) {
          Alert.alert('Lỗi', 'Không lấy được bài đọc');
        } finally {
          setLoading(false);
        }
      };
      fetchReading();
    }
  }, [readingId]);

  if (loading || !reading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {reading.title || 'Bài đọc'} (Level {reading.level || 'N/A'})
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
