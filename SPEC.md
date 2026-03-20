# LifeOS - Personal Notion Clone

## Project Overview

**Project Name:** LifeOS  
**Type:** Cross-platform Personal Life Operating System  
**Core Functionality:** An all-in-one workspace combining notes, databases, tasks, wikis, and AI assistance with calendar/task app integrations  
**Target Users:** Personal use for productivity, note-taking, project management, and life organization

---

## Platform & Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native with Expo SDK 52 |
| Desktop | Windows (via Expo + Tauri/Electron wrapper) |
| Mobile | Android |
| Web | Progressive Web App (PWA) |
| State Management | Zustand |
| Local Database | expo-sqlite + WatermelonDB |
| Cloud Sync | Custom E2E encrypted sync service |
| AI | OpenAI, Anthropic, Google Gemini, Meta Llama, Ollama (local) |
| Authentication | OAuth 2.0 for integrations |

---

## UI/UX Specification

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background Primary | Deep Charcoal | #1A1A2E |
| Background Secondary | Dark Navy | #16213E |
| Background Tertiary | Slate | #0F3460 |
| Accent Primary | Electric Blue | #00D9FF |
| Accent Secondary | Soft Purple | #7B68EE |
| Accent Tertiary | Mint Green | #00E676 |
| Text Primary | Pure White | #FFFFFF |
| Text Secondary | Light Gray | #B8B8D1 |
| Text Muted | Gray | #6B6B8D |
| Success | Green | #4CAF50 |
| Warning | Amber | #FFC107 |
| Error | Red | #FF5252 |
| Border | Dark Border | #2A2A4A |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 32px | Bold (700) |
| H2 | Inter | 24px | SemiBold (600) |
| H3 | Inter | 20px | SemiBold (600) |
| Body | Inter | 16px | Regular (400) |
| Caption | Inter | 14px | Regular (400) |
| Small | Inter | 12px | Regular (400) |
| Code | JetBrains Mono | 14px | Regular (400) |

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │         Main Content Area          │
│  ┌─────────────┐  │  ┌─────────────────────────────────┐ │
│  │ Logo        │  │  │ Header Bar                      │ │
│  ├─────────────┤  │  ├─────────────────────────────────┤ │
│  │ Quick Find  │  │  │                                 │ │
│  ├─────────────┤  │  │                                 │ │
│  │ Navigation  │  │  │      Content Area               │ │
│  │ - Workspaces│  │  │      (Notes, DB, Tasks, etc)    │ │
│  │ - Pages     │  │  │                                 │ │
│  │ - Tasks     │  │  │                                 │ │
│  │ - Calendar  │  │  │                                 │ │
│  │ - Wiki      │  │  │                                 │ │
│  ├─────────────┤  │  │                                 │ │
│  │ AI Panel    │  │  ├─────────────────────────────────┤ │
│  │ (Collapsed) │  │  │ AI Assistant Panel (Optional)  │ │
│  └─────────────┘  │  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px - 1024px | Collapsible sidebar |
| Desktop | > 1024px | Full sidebar + content |

---

## Feature Specifications

### 1. Notes & Page Editor

#### Block-Based Editor
- **Text Blocks:** Paragraph, headings (H1-H3), bullet list, numbered list, toggle list, quote, callout
- **Media Blocks:** Image, video, audio, file embed, bookmark
- **Data Blocks:** Table, kanban embed, calendar embed
- **Advanced Blocks:** Code block with syntax highlighting, math equation (LaTeX), mermaid diagrams
- **AI Blocks:** AI-generated content block

