import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Page,
  Database,
  Task,
  CalendarEvent,
  Calendar,
  AIConfig,
  AIProvider,
  Integration,
  Block,
  DatabaseItem,
} from '../types';

interface WorkspaceState {
  pages: Page[];
  databases: Database[];
  tasks: Task[];
  events: CalendarEvent[];
  calendars: Calendar[];
  integrations: Integration[];
  aiConfig: AIConfig;
  
  currentPageId: string | null;
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  
  setCurrentPage: (pageId: string | null) => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => Page;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  
  addDatabase: (database: Omit<Database, 'id' | 'createdAt' | 'updatedAt'>) => Database;
  updateDatabase: (databaseId: string, updates: Partial<Database>) => void;
  deleteDatabase: (databaseId: string) => void;
  addDatabaseItem: (databaseId: string, item: Omit<DatabaseItem, 'id' | 'databaseId' | 'createdAt' | 'updatedAt'>) => void;
  updateDatabaseItem: (databaseId: string, itemId: string, updates: Partial<DatabaseItem>) => void;
  deleteDatabaseItem: (databaseId: string, itemId: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
  
  addCalendar: (calendar: Omit<Calendar, 'id'>) => Calendar;
  updateCalendar: (calendarId: string, updates: Partial<Calendar>) => void;
  deleteCalendar: (calendarId: string) => void;
  
  updateAIConfig: (config: Partial<AIConfig>) => void;
  addAIProvider: (provider: Omit<AIProvider, 'id'>) => void;
  updateAIProvider: (providerId: string, updates: Partial<AIProvider>) => void;
  removeAIProvider: (providerId: string) => void;
  
  addIntegration: (integration: Omit<Integration, 'id'>) => Integration;
  updateIntegration: (integrationId: string, updates: Partial<Integration>) => void;
  removeIntegration: (integrationId: string) => void;
}

export const useStore = create<WorkspaceState>((set, get) => ({
  pages: [],
  databases: [],
  tasks: [],
  events: [],
  calendars: [],
  integrations: [],
  aiConfig: {
    providers: [],
    defaultProvider: undefined,
    bestAISelection: true,
  },
  
  currentPageId: null,
  sidebarCollapsed: false,
  aiPanelOpen: false,
  
  setCurrentPage: (pageId) => set({ currentPageId: pageId }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  
  addPage: (pageData) => {
    const page: Page = {
      ...pageData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ pages: [...state.pages, page] }));
    return page;
  },
  
  updatePage: (pageId, updates) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId ? { ...page, ...updates, updatedAt: new Date() } : page
      ),
    }));
  },
  
  deletePage: (pageId) => {
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== pageId),
    }));
  },
  
  addDatabase: (databaseData) => {
    const database: Database = {
      ...databaseData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ databases: [...state.databases, database] }));
    return database;
  },
  
  updateDatabase: (databaseId, updates) => {
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === databaseId ? { ...db, ...updates, updatedAt: new Date() } : db
      ),
    }));
  },
  
  deleteDatabase: (databaseId) => {
    set((state) => ({
      databases: state.databases.filter((db) => db.id !== databaseId),
    }));
  },
  
  addDatabaseItem: (databaseId, itemData) => {
    const item: DatabaseItem = {
      ...itemData,
      id: uuidv4(),
      databaseId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === databaseId ? { ...db, items: [...db.items, item] } : db
      ),
    }));
  },
  
  updateDatabaseItem: (databaseId, itemId, updates) => {
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === databaseId
          ? {
              ...db,
              items: db.items.map((item) =>
                item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
              ),
            }
          : db
      ),
    }));
  },
  
  deleteDatabaseItem: (databaseId, itemId) => {
    set((state) => ({
      databases: state.databases.map((db) =>
        db.id === databaseId
          ? { ...db, items: db.items.filter((item) => item.id !== itemId) }
          : db
      ),
    }));
  },
  
  addTask: (taskData) => {
    const task: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },
  
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      ),
    }));
  },
  
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },
  
  toggleSubtask: (taskId, subtaskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : task
      ),
    }));
  },
  
  addEvent: (eventData) => {
    const event: CalendarEvent = {
      ...eventData,
      id: uuidv4(),
    };
    set((state) => ({ events: [...state.events, event] }));
    return event;
  },
  
  updateEvent: (eventId, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    }));
  },
  
  deleteEvent: (eventId) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    }));
  },
  
  addCalendar: (calendarData) => {
    const calendar: Calendar = {
      ...calendarData,
      id: uuidv4(),
    };
    set((state) => ({ calendars: [...state.calendars, calendar] }));
    return calendar;
  },
  
  updateCalendar: (calendarId, updates) => {
    set((state) => ({
      calendars: state.calendars.map((cal) =>
        cal.id === calendarId ? { ...cal, ...updates } : cal
      ),
    }));
  },
  
  deleteCalendar: (calendarId) => {
    set((state) => ({
      calendars: state.calendars.filter((cal) => cal.id !== calendarId),
    }));
  },
  
  updateAIConfig: (config) => {
    set((state) => ({ aiConfig: { ...state.aiConfig, ...config } }));
  },
  
  addAIProvider: (providerData) => {
    const provider: AIProvider = {
      ...providerData,
      id: uuidv4(),
    };
    set((state) => ({
      aiConfig: { ...state.aiConfig, providers: [...state.aiConfig.providers, provider] },
    }));
  },
  
  updateAIProvider: (providerId, updates) => {
    set((state) => ({
      aiConfig: {
        ...state.aiConfig,
        providers: state.aiConfig.providers.map((p) =>
          p.id === providerId ? { ...p, ...updates } : p
        ),
      },
    }));
  },
  
  removeAIProvider: (providerId) => {
    set((state) => ({
      aiConfig: {
        ...state.aiConfig,
        providers: state.aiConfig.providers.filter((p) => p.id !== providerId),
      },
    }));
  },
  
  addIntegration: (integrationData) => {
    const integration: Integration = {
      ...integrationData,
      id: uuidv4(),
    };
    set((state) => ({ integrations: [...state.integrations, integration] }));
    return integration;
  },
  
  updateIntegration: (integrationId, updates) => {
    set((state) => ({
      integrations: state.integrations.map((i) =>
        i.id === integrationId ? { ...i, ...updates } : i
      ),
    }));
  },
  
  removeIntegration: (integrationId) => {
    set((state) => ({
      integrations: state.integrations.filter((i) => i.id !== integrationId),
    }));
  },
}));
