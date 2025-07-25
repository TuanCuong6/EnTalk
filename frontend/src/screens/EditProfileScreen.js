import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Image,
  Alert,
  ActivityIndicator,
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
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Image
        source={{ uri: uploading ? localPreviewUri : avatar_url }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginBottom: 10,
          backgroundColor: '#ccc',
        }}
      />

      {uploading && <ActivityIndicator size="small" color="#000" />}

      <Button
        title="Chọn ảnh từ máy"
        onPress={() => handleImage(launchImageLibrary)}
      />
      <Button title="Chụp ảnh mới" onPress={() => handleImage(launchCamera)} />

      <TextInput
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        style={{
          borderBottomWidth: 1,
          width: '100%',
          marginVertical: 20,
          fontSize: 16,
        }}
      />
      <Button title="Lưu thay đổi" onPress={handleSave} />
    </View>
  );
}
