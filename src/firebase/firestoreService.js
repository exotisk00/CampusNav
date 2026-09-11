import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config.js';
import { events as seedEvents } from '../data/events.js';
import { lostFoundItems as seedLostFound } from '../data/lostFound.js';
import { notifications as seedNotifications } from '../data/notifications.js';

// --- EVENTS ---

/**
 * Seed default events into Firestore if collection is empty
 */
export async function seedInitialEventsIfEmpty() {
  if (!isFirebaseConfigured || !db) return;

  try {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      seedEvents.forEach((evt) => {
        const docRef = doc(db, 'events', evt.id);
        batch.set(docRef, {
          ...evt,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
      console.log('Successfully seeded events in Firestore.');
    }
  } catch (err) {
    console.warn('Could not seed events in Firestore:', err?.message);
  }
}

/**
 * Real-time subscription to events collection
 */
export function subscribeToEvents(callback) {
  if (!isFirebaseConfigured || !db) {
    callback(seedEvents);
    return () => {};
  }

  const eventsRef = collection(db, 'events');
  const q = query(eventsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Trigger background seed and emit initial fallback
        seedInitialEventsIfEmpty();
        callback(seedEvents);
      } else {
        const events = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        callback(events);
      }
    },
    (err) => {
      console.warn('Firestore events listener error, using fallback:', err?.message);
      callback(seedEvents);
    }
  );
}

/**
 * Real-time subscription to a user's RSVP'd event IDs
 */
export function subscribeToUserRsvps(uid, callback) {
  if (!isFirebaseConfigured || !db || !uid) {
    callback(new Set(['evt_001', 'evt_002']));
    return () => {};
  }

  const rsvpsRef = collection(db, 'users', uid, 'rsvps');

  return onSnapshot(
    rsvpsRef,
    (snapshot) => {
      const ids = new Set(snapshot.docs.map((d) => d.id));
      callback(ids);
    },
    (err) => {
      console.warn('Firestore RSVPs listener error:', err?.message);
    }
  );
}

/**
 * Toggle RSVP for an event in Firestore
 */
export async function toggleEventRsvpInDb(uid, eventId, isRegistered) {
  if (!isFirebaseConfigured || !db || !uid) return;

  try {
    const rsvpDocRef = doc(db, 'users', uid, 'rsvps', eventId);
    const eventDocRef = doc(db, 'events', eventId);

    if (isRegistered) {
      // Remove RSVP
      await deleteDoc(rsvpDocRef);
      await updateDoc(eventDocRef, {
        attendees: increment(-1),
      }).catch(() => {});
    } else {
      // Add RSVP
      await setDoc(rsvpDocRef, {
        eventId,
        registeredAt: serverTimestamp(),
      });
      await updateDoc(eventDocRef, {
        attendees: increment(1),
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Error toggling RSVP in Firestore:', err);
  }
}

// --- LOST & FOUND ---

/**
 * Seed default lost & found items into Firestore if collection is empty
 */
export async function seedInitialLostFoundIfEmpty() {
  if (!isFirebaseConfigured || !db) return;

  try {
    const lfRef = collection(db, 'lost_found');
    const snapshot = await getDocs(lfRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      seedLostFound.forEach((item) => {
        const docRef = doc(db, 'lost_found', item.id);
        batch.set(docRef, {
          ...item,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
      console.log('Successfully seeded lost & found items in Firestore.');
    }
  } catch (err) {
    console.warn('Could not seed lost & found items in Firestore:', err?.message);
  }
}

/**
 * Real-time subscription to lost & found items collection
 */
export function subscribeToLostFound(callback) {
  if (!isFirebaseConfigured || !db) {
    callback(seedLostFound);
    return () => {};
  }

  const lfRef = collection(db, 'lost_found');
  const q = query(lfRef);

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialLostFoundIfEmpty();
        callback(seedLostFound);
      } else {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // Sort newest first
        items.sort((a, b) => (b.date > a.date ? 1 : -1));
        callback(items);
      }
    },
    (err) => {
      console.warn('Firestore lost_found listener error, using fallback:', err?.message);
      callback(seedLostFound);
    }
  );
}

/**
 * Add a new lost or found item to Firestore
 */
export async function addLostFoundItemToDb(item) {
  if (!isFirebaseConfigured || !db) {
    return { id: item.id || `lf_${Date.now()}`, ...item };
  }

  const lfRef = collection(db, 'lost_found');
  const docPayload = {
    ...item,
    status: item.status || 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(lfRef, docPayload);
  return {
    id: docRef.id,
    ...docPayload,
  };
}

/**
 * Mark a lost & found item as resolved
 */
export async function updateLostFoundStatusInDb(itemId, status) {
  if (!isFirebaseConfigured || !db || !itemId) return;

  try {
    const docRef = doc(db, 'lost_found', itemId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating lost & found status in Firestore:', err);
  }
}

// --- NOTIFICATIONS ---

// --- NOTIFICATIONS ---

/**
 * Seed initial notifications for a user in Firestore
 */
export async function seedInitialNotificationsIfEmpty(uid) {
  if (!isFirebaseConfigured || !db || !uid) return;

  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const batch = writeBatch(db);
      seedNotifications.forEach((n) => {
        const docRef = doc(collection(db, 'notifications'));
        const typeMapped = n.type === 'campus' ? 'announcement' : n.type;
        batch.set(docRef, {
          userId: uid,
          title: n.title,
          message: n.message,
          type: typeMapped,
          read: n.read || false,
          createdAt: serverTimestamp(),
          timestamp: n.timestamp || new Date().toISOString(),
          relatedId: n.actionUrl ? n.actionUrl.split('/').pop() || null : null,
          relatedType: typeMapped,
          actionUrl: n.actionUrl || null,
          icon: n.icon || 'Bell',
        });
      });
      await batch.commit();
      console.log('Successfully seeded user notifications into Firestore.');
    }
  } catch (err) {
    console.warn('Could not seed user notifications:', err?.message);
  }
}

/**
 * Create a new notification for a specific user in Firestore
 */
export async function createNotificationInDb(notif) {
  if (!notif?.userId) return null;

  const typeMapped = notif.type === 'campus' ? 'announcement' : (notif.type || 'system');
  const payload = {
    userId: notif.userId,
    title: notif.title || 'Campus Notification',
    message: notif.message || '',
    type: typeMapped,
    read: false,
    createdAt: serverTimestamp(),
    timestamp: new Date().toISOString(),
    relatedId: notif.relatedId || null,
    relatedType: notif.relatedType || typeMapped,
    actionUrl: notif.actionUrl || null,
    icon: notif.icon || 'Bell',
  };

  if (!isFirebaseConfigured || !db) {
    return { id: `notif_${Date.now()}`, ...payload };
  }

  try {
    const notifsRef = collection(db, 'notifications');
    const docRef = await addDoc(notifsRef, payload);
    return {
      id: docRef.id,
      ...payload,
    };
  } catch (err) {
    console.error('Error creating notification in Firestore:', err);
    return { id: `notif_${Date.now()}`, ...payload };
  }
}

/**
 * Real-time subscription to a user's notifications in Firestore
 */
export function subscribeToNotifications(uid, callback, onError) {
  if (!isFirebaseConfigured || !db || !uid) {
    const fallbackNotifs = seedNotifications.map((n) => ({
      ...n,
      userId: uid || 'usr_001',
      type: n.type === 'campus' ? 'announcement' : n.type,
      relatedId: n.actionUrl ? n.actionUrl.split('/').pop() || null : null,
      relatedType: n.type,
      createdAt: n.timestamp || new Date().toISOString(),
    }));
    callback(fallbackNotifs);
    return () => {};
  }

  const notifsRef = collection(db, 'notifications');
  const q = query(notifsRef, where('userId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialNotificationsIfEmpty(uid);
        callback([]);
      } else {
        const notifs = snapshot.docs.map((d) => {
          const data = d.data();
          const timestamp = data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.timestamp || data.createdAt || new Date().toISOString();
          return {
            id: d.id,
            ...data,
            timestamp,
          };
        });

        // Sort descending: newest notifications first
        notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(notifs);
      }
    },
    (err) => {
      console.warn('Firestore notifications listener error, using fallback:', err?.message);
      onError?.(err);
      callback(seedNotifications);
    }
  );
}

/**
 * Mark a notification as read
 */
export async function markNotificationReadInDb(uid, notifId) {
  if (!isFirebaseConfigured || !db || !notifId) return;

  try {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, {
      read: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // Fallback attempt to subcollection if created under user profile
    try {
      if (uid) {
        const subRef = doc(db, 'users', uid, 'notifications', notifId);
        await updateDoc(subRef, { read: true, updatedAt: serverTimestamp() });
      }
    } catch (fallbackErr) {
      console.error('Error marking notification read in Firestore:', fallbackErr);
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsReadInDb(uid, notifIds = []) {
  if (!isFirebaseConfigured || !db || notifIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    notifIds.forEach((id) => {
      const notifRef = doc(db, 'notifications', id);
      batch.update(notifRef, {
        read: true,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error marking all notifications read in Firestore:', err);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotificationFromDb(uid, notifId) {
  if (!isFirebaseConfigured || !db || !notifId) return;

  try {
    const notifRef = doc(db, 'notifications', notifId);
    await deleteDoc(notifRef);
  } catch (err) {
    if (uid) {
      try {
        const subRef = doc(db, 'users', uid, 'notifications', notifId);
        await deleteDoc(subRef);
      } catch (fallbackErr) {
        console.error('Error deleting notification from Firestore:', fallbackErr);
      }
    }
  }
}

/**
 * Clear all notifications
 */
export async function clearNotificationsFromDb(uid, notifIds = []) {
  if (!isFirebaseConfigured || !db || notifIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    notifIds.forEach((id) => {
      const notifRef = doc(db, 'notifications', id);
      batch.delete(notifRef);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error clearing notifications from Firestore:', err);
  }
}
