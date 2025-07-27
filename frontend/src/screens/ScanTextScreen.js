// //frontend/src/screens/ScanTextScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import TextRecognition from 'react-native-text-recognition';
// import { useNavigation } from '@react-navigation/native';

// export default function ScanTextScreen() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   const handleScan = () => {
//     launchCamera({ mediaType: 'photo' }, async response => {
//       if (response.didCancel || response.errorCode) return;

//       const photo = response.assets?.[0];
//       if (!photo?.uri) return;

//       setLoading(true);
//       try {
//         const textArray = await TextRecognition.recognize(photo.uri);
//         const fullText = textArray.join('\n').trim();

//         if (!fullText) {
//           Alert.alert('Không tìm thấy chữ', 'Ảnh không chứa nội dung rõ ràng.');
//         } else if (fullText.split(' ').length < 10) {
//           Alert.alert(
//             'Văn bản quá ngắn',
//             'Ảnh có vẻ thiếu nội dung. Bạn muốn dùng luôn không?',
//             [
//               { text: 'Chụp lại', style: 'cancel' },
//               {
//                 text: 'Dùng luôn',
//                 onPress: () =>
//                   navigation.navigate('CustomReadingScreen', {
//                     customText: fullText,
//                   }),
//               },
//             ],
//           );
//         } else {
//           navigation.navigate('CustomReadingScreen', {
//             customText: fullText,
//           });
//         }
//       } catch (err) {
//         console.error('Lỗi OCR:', err);
//         Alert.alert('Lỗi xử lý ảnh', 'Không thể trích xuất văn bản từ ảnh.');
//       } finally {
//         setLoading(false);
//       }
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>📷 Quét văn bản từ ảnh</Text>

//       <TouchableOpacity style={styles.button} onPress={handleScan}>
//         <Text style={styles.buttonText}>Chụp ảnh để scan</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#007AFF" />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//   },
//   buttonText: { color: '#fff', fontSize: 16 },
// });
