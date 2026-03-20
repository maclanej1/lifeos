import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { Icon, Card } from '../../components/common';
import { useStore } from '../../store/workspace';
import type { Page } from '../../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { pages, tasks, events } = useStore();
  
  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate >= today && eventDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  const recentPages = pages.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to</Text>
        <Text style={styles.title}>LifeOS</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color={Colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Quick find... (Cmd+K)"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('NewPage')}
          >
            <Icon name="plus" size={24} color={Colors.accent.primary} />
            <Text style={styles.actionText}>New Page</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('NewTask')}
          >
            <Icon name="task" size={24} color={Colors.accent.tertiary} />
            <Text style={styles.actionText}>New Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DatabaseTabs', { screen: 'NewDatabase' })}
          >
            <Icon name="database" size={24} color={Colors.accent.secondary} />
            <Text style={styles.actionText}>New Database</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AI')}
          >
            <Icon name="bot" size={24} color={Colors.accent.primary} />
            <Text style={styles.actionText}>AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>

      {todayTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Card>
            {todayTasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { taskId: task.id } })}
              >
                <Icon
                  name={task.status === 'done' ? 'checkCircle' : 'circle'}
                  size={18}
                  color={task.status === 'done' ? Colors.status.success : Colors.text.muted}
                />
                <Text
                  style={[
                    styles.taskTitle,
                    task.status === 'done' && styles.taskCompleted,
                  ]}
                >
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {upcomingEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Card>
            {upcomingEvents.slice(0, 3).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => navigation.navigate('Calendar')}
              >
                <View style={[styles.eventDot, { backgroundColor: event.color || Colors.accent.primary }]} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {recentPages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Pages</Text>
          <Card>
            {recentPages.map((page) => (
              <TouchableOpacity
                key={page.id}
                style={styles.pageItem}
                onPress={() => navigation.navigate('PageDetail', { pageId: page.id })}
              >
                <Icon name="note" size={18} color={Colors.accent.primary} />
                <Text style={styles.pageTitle}>{page.title || 'Untitled'}</Text>
                <Icon name="chevronRight" size={16} color={Colors.text.muted} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      <View style={styles.aiWidget}>
        <View style={styles.aiWidgetHeader}>
          <Icon name="sparkles" size={20} color={Colors.accent.primary} />
          <Text style={styles.aiWidgetTitle}>AI Assistant</Text>
        </View>
        <Text style={styles.aiWidgetText}>
          Summarize, write, or ask anything
        </Text>
        <TouchableOpacity
          style={styles.aiWidgetButton}
          onPress={() => navigation.navigate('AI')}
        >
          <Text style={styles.aiWidgetButtonText}>Open AI</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
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
    paddingTop: Spacing.xl,
  },
  greeting: {
    fontSize: FontSizes.body,
    color: Colors.text.secondary,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.accent.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionButton: {
    width: '47%',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taskTitle: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  eventDate: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  aiWidget: {
    margin: Spacing.lg,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  aiWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aiWidgetTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  aiWidgetText: {
    fontSize: FontSizes.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  aiWidgetButton: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  aiWidgetButtonText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.background.primary,
  },
});
