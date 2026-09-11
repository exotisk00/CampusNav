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
  createNotificationInDb,
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

  // Real-time notifications state
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);

  // 4. Subscribe to real-time user Notifications
  useEffect(() => {
    if (!uid) {
      setNotificationsLoading(false);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError(null);

    const unsubscribe = subscribeToNotifications(
      uid,
      (liveNotifs) => {
        setNotifications(liveNotifs || []);
        localStorage.setItem(KEYS.notifications, JSON.stringify(liveNotifs || []));
        setNotificationsLoading(false);
      },
      (err) => {
        setNotificationsError(err?.message || 'Failed to sync notifications');
        setNotificationsLoading(false);
      }
    );

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

  /**
   * Helper to create a new notification in state and Firestore
   */
  const createNotification = useCallback(
    async (notifData) => {
      const recipientUid = notifData.userId || uid;
      if (!recipientUid) return;

      const newNotif = {
        id: notifData.id || `notif_${Date.now()}`,
        userId: recipientUid,
        title: notifData.title || 'Campus Notification',
        message: notifData.message || '',
        type: notifData.type || 'system',
        read: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        relatedId: notifData.relatedId || null,
        relatedType: notifData.relatedType || notifData.type || 'system',
        actionUrl: notifData.actionUrl || null,
        icon: notifData.icon || 'Bell',
      };

      // Optimistically update local state if notification is for current user
      if (recipientUid === uid) {
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
      }

      if (isFirebaseConfigured) {
        try {
          await createNotificationInDb(newNotif);
        } catch (err) {
          console.error('Error writing notification to Firestore:', err);
        }
      }
    },
    [uid]
  );

  const addLostFoundItem = useCallback(
    async (item) => {
      setLostFoundItems((prev) => [item, ...prev]);

      // 1. Create a confirmation notification for the poster
      if (uid) {
        createNotification({
          userId: uid,
          title: item.type === 'lost' ? 'Lost Item Reported' : 'Found Item Reported',
          message: `Your report for "${item.title}" at ${item.location} is active on the campus board.`,
          type: 'lost_found',
          relatedId: item.id,
          relatedType: 'lost_found',
          actionUrl: '/lost-found',
          icon: 'Search',
        });
      }

      // 2. If item is "found", check if any other user reported a matching "lost" item
      if (item.type === 'found') {
        const itemWords = item.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const matches = lostFoundItems.filter(
          (other) =>
            other.type === 'lost' &&
            other.postedBy &&
            other.postedBy !== uid &&
            (other.category === item.category ||
              itemWords.some((w) => other.title.toLowerCase().includes(w)))
        );

        matches.forEach((matchedItem) => {
          createNotification({
            userId: matchedItem.postedBy,
            title: 'Potential Match for Your Lost Item',
            message: `A found item ("${item.title}") was reported at ${item.location}. Check the board to see if it's yours!`,
            type: 'lost_found',
            relatedId: item.id,
            relatedType: 'lost_found',
            actionUrl: '/lost-found',
            icon: 'Search',
          });
        });
      }

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
    [uid, user, createNotification, lostFoundItems]
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

      // If registering, create an event confirmation notification
      if (!isCurrentlyRegistered && uid) {
        const event = eventsList.find((e) => e.id === eventId);
        if (event) {
          createNotification({
            userId: uid,
            title: `RSVP Confirmed: ${event.title}`,
            message: `You're registered for ${event.title} on ${event.date} at ${event.location}.`,
            type: 'event',
            relatedId: eventId,
            relatedType: 'event',
            actionUrl: `/events/${eventId}`,
            icon: 'Calendar',
          });
        }
      }

      if (isFirebaseConfigured && uid) {
        try {
          await toggleEventRsvpInDb(uid, eventId, isCurrentlyRegistered);
        } catch (err) {
          console.error('Error updating RSVP in Firestore:', err);
        }
      }
    },
    [registeredEventIds, uid, eventsList, createNotification]
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
      notificationsLoading,
      notificationsError,
      createNotification,
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
      notificationsLoading,
      notificationsError,
      createNotification,
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
