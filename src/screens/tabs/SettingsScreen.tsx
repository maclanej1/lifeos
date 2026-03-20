import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { Icon, Card, Button, Input } from '../../components/common';
import { useStore } from '../../store/workspace';
import { DEFAULT_MODELS } from '../../services/ai/provider';
import { SecureStorage } from '../../services/storage';
import type { AIProviderType, IntegrationType } from '../../types';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { aiConfig, addAIProvider, updateAIProvider, removeAIProvider, integrations, addIntegration } = useStore();
  const [showAIProviderModal, setShowAIProviderModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [newProviderType, setNewProviderType] = useState<AIProviderType>('openai');
  const [newApiKey, setNewApiKey] = useState('');

  const handleAddProvider = async () => {
    if (!newApiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    await SecureStorage.setAPIKey(newProviderType, newApiKey);

    addAIProvider({
      type: newProviderType,
      name: newProviderType.charAt(0).toUpperCase() + newProviderType.slice(1),
      apiKey: newApiKey,
      enabled: true,
      models: DEFAULT_MODELS[newProviderType],
    });

    setNewApiKey('');
    setShowAIProviderModal(false);
  };

  const handleRemoveProvider = async (providerId: string, type: AIProviderType) => {
    Alert.alert('Remove Provider', 'Are you sure you want to remove this AI provider?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await SecureStorage.removeAPIKey(type);
          removeAIProvider(providerId);
        },
      },
    ]);
  };

  const handleConnectIntegration = (type: IntegrationType) => {
    addIntegration({
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      connected: false,
    });
    setShowIntegrationModal(false);
  };

  const providerOptions: AIProviderType[] = ['openai', 'anthropic', 'google', 'meta', 'ollama'];
  const integrationOptions: IntegrationType[] = ['google', 'apple', 'ticktick', 'todoist', 'microsoft'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Providers</Text>
        <Card>
          {aiConfig.providers.map((provider) => (
            <View key={provider.id} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon
                  name="bot"
                  size={20}
                  color={provider.enabled ? Colors.accent.primary : Colors.text.muted}
                />
                <View>
                  <Text style={styles.settingLabel}>{provider.name}</Text>
                  <Text style={styles.settingMeta}>
                    {provider.models.length} models available
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveProvider(provider.id, provider.type)}
              >
                <Icon name="trash" size={18} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAIProviderModal(true)}
          >
            <Icon name="plus" size={18} color={Colors.accent.primary} />
            <Text style={styles.addButtonText}>Add AI Provider</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Settings</Text>
        <Card>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {}}
          >
            <View style={styles.settingInfo}>
              <Icon name="sparkles" size={20} color={Colors.accent.primary} />
              <Text style={styles.settingLabel}>Best AI Auto-Select</Text>
            </View>
            <Icon
              name={aiConfig.bestAISelection ? 'checkCircle' : 'circle'}
              size={22}
              color={aiConfig.bestAISelection ? Colors.status.success : Colors.text.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {}}
          >
            <View style={styles.settingInfo}>
              <Icon name="settings" size={20} color={Colors.accent.primary} />
              <Text style={styles.settingLabel}>Default Provider</Text>
            </View>
            <Text style={styles.settingValue}>
              {aiConfig.defaultProvider || 'None'}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integrations</Text>
        <Card>
          {integrations.map((integration) => (
            <View key={integration.id} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon
                  name={integration.type === 'google' ? 'google' : integration.type === 'apple' ? 'apple' : integration.type}
                  size={20}
                  color={integration.connected ? Colors.status.success : Colors.text.muted}
                />
                <Text style={styles.settingLabel}>{integration.name}</Text>
              </View>
              <Text style={[
                styles.statusText,
                { color: integration.connected ? Colors.status.success : Colors.text.muted }
              ]}>
                {integration.connected ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowIntegrationModal(true)}
          >
            <Icon name="plus" size={18} color={Colors.accent.primary} />
            <Text style={styles.addButtonText}>Add Integration</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Card>
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingInfo}>
              <Icon name="share" size={20} color={Colors.accent.primary} />
              <Text style={styles.settingLabel}>Export Data</Text>
            </View>
            <Icon name="chevronRight" size={18} color={Colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingInfo}>
              <Icon name="link" size={20} color={Colors.accent.primary} />
              <Text style={styles.settingLabel}>Import Data</Text>
            </View>
            <Icon name="chevronRight" size={18} color={Colors.text.muted} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>LifeOS</Text>
            <Text style={styles.settingValue}>Version 1.0.0</Text>
          </View>
        </Card>
      </View>

      <View style={{ height: 100 }} />

      <Modal visible={showAIProviderModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add AI Provider</Text>
            <Text style={styles.modalLabel}>Provider</Text>
            <View style={styles.optionsGrid}>
              {providerOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionButton, newProviderType === type && styles.optionActive]}
                  onPress={() => setNewProviderType(type)}
                >
                  <Text style={[styles.optionText, newProviderType === type && styles.optionTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="API Key"
              placeholder="Enter your API key"
              value={newApiKey}
              onChangeText={setNewApiKey}
              secureTextEntry
            />
            <Text style={styles.apiKeyHelp}>
              Get your API key from {newProviderType === 'openai' ? 'platform.openai.com' : `the ${newProviderType} website`}
            </Text>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowAIProviderModal(false)} />
              <Button title="Add Provider" onPress={handleAddProvider} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showIntegrationModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Integration</Text>
            <View style={styles.integrationList}>
              {integrationOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.integrationItem}
                  onPress={() => handleConnectIntegration(type)}
                >
                  <Icon name={type} size={24} color={Colors.accent.primary} />
                  <Text style={styles.integrationName}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Icon name="chevronRight" size={18} color={Colors.text.muted} />
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Cancel" variant="ghost" onPress={() => setShowIntegrationModal(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.text.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  settingMeta: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
  },
  settingValue: {
    fontSize: FontSizes.body,
    color: Colors.text.muted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: FontSizes.body,
    color: Colors.accent.primary,
    fontWeight: '500',
  },
  statusText: {
    fontSize: FontSizes.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  optionText: {
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
  },
  optionTextActive: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  apiKeyHelp: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  integrationList: {
    marginBottom: Spacing.lg,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  integrationName: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
});
