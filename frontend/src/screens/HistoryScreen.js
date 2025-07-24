//frontend/src/screens/HistoryScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchChartData, fetchRecentRecords } from '../api/history';
import { fetchAllTopics } from '../api/reading';

const RANGE_OPTIONS = [
  { label: '7 ngày', value: '7' },
  { label: '30 ngày', value: '30' },
];

export default function HistoryScreen({ navigation }) {
  const [range, setRange] = useState('7');
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);

  const [topics, setTopics] = useState([{ id: null, name: 'Tất cả' }]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;
  const screenWidth = Dimensions.get('window').width;
  const flatListRef = useRef(null);

  useEffect(() => {
    loadChart(range);
    loadTopics();
    loadInitialRecords();
  }, []);

  useEffect(() => {
    loadChart(range);
  }, [range]);

  useEffect(() => {
    setPage(1);
    setRecords([]);
    setHasMore(true);
    loadInitialRecords();
  }, [selectedTopic]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      onRefresh();
    });
    return unsubscribe;
  }, [navigation]);

  const loadChart = async selectedRange => {
    setLoadingChart(true);
    try {
      const res = await fetchChartData(selectedRange);
      const days = parseInt(selectedRange);
      const labels = [];
      const dates = [];
      const dateMap = {};

      const now = new Date();
      const offsetMs = 7 * 60 * 60 * 1000;
      const localNow = new Date(now.getTime() + offsetMs);
      const today = new Date(
        localNow.getFullYear(),
        localNow.getMonth(),
        localNow.getDate(),
      );

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 86400000);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const label = `${mm}-${dd}`;
        dates.push(dateStr);
        labels.push(label);
        dateMap[dateStr] = null;
      }

      res.data.forEach(item => {
        const d = new Date(item.date);
        const vnDate = new Date(d.getTime() + offsetMs);
        const yyyy = vnDate.getFullYear();
        const mm = String(vnDate.getMonth() + 1).padStart(2, '0');
        const dd = String(vnDate.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        if (key in dateMap) {
          dateMap[key] = Number(item.avg_score);
        }
      });

      const scores = dates.map(date => {
        const s = dateMap[date];
        return typeof s === 'number' ? s : null;
      });

      setChartData({ labels, scores, dates });
    } catch (err) {
      console.error('❌ Chart error:', err);
      Alert.alert('Lỗi', 'Không thể tải biểu đồ lịch sử');
    } finally {
      setLoadingChart(false);
    }
  };

  const loadTopics = async () => {
    try {
      const res = await fetchAllTopics();
      setTopics([{ id: null, name: 'Tất cả' }, ...res.data]);
    } catch (err) {
      console.error('❌ Lỗi tải topic:', err);
    }
  };

  const loadInitialRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetchRecentRecords({
        topicId: selectedTopic,
        limit,
        page: 1,
      });

      setRecords(res.data.records);
      setHasMore(res.data.records.length === limit);
      setPage(res.data.records.length === limit ? 2 : 1);
    } catch (err) {
      console.error('❌ Lỗi tải records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadMoreRecords = async () => {
    if (loadingRecords || !hasMore) return;
    setLoadingRecords(true);
    try {
      const res = await fetchRecentRecords({
        topicId: selectedTopic,
        limit,
        page,
      });
      console.log(
        '📤 Server trả:',
        res.data.records.map(r => r.id),
      );
      console.log(
        '🔍 Existing IDs:',
        records.map(r => r.id),
      );
      const existingIds = new Set(records.map(r => r.id));
      const newRecords = res.data.records.filter(r => !existingIds.has(r.id));

      if (newRecords.length === 0) {
        console.log('⛔ Không có dữ liệu mới, ngừng tải thêm.');
        setHasMore(false);
      } else {
        setRecords(prev => [...prev, ...newRecords]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('❌ Lỗi load thêm records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChart(range);
    loadInitialRecords().finally(() => setRefreshing(false));
  }, [range, selectedTopic]);

  const renderItem = ({ item }) => {
    const datetime = new Date(item.created_at).toLocaleString();
    return (
      <TouchableOpacity
        onPress={() => {
          if (!item?.id) {
            Alert.alert('Lỗi', 'Không tìm thấy bản ghi hợp lệ');
            return;
          }
          navigation.navigate('RecordDetailScreen', { recordId: item.id });
        }}
        style={styles.item}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.content?.slice(0, 50)}...</Text>
          <Text style={styles.info}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
          <Text style={styles.info}>
            Chủ đề: {item.topic_name || 'Không có'}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.score}>
            {item.score_overall?.toFixed(1) ?? '-'}
          </Text>
          <Text style={styles.retry}>🔁 Luyện lại</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
        📈 Tiến bộ luyện tập ({range} ngày gần đây)
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {RANGE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setRange(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 10,
              backgroundColor: range === opt.value ? '#007AFF' : '#eee',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: range === opt.value ? '#fff' : '#333' }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loadingChart ? (
        <ActivityIndicator size="large" />
      ) : (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View
              style={{
                opacity: chartData.scores.every(score => score === null)
                  ? 0.3
                  : 1,
              }}
            >
              <LineChart
                data={{
                  labels: chartData.labels,
                  datasets: [{ data: chartData.scores.map(s => s ?? 0) }],
                }}
                width={Math.max(screenWidth, chartData.labels.length * 50)}
                height={220}
                fromZero
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  labelColor: () => '#333',
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#007AFF',
                  },
                }}
                bezier
                style={{ borderRadius: 16 }}
                onDataPointClick={({ index }) => {
                  const selectedDate = chartData.dates[index];
                  navigation.navigate('RecordsByDateScreen', {
                    date: selectedDate,
                  });
                }}
              />
            </View>
          </ScrollView>

          {chartData.scores.every(score => score === null) && (
            <Text
              style={{
                position: 'absolute',
                top: 100,
                width: '100%',
                textAlign: 'center',
                fontSize: 16,
                color: '#888',
              }}
            >
              ⛔ Chưa có dữ liệu trong khoảng thời gian này
            </Text>
          )}
        </View>
      )}

      <FlatList
        data={topics}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(item.id ?? `all-${index}`)}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            key={`topic-${item.id ?? index}`}
            onPress={() => setSelectedTopic(item.id)}
            style={[
              styles.topicTab,
              selectedTopic === item.id && styles.topicTabSelected,
            ]}
          >
            <Text
              style={{
                color: selectedTopic === item.id ? '#fff' : '#333',
                fontWeight: 'bold',
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
  return (
    <FlatList
      ref={flatListRef}
      ListHeaderComponent={renderHeader}
      data={records}
      keyExtractor={item => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        loadingRecords ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <Text style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
            Không có bản ghi nào.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMoreRecords}
      onEndReachedThreshold={0.25}
      ListFooterComponent={
        <>
          {loadingRecords && hasMore && (
            <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
          )}
          {!hasMore && records.length > 0 && (
            <Text
              style={{ textAlign: 'center', color: '#888', marginVertical: 12 }}
            >
              ✅ Đã tải hết bản ghi
            </Text>
          )}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  topicTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginRight: 8,
  },
  topicTabSelected: {
    backgroundColor: '#007AFF',
  },
  item: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 15,
  },
  info: {
    color: '#555',
    fontSize: 13,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  retry: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 4,
  },
});
