import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseAuthProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { currentUser as fallbackCurrentUser } from '../data/users';
import { seedInitialNotificationsIfEmpty } from './firestoreService';

/**
 * Format user data blending Firebase Auth and Firestore profile
 */
export function formatUserData(firebaseUser, firestoreProfile = {}) {
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firestoreProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Campus Student',
    avatar: firestoreProfile?.avatar || firebaseUser.photoURL || null,
    department: firestoreProfile?.department || 'Computer Science & Engineering',
    year: firestoreProfile?.year || '1st Year',
    studentId: firestoreProfile?.studentId || 'STU' + firebaseUser.uid.slice(0, 6).toUpperCase(),
    phone: firestoreProfile?.phone || '',
    bio: firestoreProfile?.bio || 'Campus student and explorer.',
    joinedDate: firestoreProfile?.joinedDate || new Date().toISOString().split('T')[0],
    settings: firestoreProfile?.settings || {
      notifications: true,
      emailAlerts: true,
      darkMode: false,
      language: 'en',
    },
  };
}

/**
 * Register a new user with Firebase Auth and initialize Firestore profile
 */
export async function signUpUser(email, password, profileData = {}) {
  if (!isFirebaseConfigured || !auth || !db) {
    const mockUser = {
      ...fallbackCurrentUser,
      ...profileData,
      id: `usr_${Date.now()}`,
      email,
    };
    return { success: true, user: mockUser };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  // Update Firebase Auth display name
  if (profileData.name) {
    try {
      await updateFirebaseAuthProfile(fbUser, {
        displayName: profileData.name,
      });
    } catch (err) {
      console.warn('Could not update Firebase Auth displayName:', err);
    }
  }

  // Create profile document in Firestore
  const profilePayload = {
    uid: fbUser.uid,
    email: fbUser.email,
    name: profileData.name || '',
    department: profileData.department || 'Computer Science & Engineering',
    year: profileData.year || '1st Year',
    studentId: profileData.studentId || ('STU' + Math.floor(100000 + Math.random() * 900000)),
    phone: profileData.phone || '',
    bio: profileData.bio || 'Campus student and explorer.',
    avatar: null,
    joinedDate: new Date().toISOString().split('T')[0],
    settings: {
      notifications: true,
      emailAlerts: true,
      darkMode: false,
      language: 'en',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, profilePayload);
    // Seed initial welcome notifications for the student
    await seedInitialNotificationsIfEmpty(fbUser.uid);
  } catch (err) {
    console.error('Error writing user profile to Firestore:', err);
  }

  return {
    success: true,
    user: formatUserData(fbUser, profilePayload),
  };
}

/**
 * Sign in user with email and password
 */
export async function loginUser(email, password) {
  if (!isFirebaseConfigured || !auth || !db) {
    return { success: true, user: fallbackCurrentUser };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  // Fetch Firestore profile
  let firestoreProfile = {};
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      firestoreProfile = snap.data();
    } else {
      // Initialize if missing
      firestoreProfile = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || 'Campus Student',
        joinedDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, firestoreProfile);
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore:', err);
  }

  return {
    success: true,
    user: formatUserData(fbUser, firestoreProfile),
  };
}

/**
 * Sign in or create demo student user seamlessly
 */
export async function loginDemoUser() {
  const demoEmail = 'anish.kumar@university.edu';
  const demoPassword = 'password123';

  if (!isFirebaseConfigured || !auth || !db) {
    return { success: true, user: fallbackCurrentUser };
  }

  try {
    return await loginUser(demoEmail, demoPassword);
  } catch (err) {
    // If user does not exist yet, auto-provision demo user
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        return await signUpUser(demoEmail, demoPassword, {
          name: fallbackCurrentUser.name,
          department: fallbackCurrentUser.department,
          year: fallbackCurrentUser.year,
          studentId: fallbackCurrentUser.studentId,
          phone: fallbackCurrentUser.phone,
          bio: fallbackCurrentUser.bio,
        });
      } catch (signupErr) {
        console.warn('Auto-provision demo user failed:', signupErr);
        throw signupErr;
      }
    }
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  if (auth && isFirebaseConfigured) {
    await signOut(auth);
  }
}

/**
 * Update user profile in Firestore and Firebase Auth
 */
export async function updateUserProfile(uid, updates) {
  if (!uid) return;

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating Firestore profile:', err);
    }
  }

  if (isFirebaseConfigured && auth?.currentUser) {
    const authUpdates = {};
    if (updates.name) authUpdates.displayName = updates.name;
    if (updates.avatar) authUpdates.photoURL = updates.avatar;

    if (Object.keys(authUpdates).length > 0) {
      try {
        await updateFirebaseAuthProfile(auth.currentUser, authUpdates);
      } catch (err) {
        console.warn('Could not update Firebase Auth profile:', err);
      }
    }
  }
}

/**
 * Translate Firebase Auth error codes to user-friendly strings
 */
export function translateAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid university email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'No registered account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a few minutes.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback) {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    let firestoreProfile = {};
    if (db) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          firestoreProfile = snap.data();
        }
      } catch (err) {
        console.warn('Failed to load user profile from Firestore:', err);
      }
    }

    callback(formatUserData(firebaseUser, firestoreProfile));
  });
}
