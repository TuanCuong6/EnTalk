// frontend/src/screens/RecordDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import { getRecordDetail } from '../api/history';

export default function RecordDetailScreen({ route, navigation }) {
  const { recordId } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRecordDetail(recordId);
        setDetail(res.data);
      } catch (err) {
        console.error('❌ Lỗi lấy chi tiết record:', err);
        Alert.alert(
          '⛔ Thông báo',
          'Bản ghi đã bị xóa hoặc không còn tồn tại.',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [recordId]);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!detail) return null;

  const handleRetry = () => {
    if (detail.is_community_post) {
      navigation.navigate('CustomReadingScreen', {
        customText: detail.reading_content,
      });
    } else {
      navigation.navigate('ReadingPractice', {
        reading: {
          id: detail.reading_id,
          title: detail.topic_name || 'Không rõ',
          level: 'A1',
          content: detail.reading_content,
        },
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📖 Nội dung đã đọc:</Text>
      <Text style={styles.text}>{detail.reading_content}</Text>

      <Text style={styles.title}>🗣 Transcript:</Text>
      <Text style={styles.text}>{detail.transcript}</Text>

      <Text style={styles.title}>⭐ Điểm số:</Text>
      <Text style={styles.text}>Tổng thể: {detail.score_overall}</Text>
      <Text style={styles.text}>Phát âm: {detail.score_pronunciation}</Text>
      <Text style={styles.text}>Trôi chảy: {detail.score_fluency}</Text>
      <Text style={styles.text}>Ngữ điệu: {detail.score_intonation}</Text>
      <Text style={styles.text}>Tốc độ: {detail.score_speed}</Text>

      <Text style={styles.title}>🧠 Nhận xét:</Text>
      <Text style={styles.text}>{detail.comment}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="🔁 Luyện lại" onPress={handleRetry} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  text: { fontSize: 15, marginTop: 6 },
});
