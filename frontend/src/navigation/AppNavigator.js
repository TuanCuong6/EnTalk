//frontend/src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import ReadingPracticeScreen from '../screens/ReadingPracticeScreen';
import CustomReadingScreen from '../screens/CustomReadingScreen';
import TopicListScreen from '../screens/TopicListScreen';
import TopicReadingsScreen from '../screens/TopicReadingScreen';
import RecordsByDateScreen from '../screens/RecordsByDateScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="ReadingPractice" component={ReadingPracticeScreen} />
      <Stack.Screen
        name="CustomReadingScreen"
        component={CustomReadingScreen}
        options={{ title: 'Luyện đọc tùy chọn' }}
      />
      <Stack.Screen name="TopicList" component={TopicListScreen} />
      <Stack.Screen name="TopicReadings" component={TopicReadingsScreen} />
      <Stack.Screen
        name="RecordsByDateScreen"
        component={RecordsByDateScreen}
      />
      <Stack.Screen name="RecordDetailScreen" component={RecordDetailScreen} />
    </Stack.Navigator>
  );
}
