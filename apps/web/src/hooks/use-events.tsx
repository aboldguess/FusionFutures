/**
 * @file use-events.tsx
 * @description Mini README: Centralised events management context powering CRUD operations, attendee controls, and
 * persistence. Structure: imports, types, localStorage helpers, context implementation, and consumer hook. The
 * provider keeps seeded demo data immutable while exposing ergonomic mutations for administrators.
 */

'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { seedEvents } from '@/data/events';
import type { EventRecord } from '@/types/platform';
import { logger } from '@/lib/logger';

interface EventsContextValue {
  events: EventRecord[];
  createEvent: (payload: EventCreatePayload) => EventRecord;
  updateEvent: (eventId: string, updates: EventUpdatePayload) => void;
  deleteEvent: (eventId: string) => void;
  registerAttendee: (eventId: string, accountId: string) => void;
  removeAttendee: (eventId: string, accountId: string) => void;
  resetEvents: () => void;
}

interface EventCreatePayload {
  ownerId: string;
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
  mode: EventRecord['mode'];
  visibility: EventRecord['visibility'];
  banner?: string;
  contributors?: string[];
}

type EventUpdatePayload = Partial<Omit<EventRecord, 'id'>>;

const STORAGE_KEY = 'fusion-futures::events-v1';

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

function persistEvents(nextEvents: EventRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
  } catch (error) {
    logger.error('Failed to persist events to localStorage', { error });
  }
}

function resolveIsoTimestamp(input: string) {
  // Normalise date strings coming from datetime-local inputs. When the browser
  // cannot construct a Date (e.g. invalid string) we fall back to the original
  // value so validation can highlight the issue upstream.
  const timestamp = new Date(input);
  return Number.isNaN(timestamp.getTime()) ? input : timestamp.toISOString();
}

function selectFallbackBanner() {
  const fallbackPool = [
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
  ];

  const index = Math.floor(Math.random() * fallbackPool.length);
  return fallbackPool[index];
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventRecord[]>(() => seedEvents);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as EventRecord[];
        if (Array.isArray(stored) && stored.length > 0) {
          setEvents(stored);
          logger.info('Events hydrated from localStorage', { count: stored.length });
          return;
        }
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEvents));
      logger.info('Events storage reseeded with defaults');
    } catch (error) {
      logger.error('Failed to hydrate events from localStorage', { error });
    }
  }, []);

  const createEvent = useCallback(
    ({ ownerId, title, summary, location, startDate, endDate, mode, visibility, banner, contributors }: EventCreatePayload) => {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `event-${Date.now()}`;
      const timestamp = new Date().toISOString();
      const nextEvent: EventRecord = {
        id,
        ownerId,
        title,
        summary,
        location,
        startDate: resolveIsoTimestamp(startDate),
        endDate: resolveIsoTimestamp(endDate),
        mode,
        visibility,
        banner: banner ?? selectFallbackBanner(),
        attendees: [],
        contributors: contributors && contributors.length > 0 ? contributors : [ownerId]
      };

      setEvents((previous) => {
        const next = [nextEvent, ...previous];
        persistEvents(next);
        logger.info('Event created', { id, ownerId, createdAt: timestamp });
        return next;
      });

      return nextEvent;
    },
    []
  );

  const updateEvent = useCallback((eventId: string, updates: EventUpdatePayload) => {
    setEvents((previous) => {
      const next = previous.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const nextEvent: EventRecord = {
          ...event,
          ...updates,
          startDate: updates.startDate ? resolveIsoTimestamp(updates.startDate) : event.startDate,
          endDate: updates.endDate ? resolveIsoTimestamp(updates.endDate) : event.endDate,
          attendees: updates.attendees ?? event.attendees,
          contributors: updates.contributors ?? event.contributors
        };

        logger.info('Event updated', { id: eventId });
        return nextEvent;
      });

      persistEvents(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((previous) => {
      const next = previous.filter((event) => event.id !== eventId);
      persistEvents(next);
      logger.warn('Event removed', { id: eventId });
      return next;
    });
  }, []);

  const registerAttendee = useCallback((eventId: string, accountId: string) => {
    setEvents((previous) => {
      const next = previous.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        if (event.attendees.includes(accountId)) {
          logger.info('Attendee already registered for event', { eventId, accountId });
          return event;
        }

        const updated: EventRecord = {
          ...event,
          attendees: [...event.attendees, accountId]
        };

        logger.info('Attendee added to event', { eventId, accountId });
        return updated;
      });

      persistEvents(next);
      return next;
    });
  }, []);

  const removeAttendee = useCallback((eventId: string, accountId: string) => {
    setEvents((previous) => {
      const next = previous.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        if (!event.attendees.includes(accountId)) {
          logger.info('Attempted to remove non-existent attendee', { eventId, accountId });
          return event;
        }

        const updated: EventRecord = {
          ...event,
          attendees: event.attendees.filter((attendee) => attendee !== accountId)
        };

        logger.info('Attendee removed from event', { eventId, accountId });
        return updated;
      });

      persistEvents(next);
      return next;
    });
  }, []);

  const resetEvents = useCallback(() => {
    setEvents(seedEvents);
    persistEvents(seedEvents);
    logger.info('Events reset to seed data');
  }, []);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      createEvent,
      updateEvent,
      deleteEvent,
      registerAttendee,
      removeAttendee,
      resetEvents
    }),
    [createEvent, deleteEvent, events, registerAttendee, removeAttendee, resetEvents, updateEvent]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }

  return context;
}
