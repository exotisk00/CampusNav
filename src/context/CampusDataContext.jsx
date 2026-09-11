import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { events as seedEvents } from '../data/events';
import { lostFoundItems as seedLostFound } from '../data/lostFound';
import { notifications as seedNotifications } from '../data/notifications';
import {
  subscribeToEvents,
  subscribeToLostFound,
  subscribeToUserRsvps,
  subscribeToNotifications,
  addLostFoundItemToDb,
  toggleEventRsvpInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
  deleteNotificationFromDb,
  clearNotificationsFromDb,
  isFirebaseConfigured,
} from '../firebase';

const CampusDataContext = createContext(null);

const KEYS = {
  lostFound: 'campusnav_lost_found',
  rsvp: 'campusnav_rsvp',
  notifications: 'campusnav_notifications',
  language: 'campusnav_language',
  settings: 'campusnav_settings',
};

const defaultSettings = {
  notifications: true,
  eventReminders: true,
  lostFoundAlerts: true,
  emailDigest: false,
  highContrastMap: false,
  autoCenterMap: true,
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function CampusDataProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid || user?.id;

  // Real-time collections state
  const [eventsList, setEventsList] = useState(seedEvents);
  const [lostFoundItems, setLostFoundItems] = useState(() =>
    loadJson(KEYS.lostFound, seedLostFound)
  );
  const [registeredEventIds, setRegisteredEventIds] = useState(
    () => new Set(loadJson(KEYS.rsvp, ['evt_001', 'evt_002']))
  );
  const [notifications, setNotifications] = useState(() =>
    loadJson(KEYS.notifications, seedNotifications)
  );
  const [language, setLanguageState] = useState(() =>
    loadJson(KEYS.language, 'en')
  );
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...loadJson(KEYS.settings, {}),
  }));

  // 1. Subscribe to real-time events from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEventsList(liveEvents);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to real-time Lost & Found items from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToLostFound((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setLostFoundItems(liveItems);
        localStorage.setItem(KEYS.lostFound, JSON.stringify(liveItems));
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Subscribe to real-time user RSVPs
  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToUserRsvps(uid, (rsvps) => {
      if (rsvps) {
        setRegisteredEventIds(rsvps);
        localStorage.setItem(KEYS.rsvp, JSON.stringify([...rsvps]));
      }
    });
    return () => unsubscribe();
  }, [uid]);

  // 4. Subscribe to real-time user Notifications
  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToNotifications(uid, (liveNotifs) => {
      if (liveNotifs) {
        setNotifications(liveNotifs);
        localStorage.setItem(KEYS.notifications, JSON.stringify(liveNotifs));
      }
    });
    return () => unsubscribe();
  }, [uid]);

  // Sync state changes to local storage
  useEffect(() => {
    localStorage.setItem(KEYS.language, JSON.stringify(language));
    document.documentElement.lang = language || 'en';
  }, [language]);

  useEffect(() => {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const addLostFoundItem = useCallback(
    async (item) => {
      setLostFoundItems((prev) => [item, ...prev]);

      if (isFirebaseConfigured) {
        try {
          await addLostFoundItemToDb({
            ...item,
            postedBy: uid || 'anonymous',
            postedByName: user?.name || 'Campus Student',
          });
        } catch (err) {
          console.error('Error adding lost/found item to Firestore:', err);
        }
      }
    },
    [uid, user]
  );

  const toggleEventRsvp = useCallback(
    async (eventId) => {
      const isCurrentlyRegistered = registeredEventIds.has(eventId);

      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        localStorage.setItem(KEYS.rsvp, JSON.stringify([...next]));
        return next;
      });

      if (isFirebaseConfigured && uid) {
        try {
          await toggleEventRsvpInDb(uid, eventId, isCurrentlyRegistered);
        } catch (err) {
          console.error('Error updating RSVP in Firestore:', err);
        }
      }
    },
    [registeredEventIds, uid]
  );

  const isEventRegistered = useCallback(
    (eventId) => registeredEventIds.has(eventId),
    [registeredEventIds]
  );

  const markNotificationRead = useCallback(
    async (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (isFirebaseConfigured && uid) {
        await markNotificationReadInDb(uid, id);
      }
    },
    [uid]
  );

  const markAllNotificationsRead = useCallback(
    async () => {
      const ids = notifications.map((n) => n.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (isFirebaseConfigured && uid && ids.length > 0) {
        await markAllNotificationsReadInDb(uid, ids);
      }
    },
    [notifications, uid]
  );

  const deleteNotification = useCallback(
    async (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (isFirebaseConfigured && uid) {
        await deleteNotificationFromDb(uid, id);
      }
    },
    [uid]
  );

  const clearNotifications = useCallback(
    async () => {
      const ids = notifications.map((n) => n.id);
      setNotifications([]);
      if (isFirebaseConfigured && uid && ids.length > 0) {
        await clearNotificationsFromDb(uid, ids);
      }
    },
    [notifications, uid]
  );

  const setLanguage = useCallback((code) => setLanguageState(code), []);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = useMemo(
    () => ({
      events: eventsList,
      lostFoundItems,
      addLostFoundItem,
      registeredEventIds,
      toggleEventRsvp,
      isEventRegistered,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearNotifications,
      language,
      setLanguage,
      settings,
      updateSettings,
    }),
    [
      eventsList,
      lostFoundItems,
      addLostFoundItem,
      registeredEventIds,
      toggleEventRsvp,
      isEventRegistered,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearNotifications,
      language,
      setLanguage,
      settings,
      updateSettings,
    ]
  );

  return (
    <CampusDataContext.Provider value={value}>
      {children}
    </CampusDataContext.Provider>
  );
}

export function useCampusData() {
  const context = useContext(CampusDataContext);
  if (!context) {
    throw new Error('useCampusData must be used within a CampusDataProvider');
  }
  return context;
}
