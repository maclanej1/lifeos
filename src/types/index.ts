export interface Page {
  id: string;
  title: string;
  content: Block[];
  icon?: string;
  cover?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDatabase?: boolean;
  databaseId?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, unknown>;
  children?: Block[];
  checked?: boolean;
}

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletedList'
  | 'numberedList'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'bookmark'
  | 'divider'
  | 'table'
  | 'ai';

export interface Database {
  id: string;
  name: string;
  icon?: string;
  cover?: string;
  schema: DatabaseProperty[];
  views: DatabaseView[];
  items: DatabaseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOptions;
}

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'date'
  | 'dateRange'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'person'
  | 'relation'
  | 'rollup'
  | 'formula'
  | 'createdTime'
  | 'lastEditedTime';

export interface PropertyOptions {
  options?: SelectOption[];
  formula?: string;
  relationId?: string;
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  properties: Record<string, boolean>;
  filter?: FilterRule[];
  sort?: SortRule[];
}

export type ViewType = 'table' | 'kanban' | 'calendar' | 'gallery' | 'list';

export interface FilterRule {
  propertyId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: unknown;
}

export interface SortRule {
  propertyId: string;
  direction: 'asc' | 'desc';
}

export interface DatabaseItem {
  id: string;
  databaseId: string;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  subtasks: Subtask[];
  source: TaskSource;
  externalId?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskSource = 'local' | 'google' | 'ticktick' | 'todoist' | 'microsoft';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  calendarId: string;
  source: CalendarSource;
  externalId?: string;
  location?: string;
  color?: string;
}

export type CalendarSource = 'local' | 'google' | 'apple' | 'ticktick' | 'outlook';

export interface Calendar {
  id: string;
  name: string;
  color: string;
  source: CalendarSource;
  externalId?: string;
  visible: boolean;
}

export interface AIProvider {
  id: string;
  type: AIProviderType;
  name: string;
  apiKey?: string;
  enabled: boolean;
  models: AIModel[];
}

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'meta' | 'ollama';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderType;
  maxTokens: number;
}

export interface AIConfig {
  providers: AIProvider[];
  defaultProvider?: string;
  bestAISelection: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export type IntegrationType = 'google' | 'apple' | 'ticktick' | 'todoist' | 'microsoft';

export interface Workspace {
  id: string;
  name: string;
  pages: Page[];
  databases: Database[];
  tasks: Task[];
  events: CalendarEvent[];
  calendars: Calendar[];
  integrations: Integration[];
  aiConfig: AIConfig;
}
