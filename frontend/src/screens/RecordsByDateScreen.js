// frontend/src/screens/RecordsByDateScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchRecordsByDate } from '../api/history';

export default function RecordsByDateScreen({ route, navigation }) {
  const { date } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetchRecordsByDate(date);
      setRecords(res.data);
    } catch (err) {
      console.error('❌ Lỗi fetch record theo ngày:', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu luyện tập của ngày này');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 👉 Tải lại khi mở lại màn
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [date]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
      onPress={() =>
        navigation.navigate('RecordDetailScreen', { recordId: item.id })
      }
    >
      <Text style={{ fontWeight: 'bold' }}>
        🕒 {item.created_at.slice(11, 16)} - ⭐ {item.score_overall}
      </Text>
      <Text style={{ fontStyle: 'italic', marginTop: 4 }}>
        {item.topic_name || (item.is_community_post ? 'Tự nhập' : 'Không rõ')}
      </Text>
      <Text numberOfLines={2} style={{ marginTop: 4 }}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
        📅 Danh sách bài luyện ngày {date}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : records.length === 0 ? (
        <Text>Không có dữ liệu luyện trong ngày này.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}
