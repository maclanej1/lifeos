import type { Task, TaskSource } from '../../types';

export const GoogleTasksService = {
  async fetchTasks(accessToken: string): Promise<Task[]> {
    try {
      const response = await fetch(
        'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) throw new Error('Google Tasks API error');

      const data = await response.json();
      const tasks: Task[] = [];

      for (const taskList of data.items || []) {
        const tasksResponse = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${taskList.id}/tasks`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          for (const t of tasksData.items || []) {
            tasks.push({
              id: `google-${t.id}`,
              title: t.title || 'Untitled',
              description: t.notes,
              dueDate: t.due ? new Date(t.due) : undefined,
              priority: mapGooglePriority(t.priority),
              status: t.status === 'completed' ? 'done' : 'todo',
              tags: [],
              subtasks: [],
              source: 'google',
              externalId: t.id,
              projectId: taskList.id,
              createdAt: new Date(t.created || Date.now()),
              updatedAt: new Date(t.updated || Date.now()),
            });
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error('Google Tasks fetch error:', error);
      return [];
    }
  },

  async createTask(accessToken: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, taskListId: string = '@default'): Promise<string | null> {
    try {
      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            notes: task.description,
            due: task.dueDate?.toISOString(),
            status: task.status === 'done' ? 'completed' : 'needsAction',
          }),
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Google Tasks create error:', error);
      return null;
    }
  },

  async updateTask(accessToken: string, taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: updates.title,
            notes: updates.description,
            due: updates.dueDate?.toISOString(),
            status: updates.status === 'done' ? 'completed' : 'needsAction',
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Google Tasks update error:', error);
      return false;
    }
  },

  async deleteTask(accessToken: string, taskId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.ok;
    } catch (error) {
      console.error('Google Tasks delete error:', error);
      return false;
    }
  },
};

export const TodoistService = {
  async fetchTasks(apiToken: string): Promise<Task[]> {
    try {
      const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      if (!response.ok) throw new Error('Todoist API error');

      const data = await response.json();
      return data.map((t: any) => ({
        id: `todoist-${t.id}`,
        title: t.content,
        description: t.description,
        dueDate: t.due?.datetime ? new Date(t.due.datetime) : t.due?.date ? new Date(t.due.date) : undefined,
        priority: mapTodoistPriority(t.priority),
        status: t.is_completed ? 'done' : 'todo',
        tags: t.labels || [],
        subtasks: [],
        source: 'todoist',
        externalId: t.id.toString(),
        projectId: t.project_id?.toString(),
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at),
      }));
    } catch (error) {
      console.error('Todoist fetch error:', error);
      return [];
    }
  },

  async createTask(apiToken: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const body: any = {
        content: task.title,
        description: task.description || '',
      };

      if (task.dueDate) {
        body.due_date = task.dueDate.toISOString().split('T')[0];
      }

      const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.id.toString();
    } catch (error) {
      console.error('Todoist create error:', error);
      return null;
    }
  },
};

export const MicrosoftTodoService = {
  async fetchTasks(accessToken: string): Promise<Task[]> {
    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/todo/lists',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) throw new Error('Microsoft To Do API error');

      const listsData = await response.json();
      const tasks: Task[] = [];

      for (const list of listsData.value || []) {
        const tasksResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/todo/lists/${list.id}/tasks`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          for (const t of tasksData.value || []) {
            tasks.push({
              id: `microsoft-${t.id}`,
              title: t.title,
              description: t.body?.content,
              dueDate: t.dueDateTime ? new Date(t.dueDateTime.dateTime) : undefined,
              priority: mapMicrosoftPriority(t.importance),
              status: t.completedDateTime ? 'done' : 'todo',
              tags: [],
              subtasks: [],
              source: 'microsoft',
              externalId: t.id,
              projectId: list.id,
              createdAt: new Date(t.createdDateTime),
              updatedAt: new Date(t.lastModifiedDateTime),
            });
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error('Microsoft To Do fetch error:', error);
      return [];
    }
  },
};

function mapGooglePriority(priority?: string): Task['priority'] {
  switch (priority) {
    case 'high':
      return 'P1';
    case 'medium':
      return 'P2';
    case 'low':
      return 'P4';
    default:
      return 'P3';
  }
}

function mapTodoistPriority(priority: number): Task['priority'] {
  switch (priority) {
    case 4:
      return 'P1';
    case 3:
      return 'P2';
    case 2:
      return 'P3';
    default:
      return 'P4';
  }
}

function mapMicrosoftPriority(importance: string): Task['priority'] {
  switch (importance) {
    case 'high':
      return 'P1';
    case 'normal':
      return 'P3';
    case 'low':
      return 'P4';
    default:
      return 'P3';
  }
}

export const TaskService = {
  async syncTasks(
    source: TaskSource,
    credentials: string
  ): Promise<Task[]> {
    switch (source) {
      case 'google':
        return GoogleTasksService.fetchTasks(credentials);
      case 'todoist':
        return TodoistService.fetchTasks(credentials);
      case 'microsoft':
        return MicrosoftTodoService.fetchTasks(credentials);
      default:
        return [];
    }
  },
};
