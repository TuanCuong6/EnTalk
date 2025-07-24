//frontend/src/components/AudioReorder.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';

export default function AudioRecorder({ onFinish }) {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await requestPermissions();

      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        wavFile: 'record.wav',
      });

      setIsReady(true);
    };

    init();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      const allGranted = Object.values(granted).every(val => val === 'granted');
      if (!allGranted) {
        Alert.alert('Thiếu quyền', 'Vui lòng cấp đầy đủ quyền để ghi âm');
      }
    }
  };

  const startRecording = () => {
    if (!isReady) {
      Alert.alert('Hệ thống chưa sẵn sàng ghi âm');
      return;
    }

    AudioRecord.start();
    setRecording(true);
    setAudioFile(null);
    Alert.alert('🎤 Bắt đầu ghi');
  };

  const stopRecording = async () => {
    const filePath = await AudioRecord.stop();
    setRecording(false);
    setAudioFile(filePath);
    onFinish?.(filePath);
    Alert.alert('✅ Ghi xong', filePath);
  };

  const play = () => {
    if (!audioFile) return;
    const sound = new Sound(audioFile, '', error => {
      if (error) {
        Alert.alert('Lỗi khi phát', error.message);
        return;
      }
      sound.play();
    });
  };

  return (
    <View>
      {!recording ? (
        <Button title="🎤 Bắt đầu ghi" onPress={startRecording} />
      ) : (
        <Button title="⏹️ Dừng ghi" onPress={stopRecording} />
      )}

      <View style={{ marginTop: 10 }}>
        <Button title="▶️ Nghe lại" onPress={play} disabled={!audioFile} />
      </View>
    </View>
  );
}
