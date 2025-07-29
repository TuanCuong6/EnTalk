import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fetchAllTopics } from '../api/reading';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const topicImages = {
  thamhiem: require('../assets/topics/thamhiem.png'),
  dulich: require('../assets/topics/dulich.png'),
  khoahoc: require('../assets/topics/khoahoc.png'),
  tintuc: require('../assets/topics/tintuc.png'),
  suckhoevadoisong: require('../assets/topics/suckhoevadoisong.png'),
  khampha: require('../assets/topics/khampha.png'),
  hoctapvatruonghoc: require('../assets/topics/hoctapvatruonghoc.png'),
  giadinhvabanbe: require('../assets/topics/giadinhvabanbe.png'),
};

const removeVietnameseTones = str => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '')
    .toLowerCase();
};

export default function TopicListScreen() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Rotate animation for logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const getImageForTopic = topic => {
    const key = removeVietnameseTones(topic.name);
    return topicImages[key] || require('../assets/topics/default.png');
  };

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5E72EB" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <Animated.View
        style={[
          styles.circle1,
          { transform: [{ rotate: rotateInterpolation }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle2,
          { transform: [{ rotate: rotateInterpolation }] },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>📚 Chủ đề bài đọc</Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Chọn chủ đề bạn quan tâm để bắt đầu luyện tập
        </Text>

        <FlatList
          data={topics}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('TopicReadings', { topic: item })
              }
            >
              <View style={styles.cardInner}>
                <Image
                  source={getImageForTopic(item)}
                  style={styles.image}
                  resizeMode="contain"
                />
                <Text style={styles.topicName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(94, 114, 235, 0.05)',
    top: -100,
    left: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    bottom: -50,
    right: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingBottom: 15,
    zIndex: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5E72EB',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 15,
  },
  cardInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.1)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
