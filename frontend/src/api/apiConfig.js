//frontend/src/api/apiConfig.js;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = 'http://192.168.100.39:3000/api';
// const BASE_URL = 'http://192.168.1.244:3000/api';
export const API_AUTH = axios.create({
  baseURL: `${BASE_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

export const API_READING = axios.create({
  baseURL: `${BASE_URL}/reading`,
});
export const API_TOPIC = axios.create({
  baseURL: `${BASE_URL}/topics`,
});
export const API_HISTORY = axios.create({
  baseURL: `${BASE_URL}/history`,
});
API_HISTORY.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
