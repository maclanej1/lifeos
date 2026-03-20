import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { Icon, Button, Card } from '../../components/common';
import { useStore } from '../../store/workspace';
import type { CalendarEvent } from '../../types';

interface CalendarScreenProps {
  navigation: any;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { events, addEvent, calendars } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventAllDay, setNewEventAllDay] = useState(true);

  const markedDates = events.reduce((acc, event) => {
    const dateKey = new Date(event.startDate).toISOString().split('T')[0];
    acc[dateKey] = {
      marked: true,
      dotColor: event.color || Colors.accent.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: Colors.accent.primary,
  };

  const selectedEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    return eventDate === selectedDate;
  });

  const handleCreateEvent = () => {
    if (newEventTitle.trim()) {
      const date = new Date(selectedDate);
      addEvent({
        title: newEventTitle.trim(),
        startDate: date,
        endDate: new Date(date.getTime() + 60 * 60 * 1000),
        allDay: newEventAllDay,
        calendarId: calendars[0]?.id || 'local',
        source: 'local',
      });
      setNewEventTitle('');
      setShowNewEvent(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowNewEvent(true)}>
          <Icon name="plus" size={20} color={Colors.accent.primary} />
        </TouchableOpacity>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.background.primary,
          calendarBackground: Colors.background.primary,
          textSectionTitleColor: Colors.text.secondary,
          selectedDayBackgroundColor: Colors.accent.primary,
          selectedDayTextColor: Colors.background.primary,
          todayTextColor: Colors.accent.primary,
          dayTextColor: Colors.text.primary,
          textDisabledColor: Colors.text.muted,
          monthTextColor: Colors.text.primary,
          arrowColor: Colors.accent.primary,
          textMonthFontWeight: '700',
          textDayFontSize: 14,
          textMonthFontSize: 18,
        }}
        style={styles.calendar}
      />

      <View style={styles.eventsSection}>
        <Text style={styles.eventsTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {selectedEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No events</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {selectedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => {}}
              >
                <View style={[styles.eventColor, { backgroundColor: event.color || Colors.accent.primary }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    {event.allDay
                      ? 'All day'
                      : `${new Date(event.startDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${event.endDate ? new Date(event.endDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Modal visible={showNewEvent} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Event title"
              placeholderTextColor={Colors.text.muted}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              autoFocus
            />
            <TouchableOpacity
              style={styles.allDayToggle}
              onPress={() => setNewEventAllDay(!newEventAllDay)}
            >
              <Text style={styles.allDayLabel}>All day</Text>
              <Icon
                name={newEventAllDay ? 'checkCircle' : 'circle'}
                size={22}
                color={newEventAllDay ? Colors.accent.primary : Colors.text.muted}
              />
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowNewEvent(false)} />
              <Button title="Create" onPress={handleCreateEvent} />
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventsSection: {
    flex: 1,
    padding: Spacing.lg,
  },
  eventsTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  eventsList: {
    gap: Spacing.sm,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  eventTime: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
    marginTop: 2,
  },
  empty: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.text.muted,
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
  allDayToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  allDayLabel: {
    fontSize: FontSizes.body,
    color: Colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
});
