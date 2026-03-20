import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { Icon, Button, Card } from '../../components/common';
import { useStore } from '../../store/workspace';
import type { Task, TaskPriority, TaskStatus } from '../../types';

interface TasksScreenProps {
  navigation: any;
}

type FilterType = 'all' | 'today' | 'week' | 'done';

export const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleSubtask } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('P3');

  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    switch (filter) {
      case 'today':
        return dueDate && dueDate.toDateString() === now.toDateString();
      case 'week':
        if (!dueDate) return false;
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= now && dueDate <= weekFromNow;
      case 'done':
        return task.status === 'done';
      default:
        return true;
    }
  });

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        status: 'todo',
        tags: [],
        subtasks: [],
        source: 'local',
      });
      setNewTaskTitle('');
      setShowNewTask(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'P1':
        return Colors.status.error;
      case 'P2':
        return Colors.status.warning;
      case 'P3':
        return Colors.accent.primary;
      case 'P4':
        return Colors.text.muted;
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => updateTask(item.id, { status: item.status === 'done' ? 'todo' : 'done' })}
      >
        <Icon
          name={item.status === 'done' ? 'checkCircle' : 'circle'}
          size={22}
          color={item.status === 'done' ? Colors.status.success : Colors.text.muted}
        />
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.status === 'done' && styles.taskCompleted]}>
          {item.title}
        </Text>
        {item.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
        {item.subtasks.length > 0 && (
          <Text style={styles.subtaskCount}>
            {item.subtasks.filter((st) => st.completed).length}/{item.subtasks.length} subtasks
          </Text>
        )}
      </View>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
        <Text style={styles.priorityText}>{item.priority}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowNewTask(true)}>
          <Icon name="plus" size={20} color={Colors.accent.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {(['all', 'today', 'week', 'done'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="task" size={48} color={Colors.text.muted} />
          <Text style={styles.emptyText}>No tasks found</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowNewTask(true)}>
            <Text style={styles.emptyButtonText}>Create a task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={showNewTask} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task title"
              placeholderTextColor={Colors.text.muted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: getPriorityColor(p) },
                    newTaskPriority === p && styles.prioritySelected,
                  ]}
                  onPress={() => setNewTaskPriority(p)}
                >
                  <Text style={styles.priorityOptionText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowNewTask(false)} />
              <Button title="Create" onPress={handleCreateTask} />
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
  },
  filterActive: {
    backgroundColor: Colors.accent.primary,
  },
  filterText: {
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  list: {
    padding: Spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    marginRight: Spacing.sm,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  dueDate: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
    marginTop: 2,
  },
  subtaskCount: {
    fontSize: FontSizes.small,
    color: Colors.accent.primary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: Colors.background.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.text.muted,
    marginTop: Spacing.md,
  },
  emptyButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.accent.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.background.primary,
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
  },
  modalTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  modalInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  modalLabel: {
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    opacity: 0.5,
  },
  prioritySelected: {
    opacity: 1,
  },
  priorityOptionText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.background.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
});
