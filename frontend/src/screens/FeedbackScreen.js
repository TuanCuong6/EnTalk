import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { sendFeedback } from '../api/feedback';
import ImageResizer from 'react-native-image-resizer';
export default function FeedbackScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      const original = result.assets[0];

      // Nén ảnh lại trước khi gửi
      const resized = await ImageResizer.createResizedImage(
        original.uri,
        800,
        800,
        'JPEG',
        70,
      );

      setImage({
        uri: resized.uri,
        name: resized.name || 'screenshot.jpg',
        type: 'image/jpeg',
      });
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert('Vui lòng nhập nội dung góp ý');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('screenshot', {
        uri: image.uri,
        name: image.fileName || 'screenshot.jpg',
        type: image.type || 'image/jpeg',
      });
    }

    setLoading(true);
    try {
      await sendFeedback(formData);
      Alert.alert('🎉 Gửi góp ý thành công!');
      setContent('');
      setImage(null);
      navigation.goBack();
    } catch (err) {
      console.error('❌ Lỗi gửi góp ý:', err);
      Alert.alert('Lỗi khi gửi góp ý, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        🧪 Góp ý / Báo lỗi
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập nội dung góp ý..."
        multiline
        value={content}
        onChangeText={setContent}
      />
      <Button mode="outlined" onPress={handlePickImage} style={styles.button}>
        {image ? '🖼️ Đã chọn ảnh' : '🖼️ Đính kèm ảnh màn hình (tuỳ chọn)'}
      </Button>
      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: '100%', height: 200, marginVertical: 10 }}
          resizeMode="contain"
        />
      )}
      <Button
        mode="contained"
        onPress={handleSend}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Gửi góp ý
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});
