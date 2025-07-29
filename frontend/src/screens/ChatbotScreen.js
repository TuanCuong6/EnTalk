import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { askChatbot, fetchChatHistory } from '../api/chat';
import LinearGradient from 'react-native-linear-gradient';

export default function ChatbotScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await fetchChatHistory();
      const rows = res.data;

      const formatted = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].role === 'user') {
          const userMsg = rows[i];
          const assistantMsg =
            rows[i + 1]?.role === 'assistant' ? rows[i + 1] : null;
          formatted.push({
            question: userMsg.message,
            answer: assistantMsg?.message || null,
            id: i,
          });
          i++;
        }
      }

      setMessages(formatted);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử chat:', err.message);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = { question, answer: null, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await askChatbot({ message: question });
      const updated = { ...userMessage, answer: res.data.reply };
      setMessages(prev =>
        prev.map(m => (m.id === userMessage.id ? updated : m)),
      );
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <>
      <View style={[styles.chatBlock, styles.alignRight]}>
        <Text style={styles.userText}>🧑‍🎓 {item.question}</Text>
      </View>
      {item.answer && (
        <View style={[styles.chatBlock, styles.alignLeft]}>
          <Text style={styles.botText}>🤖 {item.answer}</Text>
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Nền gradient nhẹ */}
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.title}>🤖 Hỏi EnTalk về tiếng Anh</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi liên quan đến tiếng Anh"
          value={question}
          onChangeText={setQuestion}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#F0F7FF',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 100,
  },
  chatBlock: {
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  alignLeft: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  alignRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#DDE9FF',
  },
  userText: {
    fontWeight: '600',
    color: '#34495E',
    fontSize: 15,
  },
  botText: {
    color: '#333',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  sendButton: {
    backgroundColor: '#5E72EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
