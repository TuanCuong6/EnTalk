//frontend/src/utils/notification.js
import messaging from '@react-native-firebase/messaging';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFcmToken } from '../api/notification';
import { navigate } from './RootNavigation';

export async function setupFCM() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('📛 Không được cấp quyền FCM');
      return;
    }

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await saveFcmToken(fcmToken);
      console.log('🔥 Đã gửi FCM token lên server:', fcmToken);
    }

    // 👉 Foreground: app đang mở
    messaging().onMessage(async remoteMessage => {
      const { title, body } = remoteMessage.notification || {};
      const data = remoteMessage.data || {};

      Alert.alert(title || 'Thông báo', body, [
        {
          text: 'Luyện ngay',
          onPress: () => handleNotificationClick(data),
        },
        { text: 'Đóng', style: 'cancel' },
      ]);
    });

    // 👉 Background: app mở nhưng ở nền
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📩 [Background] Message:', remoteMessage);
    });

    // 👉 Quit: app tắt hẳn, được mở lại từ thông báo
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
      console.log('🚀 [InitialNotification] from quit state:', initialMessage);
      handleNotificationClick(initialMessage.data || {});
    }
  } catch (err) {
    console.log('❌ Lỗi setupFCM:', err.message || err);
  }
}

function handleNotificationClick(data) {
  if (data.readingId) {
    navigate('ReadingPractice', { readingId: parseInt(data.readingId) });
  } else if (data.customText) {
    navigate('CustomReadingScreen', { customText: data.customText });
  } else {
    console.log('⚠️ Không có dữ liệu phù hợp để điều hướng');
  }
}
