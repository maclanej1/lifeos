import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from './src/constants/theme';

const STORAGE_KEY = 'lifeos_users';
const CURRENT_USER_KEY = 'lifeos_current_user';

const screens = ['Home', 'Pages', 'Tasks', 'Calendar', 'AI', 'Settings'];

const getUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const getCurrentUser = () => {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch { return null; }
};

const setCurrentUser = (username) => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const TICKTICK_API = 'https://api.ticktick.com/open/v1';

const ticktickApi = {
  async getTasks(token) {
    console.log('Fetching tasks with token:', token ? 'token present' : 'no token');
    const response = await fetch(`${TICKTICK_API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      const text = await response.text();
      console.error('API Error:', text);
      throw new Error(`API Error ${response.status}: ${text}`);
    }
    return response.json();
  },

  async createTask(token, task) {
    const response = await fetch(`${TICKTICK_API}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(token, taskId, task) {
    const response = await fetch(`${TICKTICK_API}/tasks/${taskId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(token, taskId) {
    const response = await fetch(`${TICKTICK_API}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete task');
  }
};

const syncTasksWithTickTick = async (localTasks, token, setSyncStatus) => {
  setSyncStatus('syncing');
  try {
    const remoteTasks = await ticktickApi.getTasks(token);
    const mergedTasks = [...localTasks];
    
    remoteTasks.forEach(remoteTask => {
      const localIndex = mergedTasks.findIndex(t => t.ticktickId === remoteTask.id);
      if (localIndex === -1) {
        mergedTasks.push({
          id: Date.now().toString() + Math.random(),
          title: remoteTask.title,
          description: remoteTask.content || '',
          dueDate: remoteTask.dueDate ? new Date(remoteTask.dueDate).toISOString().split('T')[0] : null,
          priority: remoteTask.priority === 1 ? 'high' : remoteTask.priority === 3 ? 'low' : 'medium',
          status: remoteTask.status === 2 ? 'done' : 'pending',
          ticktickId: remoteTask.id,
          createdAt: new Date().toISOString()
        });
      } else {
        const local = mergedTasks[localIndex];
        const remoteUpdated = new Date(remoteTask.modifiedTime).getTime();
        const localUpdated = new Date(local.updatedAt || 0).getTime();
        if (remoteUpdated > localUpdated) {
          mergedTasks[localIndex] = {
            ...local,
            title: remoteTask.title,
            description: remoteTask.content || '',
            status: remoteTask.status === 2 ? 'done' : 'pending'
          };
        }
      }
    });

    for (const task of localTasks) {
      if (!task.ticktickId) {
        const newRemote = await ticktickApi.createTask(token, {
          title: task.title,
          content: task.description || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
          priority: task.priority === 'high' ? 1 : task.priority === 'low' ? 3 : 0,
          status: task.status === 'done' ? 2 : 0
        });
        const localIndex = mergedTasks.findIndex(t => t.id === task.id);
        if (localIndex !== -1) {
          mergedTasks[localIndex].ticktickId = newRemote.id;
        }
      } else if (task._updated) {
        const remoteTask = remoteTasks.find(r => r.id === task.ticktickId);
        if (remoteTask) {
          await ticktickApi.updateTask(token, task.ticktickId, {
            ...remoteTask,
            title: task.title,
            content: task.description || '',
            status: task.status === 'done' ? 2 : 0
          });
        }
      }
    }

    setSyncStatus('synced');
    return mergedTasks;
  } catch (error) {
    console.error('Sync error:', error);
    setSyncStatus('error');
    return localTasks;
  }
};

const LoginScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    const users = getUsers();
    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (users[username]) {
        setError('Username already exists');
        return;
      }
      users[username] = {
        password: hashPassword(password),
        tasks: [],
        pages: [],
        events: [],
        ticktickConnected: false,
        apiKeys: {},
        createdAt: new Date().toISOString()
      };
      saveUsers(users);
      setCurrentUser(username);
      onLogin(username);
    } else {
      if (!users[username] || users[username].password !== hashPassword(password)) {
        setError('Invalid username or password');
        return;
      }
      setCurrentUser(username);
      onLogin(username);
    }
  };

  const userList = Object.keys(getUsers());
  const handleUserSelect = (user) => {
    setUsername(user);
  };

  return (
    <View style={loginStyles.container}>
      <View style={loginStyles.card}>
        <Text style={loginStyles.logo}>○ LifeOS</Text>
        <Text style={loginStyles.subtitle}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
        
        {userList.length > 0 && !isSignup && (
          <View style={loginStyles.userList}>
            <Text style={loginStyles.userListLabel}>Quick login:</Text>
            <View style={loginStyles.userButtons}>
              {userList.slice(0, 4).map(u => (
                <TouchableOpacity key={u} style={loginStyles.userBtn} onPress={() => handleUserSelect(u)}>
                  <Text style={loginStyles.userBtnText}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.text.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={loginStyles.showPassBtn} onPress={() => setShowPassword(!showPassword)}>
          <Text style={loginStyles.showPassText}>{showPassword ? 'Hide password' : 'Show password'}</Text>
        </TouchableOpacity>
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={Colors.text.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
        )}
        {error ? <Text style={loginStyles.error}>{error}</Text> : null}
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveBtnText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={loginStyles.switchBtn} onPress={() => { setIsSignup(!isSignup); setError(''); setPassword(''); setConfirmPassword(''); }}>
          <Text style={loginStyles.switchText}>
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeContent = ({ user }) => (
  <ScrollView style={styles.content}>
    <View style={styles.header}>
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.title}>{user}</Text>
    </View>
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput style={styles.searchInput} placeholder="Quick find..." placeholderTextColor={Colors.text.muted} />
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <View style={styles.actionButton}><Text style={styles.actionIcon}>◻</Text><Text style={styles.actionText}>New Page</Text></View>
        <View style={styles.actionButton}><Text style={styles.actionIcon}>☑</Text><Text style={styles.actionText}>New Task</Text></View>
        <View style={styles.actionButton}><Text style={styles.actionIcon}>▦</Text><Text style={styles.actionText}>New Database</Text></View>
        <View style={styles.actionButton}><Text style={styles.actionIcon}>◈</Text><Text style={styles.actionText}>AI Assistant</Text></View>
      </View>
    </View>
  </ScrollView>
);

const PagesContent = ({ userData }) => {
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const addPage = () => {
    if (!newPageTitle.trim()) return;
    const page = {
      id: Date.now().toString(),
      title: newPageTitle,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    userData.pages = [page, ...(userData.pages || [])];
    const users = getUsers();
    users[getCurrentUser()] = userData;
    saveUsers(users);
    setNewPageTitle('');
    setShowAddModal(false);
  };

  return (
    <View style={pagesStyles.container}>
      <View style={pagesStyles.header}>
        <Text style={pagesStyles.title}>Pages</Text>
        <TouchableOpacity style={styles.smallButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.smallButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={pagesStyles.list}>
        {(!userData.pages || userData.pages.length === 0) ? (
          <View style={styles.center}>
            <Text style={styles.placeholder}>No pages yet</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.linkText}>Create your first page</Text>
            </TouchableOpacity>
          </View>
        ) : (
          userData.pages.map(page => (
            <View key={page.id} style={pagesStyles.pageItem}>
              <Text style={pagesStyles.pageIcon}>◻</Text>
              <View style={pagesStyles.pageContent}>
                <Text style={pagesStyles.pageTitle}>{page.title}</Text>
                <Text style={pagesStyles.pageDate}>{new Date(page.updatedAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.linkText}>→</Text>
            </View>
          ))
        )}
      </ScrollView>
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={tasksStyles.modalOverlay}>
          <View style={tasksStyles.modal}>
            <Text style={tasksStyles.modalTitle}>New Page</Text>
            <TextInput
              style={styles.input}
              placeholder="Page title"
              placeholderTextColor={Colors.text.muted}
              value={newPageTitle}
              onChangeText={setNewPageTitle}
            />
            <View style={tasksStyles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addPage}>
                <Text style={styles.saveBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const TasksContent = ({ userData, refreshData, ticktickToken }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [syncStatus, setSyncStatus] = useState('idle');

  const tasks = userData.tasks || [];

  const saveTasks = (newTasks) => {
    userData.tasks = newTasks;
    const users = getUsers();
    users[getCurrentUser()] = userData;
    saveUsers(users);
    refreshData();
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate || null,
      priority: newTaskPriority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const newTasks = [task, ...tasks];
    saveTasks(newTasks);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskPriority('medium');
    setShowAddModal(false);
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: t.status === 'done' ? 'pending' : 'done', _updated: true } : t
    );
    saveTasks(newTasks);
  };

  const deleteTask = (taskId) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        const newTasks = tasks.filter(t => t.id !== taskId);
        saveTasks(newTasks);
      }}
    ]);
  };

  const handleSync = async () => {
    if (!ticktickToken) {
      Alert.alert('Not Connected', 'Please connect TickTick in Settings first.');
      return;
    }
    const syncedTasks = await syncTasksWithTickTick(tasks, ticktickToken, setSyncStatus);
    saveTasks(syncedTasks);
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const getSyncStatusDisplay = () => {
    if (syncStatus === 'syncing') return { icon: '↻', text: 'Syncing...' };
    if (syncStatus === 'synced') return { icon: '✓', text: 'Synced' };
    if (syncStatus === 'error') return { icon: '✗', text: 'Sync Failed' };
    return null;
  };

  const syncDisplay = getSyncStatusDisplay();

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  const getPriorityColor = (priority) => {
    if (priority === 'high') return Colors.status.error;
    if (priority === 'low') return Colors.text.muted;
    return Colors.accent.primary;
  };

  return (
    <View style={tasksStyles.container}>
      <View style={tasksStyles.header}>
        <Text style={tasksStyles.title}>Tasks</Text>
        <View style={tasksStyles.headerActions}>
          {ticktickToken && (
            <TouchableOpacity style={[styles.smallButton, syncStatus === 'syncing' && styles.smallButtonDisabled]} onPress={handleSync} disabled={syncStatus === 'syncing'}>
              <Text style={styles.smallButtonText}>{syncDisplay ? `${syncDisplay.icon} ${syncDisplay.text}` : '↻ Sync'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.smallButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.smallButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={tasksStyles.filters}>
        {['all', 'pending', 'done'].map(f => (
          <TouchableOpacity key={f} style={[tasksStyles.filterBtn, filter === f && tasksStyles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[tasksStyles.filterText, filter === f && tasksStyles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={tasksStyles.list}>
        {filteredTasks.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.placeholder}>No tasks yet</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.linkText}>Add your first task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTasks.map(task => (
            <View key={task.id} style={tasksStyles.taskItem}>
              <TouchableOpacity style={tasksStyles.checkbox} onPress={() => toggleTask(task.id)}>
                <Text style={tasksStyles.checkboxText}>{task.status === 'done' ? '☑' : '☐'}</Text>
              </TouchableOpacity>
              <View style={tasksStyles.taskContent}>
                <Text style={[tasksStyles.taskTitle, task.status === 'done' && tasksStyles.taskDone]}>{task.title}</Text>
                {task.description && <Text style={tasksStyles.taskDesc}>{task.description}</Text>}
                <View style={tasksStyles.taskMeta}>
                  <View style={[tasksStyles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <Text style={tasksStyles.taskDate}>{task.dueDate || 'No due date'}</Text>
                </View>
              </View>
              <TouchableOpacity style={tasksStyles.deleteBtn} onPress={() => deleteTask(task.id)}>
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={tasksStyles.modalOverlay}>
          <View style={tasksStyles.modal}>
            <Text style={tasksStyles.modalTitle}>New Task</Text>
            <TextInput style={styles.input} placeholder="Task title" placeholderTextColor={Colors.text.muted} value={newTaskTitle} onChangeText={setNewTaskTitle} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description (optional)" placeholderTextColor={Colors.text.muted} value={newTaskDescription} onChangeText={setNewTaskDescription} multiline />
            <TextInput style={styles.input} placeholder="Due date (YYYY-MM-DD)" placeholderTextColor={Colors.text.muted} value={newTaskDueDate} onChangeText={setNewTaskDueDate} />
            <Text style={styles.label}>Priority</Text>
            <View style={tasksStyles.priorityBtns}>
              {['low', 'medium', 'high'].map(p => (
                <TouchableOpacity key={p} style={[tasksStyles.priorityBtn, newTaskPriority === p && tasksStyles.priorityBtnActive]} onPress={() => setNewTaskPriority(p)}>
                  <Text style={tasksStyles.priorityBtnText}>{p.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={tasksStyles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addTask}><Text style={styles.saveBtnText}>Add Task</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CalendarContent = () => (
  <View style={calendarStyles.container}>
    <View style={calendarStyles.header}>
      <Text style={calendarStyles.title}>Calendar</Text>
    </View>
    <View style={calendarStyles.monthView}>
      <Text style={calendarStyles.monthText}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
    </View>
    <View style={calendarStyles.daysHeader}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
        <Text key={d} style={calendarStyles.dayLabel}>{d}</Text>
      ))}
    </View>
    <View style={calendarStyles.daysGrid}>
      {Array.from({ length: 35 }, (_, i) => {
        const day = i - 3;
        const date = new Date();
        date.setDate(day);
        const isToday = day === new Date().getDate();
        return (
          <View key={i} style={[calendarStyles.day, isToday && calendarStyles.today]}>
            <Text style={[calendarStyles.dayText, isToday && calendarStyles.todayText]}>{day > 0 && day <= 31 ? day : ''}</Text>
          </View>
        );
      })}
    </View>
  </View>
);

const AIContent = () => (
  <View style={styles.center}><Text style={styles.placeholder}>AI Assistant - Coming Soon</Text></View>
);

const SettingsContent = ({ user, onLogout, ticktickToken, setTicktickToken, refreshData, apiKeys, setApiKeys }) => {
  const [ticktickClientId, setTicktickClientId] = useState(apiKeys.ticktickClientId || '');
  const [ticktickClientSecret, setTicktickClientSecret] = useState(apiKeys.ticktickClientSecret || '');
  const [loading, setLoading] = useState(false);

  const connectTickTick = async () => {
    if (!ticktickClientId) {
      Alert.alert('Error', 'Please enter your TickTick Client ID');
      return;
    }
    setApiKeys({ ticktickClientId, ticktickClientSecret });
    setLoading(true);
    
    const redirectUri = window.location.origin + '/lifeos/callback';
    const authUrl = `https://ticktick.com/oauth/authorize?client_id=${ticktickClientId}&redirect_uri=${redirectUri}&response_type=token&scope=tasks:read%20tasks:write`;
    
    window.open(authUrl, 'TickTick Auth', 'width=500,height=600');
    Alert.alert('Waiting', 'Complete authorization in the popup, then return here.');
    setLoading(false);
  };

  const disconnectTickTick = () => {
    setTicktickToken(null);
    Alert.alert('Disconnected', 'TickTick has been disconnected');
  };

  return (
  <ScrollView style={settingsStyles.container}>
    <View style={settingsStyles.header}>
      <Text style={settingsStyles.title}>Settings</Text>
    </View>
    <View style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Account</Text>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>Logged in as</Text>
        <Text style={settingsStyles.cardDesc}>{user}</Text>
      </View>
      <TouchableOpacity style={settingsStyles.dangerBtn} onPress={onLogout}>
        <Text style={settingsStyles.dangerBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
    <View style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Integrations</Text>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>TickTick</Text>
        {ticktickToken ? (
          <View style={settingsStyles.connected}>
            <Text style={settingsStyles.connectedText}>Connected</Text>
            <TouchableOpacity onPress={disconnectTickTick}>
              <Text style={styles.linkText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={settingsStyles.cardDesc}>Enter your TickTick Client ID to connect</Text>
            <TextInput
              style={styles.input}
              placeholder="Client ID"
              placeholderTextColor={Colors.text.muted}
              value={ticktickClientId}
              onChangeText={setTicktickClientId}
            />
            <TextInput
              style={styles.input}
              placeholder="Client Secret"
              placeholderTextColor={Colors.text.muted}
              value={ticktickClientSecret}
              onChangeText={setTicktickClientSecret}
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveBtn} onPress={connectTickTick} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Connecting...' : 'Connect TickTick'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>Calendar Integrations</Text>
        <Text style={settingsStyles.cardDesc}>Coming soon: Google Calendar, Apple Calendar, Outlook</Text>
      </View>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>AI Providers</Text>
        <Text style={settingsStyles.cardDesc}>Coming soon: OpenAI, Anthropic, Google, Ollama</Text>
      </View>
    </View>
    <View style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>About</Text>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.cardTitle}>LifeOS</Text>
        <Text style={settingsStyles.cardDesc}>Version 1.0.0</Text>
        <Text style={styles.smallText}>Your personal workspace for notes, tasks, and productivity.</Text>
      </View>
    </View>
  </ScrollView>
);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const users = getUsers();
      if (users[currentUser]) {
        setUserData(users[currentUser]);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = localStorage.getItem('ticktick_oauth_token');
    if (oauthToken && currentUser && userData && !userData.ticktickToken) {
      localStorage.removeItem('ticktick_oauth_token');
      const users = getUsers();
      if (users[currentUser]) {
        users[currentUser].ticktickToken = oauthToken;
        saveUsers(users);
        setUserData({ ...users[currentUser] });
        setActiveTab('Tasks');
        setTimeout(async () => {
          try {
            const syncedTasks = await syncTasksWithTickTick(users[currentUser].tasks || [], oauthToken, () => {});
            users[currentUser].tasks = syncedTasks;
            saveUsers(users);
            setUserData({ ...users[currentUser] });
            Alert.alert('Sync Complete', `Synced ${syncedTasks.length} tasks from TickTick`);
          } catch (error) {
            console.error('Sync error:', error);
            Alert.alert('Sync Failed', error.message || 'Could not sync tasks');
          }
        }, 1000);
      }
    }
    if (params.get('oauth') === 'callback' || params.get('oauth') === 'success') {
      window.history.replaceState({}, '', '/lifeos/');
    }
  }, [currentUser, userData]);

  const refreshData = () => {
    const users = getUsers();
    if (currentUser && users[currentUser]) {
      setUserData({ ...users[currentUser] });
    }
  };

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    setUserData(null);
  };

  const [activeTab, setActiveTab] = useState('Home');

  if (!currentUser || !userData) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <HomeContent user={currentUser} />;
      case 'Pages': return <PagesContent userData={userData} />;
      case 'Tasks': return <TasksContent userData={userData} refreshData={refreshData} ticktickToken={userData.ticktickToken} />;
      case 'Calendar': return <CalendarContent />;
      case 'AI': return <AIContent />;
      case 'Settings': return <SettingsContent user={currentUser} onLogout={handleLogout} ticktickToken={userData.ticktickToken} refreshData={refreshData} setTicktickToken={(token) => {
        const users = getUsers();
        if (users[currentUser]) {
          users[currentUser].ticktickToken = token;
          saveUsers(users);
          setUserData({ ...users[currentUser] });
        }
      }} apiKeys={userData.apiKeys || {}} setApiKeys={(keys) => {
        const users = getUsers();
        if (users[currentUser]) {
          users[currentUser].apiKeys = keys;
          saveUsers(users);
          setUserData({ ...users[currentUser] });
        }
      }} />;
      default: return <HomeContent user={currentUser} />;
    }
  };

  const getIcon = (tab) => {
    switch (tab) {
      case 'Home': return '○';
      case 'Pages': return '◻';
      case 'Tasks': return '☑';
      case 'Calendar': return '▣';
      case 'AI': return '◈';
      case 'Settings': return '⚙';
      default: return '•';
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <View style={styles.tabBar}>
        {screens.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={styles.tabIcon}>{getIcon(tab)}</Text>
            <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  card: { backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.xl, padding: Spacing.xl, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: Colors.border },
  logo: { fontSize: 36, color: Colors.accent.primary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.body, color: Colors.text.secondary, textAlign: 'center', marginBottom: Spacing.lg },
  userList: { marginBottom: Spacing.lg },
  userListLabel: { fontSize: FontSizes.caption, color: Colors.text.muted, marginBottom: Spacing.sm },
  userButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  userBtn: { backgroundColor: Colors.background.tertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
  userBtnText: { color: Colors.accent.primary, fontSize: FontSizes.caption },
  error: { color: Colors.status.error, fontSize: FontSizes.caption, textAlign: 'center', marginBottom: Spacing.md },
  switchBtn: { marginTop: Spacing.lg },
  switchText: { color: Colors.accent.primary, fontSize: FontSizes.caption, textAlign: 'center' },
  showPassBtn: { marginBottom: Spacing.md },
  showPassText: { color: Colors.accent.primary, fontSize: FontSizes.caption },
});

const pagesStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  list: { flex: 1, paddingHorizontal: Spacing.lg },
  pageItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.secondary, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  pageIcon: { fontSize: 24, marginRight: Spacing.md },
  pageContent: { flex: 1 },
  pageTitle: { fontSize: FontSizes.body, color: Colors.text.primary, fontWeight: '500' },
  pageDate: { fontSize: FontSizes.small, color: Colors.text.muted, marginTop: 2 },
  title: { fontSize: FontSizes.h1, fontWeight: '700', color: Colors.text.primary },
});

const calendarStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: FontSizes.h1, fontWeight: '700', color: Colors.text.primary },
  monthView: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  monthText: { fontSize: FontSizes.h2, color: Colors.text.primary, fontWeight: '600' },
  daysHeader: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: FontSizes.caption, color: Colors.text.muted, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg },
  day: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: FontSizes.body, color: Colors.text.primary },
  today: { backgroundColor: Colors.accent.primary, borderRadius: 20 },
  todayText: { color: Colors.background.primary, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { flex: 1 },
  header: { padding: Spacing.lg, paddingTop: 60 },
  greeting: { fontSize: FontSizes.body, color: Colors.text.secondary },
  title: { fontSize: FontSizes.h1, fontWeight: '700', color: Colors.accent.primary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.secondary, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.body, color: Colors.text.primary },
  section: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.h3, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.md },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  actionButton: { width: '47%', backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionIcon: { fontSize: 24 },
  actionText: { marginTop: Spacing.sm, fontSize: FontSizes.caption, color: Colors.text.secondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 24, color: Colors.text.muted },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.background.secondary, borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 20, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: FontSizes.small, color: Colors.text.muted, marginTop: 2 },
  activeTabLabel: { color: Colors.accent.primary },
  smallButton: { backgroundColor: Colors.background.tertiary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md, marginLeft: 8 },
  smallButtonDisabled: { opacity: 0.6 },
  smallButtonText: { color: Colors.text.primary, fontSize: FontSizes.caption },
  input: { backgroundColor: Colors.background.tertiary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, fontSize: FontSizes.body, color: Colors.text.primary },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: FontSizes.caption, color: Colors.text.secondary, marginBottom: Spacing.sm },
  cancelBtn: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.text.muted, fontSize: FontSizes.body },
  saveBtn: { flex: 1, backgroundColor: Colors.accent.primary, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginLeft: Spacing.sm },
  saveBtnText: { color: Colors.background.primary, fontSize: FontSizes.body, fontWeight: '600' },
  deleteText: { fontSize: 18 },
  linkText: { color: Colors.accent.primary, fontSize: FontSizes.body, marginTop: Spacing.sm },
  smallText: { color: Colors.text.muted, fontSize: FontSizes.small, marginTop: Spacing.sm },
});

const tasksStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  headerActions: { flexDirection: 'row' },
  filters: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, marginRight: 8, backgroundColor: Colors.background.secondary },
  filterBtnActive: { backgroundColor: Colors.accent.primary },
  filterText: { fontSize: FontSizes.caption, color: Colors.text.muted },
  filterTextActive: { color: Colors.background.primary },
  list: { flex: 1, paddingHorizontal: Spacing.lg },
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.background.secondary, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  checkbox: { marginRight: Spacing.md, marginTop: 2 },
  checkboxText: { fontSize: 18 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: FontSizes.body, color: Colors.text.primary, fontWeight: '500' },
  taskDone: { textDecorationLine: 'line-through', color: Colors.text.muted },
  taskDesc: { fontSize: FontSizes.caption, color: Colors.text.muted, marginTop: 4 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  taskDate: { fontSize: FontSizes.small, color: Colors.text.muted },
  deleteBtn: { padding: Spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Spacing.lg },
  modal: { backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.xl, padding: Spacing.lg },
  modalTitle: { fontSize: FontSizes.h2, color: Colors.text.primary, marginBottom: Spacing.lg, fontWeight: '600' },
  priorityBtns: { flexDirection: 'row', marginBottom: Spacing.lg },
  priorityBtn: { flex: 1, padding: Spacing.sm, alignItems: 'center', backgroundColor: Colors.background.tertiary, marginRight: Spacing.sm, borderRadius: BorderRadius.md },
  priorityBtnActive: { backgroundColor: Colors.accent.primary },
  priorityBtnText: { color: Colors.text.primary, fontSize: FontSizes.caption, fontWeight: '600' },
  modalActions: { flexDirection: 'row' },
});

const settingsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: FontSizes.h1, fontWeight: '700', color: Colors.text.primary },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.h3, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: FontSizes.body, color: Colors.text.primary, fontWeight: '600', marginBottom: Spacing.xs },
  cardDesc: { fontSize: FontSizes.caption, color: Colors.text.muted },
  dangerBtn: { backgroundColor: Colors.status.error + '20', padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.status.error },
  dangerBtnText: { color: Colors.status.error, fontSize: FontSizes.body, fontWeight: '600' },
  connected: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  connectedText: { color: Colors.status.success, fontSize: FontSizes.body },
  savedText: { color: Colors.status.success, fontSize: FontSizes.caption, textAlign: 'center', marginBottom: Spacing.sm },
});
