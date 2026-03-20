import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { Icon, Card, Button, Input } from '../../components/common';
import { useStore } from '../../store/workspace';
import { callAI, getProviderModels, getRecommendedProvider } from '../../services/ai/provider';
import type { AIMessage, AIProvider, AIProviderType } from '../../types';

interface AIScreenProps {
  navigation: any;
}

type AIFeature = 'chat' | 'summarize' | 'write';

export const AIScreen: React.FC<AIScreenProps> = ({ navigation }) => {
  const { aiConfig, addAIProvider, updateAIProvider } = useStore();
  const [feature, setFeature] = useState<AIFeature>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(aiConfig.defaultProvider || '');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const availableProviders = aiConfig.providers.filter((p) => p.enabled && p.apiKey);

  const getCurrentProvider = (): AIProvider | undefined => {
    return availableProviders.find((p) => p.id === selectedProvider) || availableProviders[0];
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const provider = getCurrentProvider();
      if (!provider) {
        throw new Error('No AI provider configured');
      }

      const modelId = provider.models[0]?.id || getProviderModels(provider.type)[0]?.id;
      if (!modelId) {
        throw new Error('No model available');
      }

      const newMessages: AIMessage[] = [...messages, userMessage];
      const response = await callAI(provider, modelId, newMessages);

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const provider = getCurrentProvider();
      if (!provider) throw new Error('No provider');

      const modelId = provider.models[0]?.id || getProviderModels(provider.type)[0]?.id;
      const response = await callAI(
        provider,
        modelId,
        [{ id: '1', role: 'user', content: `Summarize this:\n\n${inputText.trim()}`, timestamp: new Date() }]
      );

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: inputText.trim(), timestamp: new Date() },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() },
      ]);
      setInputText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWrite = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const provider = getCurrentProvider();
      if (!provider) throw new Error('No provider');

      const modelId = provider.models[0]?.id || getProviderModels(provider.type)[0]?.id;
      const response = await callAI(
        provider,
        modelId,
        [{ id: '1', role: 'user', content: inputText.trim(), timestamp: new Date() }]
      );

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: inputText.trim(), timestamp: new Date() },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() },
      ]);
      setInputText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBestAI = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const taskType = inputText.toLowerCase();
      let providerType: AIProviderType = 'openai';

      if (taskType.includes('code')) providerType = 'openai';
      else if (taskType.includes('creative') || taskType.includes('write')) providerType = 'anthropic';
      else if (taskType.includes('analyze') || taskType.includes('summary')) providerType = 'anthropic';

      const provider = aiConfig.providers.find(
        (p) => p.type === providerType && p.enabled && p.apiKey
      ) || availableProviders[0];

      if (!provider) throw new Error('No suitable provider');

      const modelId = provider.models[0]?.id || getProviderModels(provider.type)[0]?.id;
      const response = await callAI(
        provider,
        modelId,
        [{ id: '1', role: 'user', content: inputText.trim(), timestamp: new Date() }]
      );

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: inputText.trim(), timestamp: new Date() },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `[Using ${provider.name}]\n\n${response}`, timestamp: new Date() },
      ]);
      setInputText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: AIMessage }) => (
    <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
      <View style={styles.messageHeader}>
        <Icon
          name={item.role === 'user' ? 'person' : 'bot'}
          size={14}
          color={item.role === 'user' ? Colors.text.muted : Colors.accent.primary}
        />
        <Text style={styles.messageRole}>
          {item.role === 'user' ? 'You' : 'AI'}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <TouchableOpacity
          style={styles.providerButton}
          onPress={() => setShowProviderModal(true)}
        >
          <Icon name="settings" size={16} color={Colors.text.secondary} />
          <Text style={styles.providerText}>
            {getCurrentProvider()?.name || 'Select Provider'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        {(['chat', 'summarize', 'write'] as AIFeature[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.featureButton, feature === f && styles.featureActive]}
            onPress={() => setFeature(f)}
          >
            <Icon
              name={f === 'chat' ? 'bot' : f === 'summarize' ? 'text' : 'edit'}
              size={16}
              color={feature === f ? Colors.background.primary : Colors.text.secondary}
            />
            <Text style={[styles.featureText, feature === f && styles.featureTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.featureButton, styles.bestAIButton]}
          onPress={handleBestAI}
        >
          <Icon name="sparkles" size={16} color={Colors.background.primary} />
          <Text style={[styles.featureText, styles.bestAIText]}>Best AI</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      />

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.accent.primary} />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={feature === 'summarize' ? 'Paste text to summarize...' : 'Ask AI anything...'}
          placeholderTextColor={Colors.text.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={feature === 'chat' ? handleSend : feature === 'summarize' ? handleSummarize : handleWrite}
          disabled={!inputText.trim() || isLoading}
        >
          <Icon name="arrowRight" size={20} color={Colors.background.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  providerText: {
    fontSize: FontSizes.small,
    color: Colors.text.secondary,
  },
  features: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.full,
  },
  featureActive: {
    backgroundColor: Colors.accent.primary,
  },
  featureText: {
    fontSize: FontSizes.small,
    color: Colors.text.secondary,
  },
  featureTextActive: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  bestAIButton: {
    backgroundColor: Colors.accent.secondary,
  },
  bestAIText: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  message: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userMessage: {
    backgroundColor: Colors.background.secondary,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  assistantMessage: {
    backgroundColor: Colors.background.tertiary,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  messageRole: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
  },
  messageContent: {
    fontSize: FontSizes.body,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.caption,
    color: Colors.text.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
