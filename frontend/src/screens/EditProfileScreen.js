//frontend/src/screens/EditProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getProfile, updateProfile, uploadAvatar } from '../api/account';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState(null);

  useEffect(() => {
    getProfile().then(res => {
      setName(res.data.name);
      setAvatarUrl(res.data.avatar_url || '');
    });
  }, []);

  const tryUploadAvatar = async formData => {
    let retries = 2;
    while (retries > 0) {
      try {
        const res = await uploadAvatar(formData);
        return res;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
      }
    }
  };

  const handleImage = async sourceFn => {
    sourceFn(
      {
        mediaType: 'photo',
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
      },
      async response => {
        if (response.didCancel || response.errorCode) return;
        const photo = response.assets[0];

        setLocalPreviewUri(photo.uri);
        setUploading(true);

        try {
          const formData = new FormData();
          formData.append('avatar', {
            uri: photo.uri,
            name: photo.fileName || 'photo.jpg',
            type: photo.type || 'image/jpeg',
          });

          const res = await tryUploadAvatar(formData);

          if (res?.data?.avatar_url) {
            setAvatarUrl(res.data.avatar_url);
            setLocalPreviewUri(null);
          } else {
            throw new Error('Không có avatar_url trả về');
          }
        } catch (err) {
          console.error('Lỗi upload:', err);
          Alert.alert(
            'Lỗi mạng',
            'Ảnh có thể đã được upload nhưng phản hồi thất bại.',
          );
        } finally {
          setUploading(false);
        }
      },
    );
  };

  const handleSave = async () => {
    await updateProfile({ name, avatar_url });
    Alert.alert('Thành công', 'Đã cập nhật thông tin');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: uploading ? localPreviewUri : avatar_url }}
        style={styles.avatar}
      />
      {uploading && <ActivityIndicator size="small" color="#000" />}

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => handleImage(launchImageLibrary)}
      >
        <Text style={styles.imageButtonText}>Chọn ảnh từ máy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => handleImage(launchCamera)}
      >
        <Text style={styles.imageButtonText}>Chụp ảnh mới</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#ccc',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  imageButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