#### Editor Features
- Drag-and-drop block reordering
- Slash commands for quick block insertion (/, @, ::)
- Keyboard shortcuts (Cmd+B bold, Cmd+I italic, etc.)
- Markdown shortcuts (# for headings, - for bullets, etc.)
- Real-time collaboration ready (future)
- Bi-directional linking with @page mentions
- Backlinks panel showing linked references

### 2. Database System

#### Supported Views

| View | Features |
|------|----------|
| **Table** | Sortable columns, filters, formula support, relations |
| **Kanban** | Drag-drop cards, swimlanes by property, multiple boards |
| **Calendar** | Month/week/day views, drag to create, event properties |
| **Gallery** | Card previews, cover images, compact/expanded modes |
| **List** | Compact rows, inline editing, grouped by property |

#### Property Types
- Text, Number, Select, Multi-select
- Date, Date Range, Time
- Checkbox, URL, Email, Phone
- Person, Relation, Rollup
- Formula, Created Time, Last Edited Time

### 3. Task Management

#### Task Features
- Create tasks with properties (due date, priority, tags, assigner)
- Subtasks with checkbox hierarchy
- Task templates
- Recurring tasks
- Priority levels (P1-P4 with colors)
- Quick capture from any screen

#### Views
- List view with filters/sorts
- Kanban by status/priority/project
- Calendar view (agenda)
- My Day view (today's tasks)
- Inbox (quick capture)

### 4. Calendar System

#### Views
- Month, Week, Day, Agenda
- Multiple calendars (work, personal, etc.)
- Event creation with rich properties

#### Integrations (OAuth-based)
| Service | Features |
|---------|----------|
| Google Calendar | Two-way sync, read/write events |
| Apple Calendar | CalDAV sync |
| TickTick | Two-way task/event sync |
| Microsoft Outlook | Calendar sync |

### 5. AI Integration

#### Supported Providers
| Provider | Models | Status |
|----------|--------|--------|
| OpenAI | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo | Configurable |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus | Configurable |
| Google | Gemini Pro, Gemini Ultra | Configurable |
| Meta | Llama 3.1 (via API) | Configurable |
| Ollama | Local models (Llama, Mistral, etc.) | Configurable |

#### AI Features
- **Best AI Selector:** Auto-selects best model based on task type
- **Per-task Selection:** Choose AI per request
- **Summarize:** Summarize pages, selections, tasks
- **Write:** Generate content, continue writing, improve text
- **Edit:** Rewrite, expand, shorten, change tone
- **Ask:** Query across all workspace data
- **Custom Prompts:** Save frequently used prompts

#### AI Task Routing (Best AI Selector)
| Task Type | Recommended AI |
|-----------|----------------|
| Code generation | OpenAI GPT-4 |
| Creative writing | Anthropic Claude |
| Analysis/summarization | Anthropic Claude |
| Fast simple tasks | GPT-3.5 / Gemini Flash |
| Local/offline | Ollama |
| Math/reasoning | OpenAI GPT-4 |

### 6. Wiki System

- Nested page hierarchy
- Bi-directional linking
- Page templates
- Table of contents (auto-generated)
- Breadcrumb navigation
- Full-text search across all content

### 7. Integrations

#### Task App Integrations
| Service | Tasks | Calendar | Status |
|---------|-------|----------|--------|
| TickTick | ✓ | ✓ | OAuth |
| Google Tasks | ✓ | ✓ | OAuth |
| Microsoft To Do | ✓ | - | OAuth |
| Todoist | ✓ | - | OAuth |
| Google Calendar | - | ✓ | OAuth |

#### Sync Strategy
- OAuth 2.0 for all cloud services
- Two-way sync with conflict resolution (last-write-wins + user prompt)
- Background sync every 15 minutes
- Manual sync button
- Offline queue for changes

---

## Data Architecture

### Storage Schema

```
Workspace/
├── Pages/
│   ├── id (UUID)
│   ├── title
│   ├── content (JSON blocks)
│   ├── icon
│   ├── cover
│   ├── parentId (for nesting)
│   ├── properties
│   └── metadata (created, updated, etc.)
├── Databases/
│   ├── id
│   ├── name
│   ├── schema (properties definition)
│   └── views
├── Items/ (database rows)
│   ├── id
│   ├── databaseId
│   └── properties (key-value by schema)
├── Tasks/
│   ├── id
│   ├── title
│   ├── dueDate
│   ├── priority
│   ├── status
│   ├── subtasks[]
│   └── source (local/integration)
├── Events/ (calendar)
│   ├── id
│   ├── title
│   ├── startDate
│   ├── endDate
│   ├── calendarId
│   └── source
└── AI/Config/
    ├── providers[]
    │   ├── type
    │   ├── apiKey (encrypted)
    │   └── models[]
    └── preferences
```

### Encryption
- AES-256-GCM for local data at rest
- User-derived key from password (PBKDF2)
- E2E encryption for cloud sync (user controls key)

---

## Navigation Structure

```
├── Workspace
│   ├── Quick Find (Cmd+K)
│   ├── Sidebar
│   │   ├── Home
│   │   ├── Pages
│   │   │   └── Page Tree
│   │   ├── Databases
│   │   │   └── Database List
│   │   ├── Tasks
│   │   │   ├── Today
│   │   │   ├── This Week
│   │   │   ├── All Tasks
│   │   │   └── By Project
│   │   ├── Calendar
│   │   ├── Wiki
│   │   └── Settings
│   │       ├── Account
│   │       ├── AI Configuration
│   │       ├── Integrations
│   │       └── Appearance
│   └── AI Panel
│       ├── Chat
│       ├── Summarize
│       └── Write
```

---

## Development Phases

### Phase 1: Core Foundation
1. Project setup with Expo
2. Navigation framework
3. Local SQLite database
4. Basic UI shell

### Phase 2: Notes & Editor
1. Block-based editor
2. Page CRUD operations
3. Basic formatting
4. Media embedding

### Phase 3: Database System
1. Database CRUD
2. Property system
3. Table view
4. Kanban view

### Phase 4: Calendar & Tasks
1. Calendar view
2. Task management
3. Event creation
4. Task properties

### Phase 5: AI Integration
1. Provider configs
2. AI chat interface
3. Summarize/write features
4. Best AI selector

### Phase 6: Integrations
1. OAuth handlers
2. Calendar syncs
3. Task app syncs
4. Conflict resolution

### Phase 7: Polish
1. Search
2. Performance
3. PWA support
4. Desktop build

---

## API Keys (User Provides)

Users will need to obtain their own API keys from:
- https://platform.openai.com
- https://console.anthropic.com
- https://aistudio.google.com/app/apikey
- https://ollama.ai (for local)

All keys are stored encrypted locally on device.
