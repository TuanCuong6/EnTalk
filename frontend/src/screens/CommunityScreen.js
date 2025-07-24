// frontend/src/screens/CommunityScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { API_READING } from '../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchCommunityReadings = async () => {
    try {
      const res = await API_READING.get('/community');
      setPosts(res.data);
    } catch (err) {
      console.error('❌ Lỗi tải bài cộng đồng:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityReadings();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() =>
        navigation.navigate('CommunityReadingDetailScreen', { reading: item })
      }
    >
      <Text style={styles.author}>👤 {item.author_name}</Text>
      <Text numberOfLines={3}>{item.content}</Text>
      <View style={styles.stats}>
        <Text>📊 {item.total_users || 0} người luyện</Text>
        <Text>⭐ {item.avg_score?.toFixed(1) || '--'} điểm TB</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
