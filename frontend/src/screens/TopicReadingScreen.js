//frontend/src/screens/TopicReadingScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchReadingsByTopic } from '../api/reading';

export default function TopicReadingsScreen() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { topic } = route.params;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchReadingsByTopic(topic.id);
        setReadings(res.data);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải bài đọc');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topic]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 {topic.name}</Text>
      <FlatList
        data={readings}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ReadingPractice', { reading: item })
            }
          >
            <Text style={styles.itemText}>
              • Level {item.level} - {item.content.slice(0, 50)}...
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  itemText: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
