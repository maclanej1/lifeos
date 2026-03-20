import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { JSONStorage } from './types';

const STORAGE_DIR = `${FileSystem.documentDirectory}data/`;
const PAGES_FILE = 'pages.json';
const DATABASES_FILE = 'databases.json';
const TASKS_FILE = 'tasks.json';
const EVENTS_FILE = 'events.json';
const CALENDARS_FILE = 'calendars.json';
const INTEGRATIONS_FILE = 'integrations.json';
const AI_CONFIG_FILE = 'ai-config.json';
const SETTINGS_FILE = 'settings.json';

async function ensureStorageDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
}

async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    await ensureStorageDir();
    const path = `${STORAGE_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) return null;
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  try {
    await ensureStorageDir();
    const path = `${STORAGE_DIR}${filename}`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

export const StorageService = {
  async loadPages<T>(): Promise<T | null> {
    return readJsonFile<T>(PAGES_FILE);
  },

  async savePages<T>(pages: T): Promise<void> {
    return writeJsonFile(PAGES_FILE, pages);
  },

  async loadDatabases<T>(): Promise<T | null> {
    return readJsonFile<T>(DATABASES_FILE);
  },

  async saveDatabases<T>(databases: T): Promise<void> {
    return writeJsonFile(DATABASES_FILE, databases);
  },

  async loadTasks<T>(): Promise<T | null> {
    return readJsonFile<T>(TASKS_FILE);
  },

  async saveTasks<T>(tasks: T): Promise<void> {
    return writeJsonFile(TASKS_FILE, tasks);
  },

  async loadEvents<T>(): Promise<T | null> {
    return readJsonFile<T>(EVENTS_FILE);
  },

  async saveEvents<T>(events: T): Promise<void> {
    return writeJsonFile(EVENTS_FILE, events);
  },

  async loadCalendars<T>(): Promise<T | null> {
    return readJsonFile<T>(CALENDARS_FILE);
  },

  async saveCalendars<T>(calendars: T): Promise<void> {
    return writeJsonFile(CALENDARS_FILE, calendars);
  },

  async loadIntegrations<T>(): Promise<T | null> {
    return readJsonFile<T>(INTEGRATIONS_FILE);
  },

  async saveIntegrations<T>(integrations: T): Promise<void> {
    return writeJsonFile(INTEGRATIONS_FILE, integrations);
  },

  async loadAIConfig<T>(): Promise<T | null> {
    return readJsonFile<T>(AI_CONFIG_FILE);
  },

  async saveAIConfig<T>(config: T): Promise<void> {
    return writeJsonFile(AI_CONFIG_FILE, config);
  },

  async loadSettings<T>(): Promise<T | null> {
    return readJsonFile<T>(SETTINGS_FILE);
  },

  async saveSettings<T>(settings: T): Promise<void> {
    return writeJsonFile(SETTINGS_FILE, settings);
  },

  async exportData(): Promise<string> {
    const pages = await readJsonFile(PAGES_FILE);
    const databases = await readJsonFile(DATABASES_FILE);
    const tasks = await readJsonFile(TASKS_FILE);
    const events = await readJsonFile(EVENTS_FILE);
    const calendars = await readJsonFile(CALENDARS_FILE);
    
    return JSON.stringify({
      pages,
      databases,
      tasks,
      events,
      calendars,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  async importData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.pages) await writeJsonFile(PAGES_FILE, data.pages);
      if (data.databases) await writeJsonFile(DATABASES_FILE, data.databases);
      if (data.tasks) await writeJsonFile(TASKS_FILE, data.tasks);
      if (data.events) await writeJsonFile(EVENTS_FILE, data.events);
      if (data.calendars) await writeJsonFile(CALENDARS_FILE, data.calendars);
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  },
};

export const SecureStorage = {
  async setSecure(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  },

  async getSecure(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async removeSecure(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async setAPIKey(provider: string, apiKey: string): Promise<void> {
    await SecureStorage.setSecure(`api_key_${provider}`, apiKey);
  },

  async getAPIKey(provider: string): Promise<string | null> {
    return SecureStorage.getSecure(`api_key_${provider}`);
  },

  async removeAPIKey(provider: string): Promise<void> {
    await SecureStorage.removeSecure(`api_key_${provider}`);
  },

  async setOAuthToken(service: string, token: string): Promise<void> {
    await SecureStorage.setSecure(`oauth_${service}`, token);
  },

  async getOAuthToken(service: string): Promise<string | null> {
    return SecureStorage.getSecure(`oauth_${service}`);
  },
};
