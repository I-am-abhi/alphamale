import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I'm your Alpha Male AI coach. I'm here to motivate you, answer questions, and help you stay disciplined. What's on your mind?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new message is added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Simple rule-based responses (replace with actual AI API)
    if (lowerInput.includes('motivat') || lowerInput.includes('encourag')) {
      return "Remember: Discipline is choosing between what you want now and what you want most. Every day you stick to your routine, you're building an unbreakable version of yourself. Keep going! 💪";
    }
    
    if (lowerInput.includes('tired') || lowerInput.includes('hard')) {
      return "The pain of discipline is nothing like the pain of disappointment. You're stronger than you think. Push through. This is where champions are made. 🐺";
    }
    
    if (lowerInput.includes('workout') || lowerInput.includes('gym')) {
      return "The only bad workout is the one that didn't happen. Get in there and dominate. Your future self is watching. Make him proud! 🔥";
    }
    
    if (lowerInput.includes('diet') || lowerInput.includes('food')) {
      return "Eat like a man with purpose, not like someone passing time. Your body is a temple - fuel it right. Protein, vegetables, discipline. That's the formula. 🥗";
    }
    
    if (lowerInput.includes('goal') || lowerInput.includes('dream')) {
      return "Your future is created by what you do today, not tomorrow. Every action you take right now is building the man you want to become. Stay focused. Stay disciplined. 🎯";
    }
    
    // Default response
    return "I hear you. Remember: You don't become a better version of yourself. You bury the old version. Keep pushing forward, warrior. Your silence becomes your aura. 🐺";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot" size={32} color="#4CAF50" />
        <Text style={styles.headerTitle}>AI Coach</Text>
        <Text style={styles.headerSubtitle}>Your personal Alpha Male mentor</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            {!message.isUser && (
              <MaterialCommunityIcons
                name="robot"
                size={20}
                color="#4CAF50"
                style={styles.aiIcon}
              />
            )}
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.aiText,
                ]}
              >
                {message.text}
              </Text>
            </View>
            {message.isUser && (
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#666666"
                style={styles.userIcon}
              />
            )}
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <MaterialCommunityIcons
              name="robot"
              size={20}
              color="#4CAF50"
              style={styles.aiIcon}
            />
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.messageText, styles.aiText]}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#666666"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={inputText.trim() ? '#ffffff' : '#666666'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#ffffff',
  },
  aiIcon: {
    marginRight: 8,
    marginBottom: 4,
  },
  userIcon: {
    marginLeft: 8,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#000000',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
});


