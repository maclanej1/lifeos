import * as Calendar from 'react-native-calendar-events';
import type { CalendarEvent, CalendarSource, Calendar as CalendarType } from '../../types';

export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const result = await Calendar.requestCalendarPermissions();
    return result === 'authorized';
  } catch (error) {
    console.error('Calendar permission error:', error);
    return false;
  }
}

export async function fetchCalendars(): Promise<CalendarType[]> {
  try {
    const calendars = await Calendar.fetchAllCalendars();
    return calendars.map((cal) => ({
      id: cal.id,
      name: cal.title,
      color: cal.color || '#00D9FF',
      source: mapSource(cal.source),
      externalId: cal.id,
      visible: cal.allowsModifications,
    }));
  } catch (error) {
    console.error('Fetch calendars error:', error);
    return [];
  }
}

function mapSource(source: string): CalendarSource {
  switch (source.toLowerCase()) {
    case 'local':
      return 'local';
    case 'com.apple':
      return 'apple';
    case 'com.google':
      return 'google';
    default:
      return 'local';
  }
}

export async function fetchEvents(
  calendarId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    const events = await Calendar.fetchAllEvents(
      startDate.toISOString(),
      endDate.toISOString(),
      [calendarId]
    );

    return events.map((event) => ({
      id: event.id,
      title: event.title || 'Untitled',
      description: event.notes || undefined,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      allDay: event.allDay || false,
      calendarId: event.calendarId,
      source: 'local',
      externalId: event.id,
      location: event.location || undefined,
      color: event.calendar?.color,
    }));
  } catch (error) {
    console.error('Fetch events error:', error);
    return [];
  }
}

export async function createCalendarEvent(
  calendarId: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string | null> {
  try {
    const result = await Calendar.createEvent(calendarId, {
      title: event.title,
      notes: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString(),
      allDay: event.allDay,
      location: event.location,
    });
    return result;
  } catch (error) {
    console.error('Create event error:', error);
    return null;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<boolean> {
  try {
    await Calendar.updateEvent(eventId, {
      title: updates.title,
      notes: updates.description,
      startDate: updates.startDate?.toISOString(),
      endDate: updates.endDate?.toISOString(),
      allDay: updates.allDay,
      location: updates.location,
    });
    return true;
  } catch (error) {
    console.error('Update event error:', error);
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    await Calendar.removeEvent(eventId);
    return true;
  } catch (error) {
    console.error('Delete event error:', error);
    return false;
  }
}

export const GoogleCalendarService = {
  async fetchEvents(
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) throw new Error('Google API error');

      const data = await response.json();
      return (data.items || []).map((event: any) => ({
        id: `google-${event.id}`,
        title: event.summary || 'Untitled',
        description: event.description,
        startDate: new Date(event.start?.dateTime || event.start?.date),
        endDate: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
        allDay: !!event.start?.date,
        calendarId: 'google-primary',
        source: 'google' as CalendarSource,
        externalId: event.id,
        location: event.location,
      }));
    } catch (error) {
      console.error('Google calendar fetch error:', error);
      return [];
    }
  },

  async createEvent(accessToken: string, event: Omit<CalendarEvent, 'id'>): Promise<string | null> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            location: event.location,
            start: event.allDay
              ? { date: event.startDate.toISOString().split('T')[0] }
              : { dateTime: event.startDate.toISOString() },
            end: event.allDay
              ? { date: event.endDate?.toISOString().split('T')[0] }
              : { dateTime: event.endDate?.toISOString() },
          }),
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Google create event error:', error);
      return null;
    }
  },
};

export const OutlookCalendarService = {
  async fetchEvents(
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendar/events?$filter=start/dateTime ge '${start}' and end/dateTime le '${end}'`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) throw new Error('Outlook API error');

      const data = await response.json();
      return (data.value || []).map((event: any) => ({
        id: `outlook-${event.id}`,
        title: event.subject || 'Untitled',
        description: event.bodyPreview,
        startDate: new Date(event.start.dateTime),
        endDate: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
        allDay: event.isAllDay,
        calendarId: 'outlook-primary',
        source: 'outlook' as CalendarSource,
        externalId: event.id,
        location: event.location?.displayName,
      }));
    } catch (error) {
      console.error('Outlook calendar fetch error:', error);
      return [];
    }
  },
};
