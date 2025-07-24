//frontend/src/screens/TopicListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { fetchAllTopics } from '../api/reading';
import { useNavigation } from '@react-navigation/native';

export default function TopicListScreen() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await fetchAllTopics();
        setTopics(res.data);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
      } finally {
        setLoading(false);
      }
    };
    loadTopics();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 Chủ đề bài đọc</Text>
      <FlatList
        data={topics}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('TopicReadings', { topic: item })
            }
          >
            <Text style={styles.itemText}>• {item.name}</Text>
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
