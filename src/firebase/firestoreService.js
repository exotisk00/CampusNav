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
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { events as seedEvents } from '../data/events';
import { lostFoundItems as seedLostFound } from '../data/lostFound';
import { notifications as seedNotifications } from '../data/notifications';

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

/**
 * Seed initial notifications for a user in Firestore
 */
export async function seedInitialNotificationsIfEmpty(uid) {
  if (!isFirebaseConfigured || !db || !uid) return;

  try {
    const notifsRef = collection(db, 'users', uid, 'notifications');
    const snapshot = await getDocs(notifsRef);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      seedNotifications.forEach((n) => {
        const docRef = doc(db, 'users', uid, 'notifications', n.id);
        batch.set(docRef, {
          ...n,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Could not seed user notifications:', err?.message);
  }
}

/**
 * Real-time subscription to a user's notifications
 */
export function subscribeToNotifications(uid, callback) {
  if (!isFirebaseConfigured || !db || !uid) {
    callback(seedNotifications);
    return () => {};
  }

  const notifsRef = collection(db, 'users', uid, 'notifications');

  return onSnapshot(
    notifsRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialNotificationsIfEmpty(uid);
        callback(seedNotifications);
      } else {
        const notifs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // Sort by timestamp descending
        notifs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        callback(notifs);
      }
    },
    (err) => {
      console.warn('Firestore notifications listener error:', err?.message);
      callback(seedNotifications);
    }
  );
}

/**
 * Mark a notification as read
 */
export async function markNotificationReadInDb(uid, notifId) {
  if (!isFirebaseConfigured || !db || !uid || !notifId) return;

  try {
    const notifRef = doc(db, 'users', uid, 'notifications', notifId);
    await updateDoc(notifRef, { read: true });
  } catch (err) {
    console.error('Error marking notification read in Firestore:', err);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsReadInDb(uid, notifIds = []) {
  if (!isFirebaseConfigured || !db || !uid || notifIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    notifIds.forEach((id) => {
      const notifRef = doc(db, 'users', uid, 'notifications', id);
      batch.update(notifRef, { read: true });
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
  if (!isFirebaseConfigured || !db || !uid || !notifId) return;

  try {
    const notifRef = doc(db, 'users', uid, 'notifications', notifId);
    await deleteDoc(notifRef);
  } catch (err) {
    console.error('Error deleting notification from Firestore:', err);
  }
}

/**
 * Clear all notifications
 */
export async function clearNotificationsFromDb(uid, notifIds = []) {
  if (!isFirebaseConfigured || !db || !uid || notifIds.length === 0) return;

  try {
    const batch = writeBatch(db);
    notifIds.forEach((id) => {
      const notifRef = doc(db, 'users', uid, 'notifications', id);
      batch.delete(notifRef);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error clearing notifications from Firestore:', err);
  }
}
