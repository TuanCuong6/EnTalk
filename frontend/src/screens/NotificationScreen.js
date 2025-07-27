//frontend/src/screens/NotificationScreen.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  getNotificationList,
  markNotificationAsRead,
} from '../api/notification';
import { useFocusEffect } from '@react-navigation/native';
import { navigate, navigationRef } from '../utils/RootNavigation';
import { NotificationContext } from '../context/NotificationContext';
import { CommonActions } from '@react-navigation/native';
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationList();
      setNotifications(res.data);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách thông báo:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const handlePress = async item => {
    console.log('🔍 Thông báo được ấn:', item); // ✅ THÊM DÒNG NÀY
    try {
      await markNotificationAsRead(item.id);
      fetchUnreadCount();
    } catch (err) {
      console.log('⚠️ Không thể đánh dấu đã đọc:', err.message);
    }

    if (item.record_id) {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'RecordDetailScreen',
          params: { recordId: item.record_id },
        }),
      );
    } else if (item.reading_id) {
      navigate('ReadingPractice', { readingId: item.reading_id });
    } else if (item.custom_text) {
      navigate('CustomReadingScreen', { customText: item.custom_text });
    }
  };

  const { fetchUnreadCount } = useContext(NotificationContext);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: item.is_read ? '#f2f2f2' : '#fffbe6' },
      ]}
      onPress={() => handlePress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>
        📅 {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: 'gray',
  },
});
