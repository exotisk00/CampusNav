import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

/**
 * Upload student profile avatar to Firebase Storage
 * Stored at: users/{uid}/avatar_{timestamp}.{ext}
 */
export async function uploadAvatar(file, uid) {
  if (!file) return null;

  if (!isFirebaseConfigured || !storage) {
    console.info('Firebase Storage not configured: using object URL preview');
    return URL.createObjectURL(file);
  }

  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `avatar_${Date.now()}.${extension}`;
  const avatarRef = ref(storage, `users/${uid}/${fileName}`);

  const metadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      uploadedBy: uid,
      purpose: 'user_avatar',
    },
  };

  const uploadResult = await uploadBytes(avatarRef, file, metadata);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}

/**
 * Upload lost or found item photo to Firebase Storage
 * Stored at: lost_found/{uid}_{timestamp}_{filename}
 */
export async function uploadLostFoundImage(file, uid = 'anonymous') {
  if (!file) return null;

  if (!isFirebaseConfigured || !storage) {
    console.info('Firebase Storage not configured: using object URL preview');
    return URL.createObjectURL(file);
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${uid}_${Date.now()}_${cleanName}`;
  const itemPhotoRef = ref(storage, `lost_found/${fileName}`);

  const metadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      uploadedBy: uid,
      purpose: 'lost_found_item',
    },
  };

  const uploadResult = await uploadBytes(itemPhotoRef, file, metadata);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}
