import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  WellnessCheckIn, 
  TaskItem, 
  HobbyItem, 
  ActivityRecommendation, 
  UserPreferences 
} from '../types';

export const USER_STORAGE_KEY = 'wellness_agent_current_user_id';

export function getCurrentUserId(): string {
  let uid = localStorage.getItem(USER_STORAGE_KEY);
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(USER_STORAGE_KEY, uid);
  }
  return uid;
}

export function switchUserId(newId: string): void {
  if (newId.trim()) {
    localStorage.setItem(USER_STORAGE_KEY, newId.trim());
  }
}

// Local storage fallback helpers for rock-solid reliability
function getLocalFallback<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFallback<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to local cache', err);
  }
}

// ---------------- CHECK-INS ----------------
export async function saveCheckIn(checkIn: WellnessCheckIn): Promise<void> {
  const collectionRef = collection(db, 'users', checkIn.userId, 'checkins');
  const docRef = doc(collectionRef, checkIn.id);
  try {
    await setDoc(docRef, checkIn);
  } catch (err) {
    console.warn('Firestore setDoc failed, writing to fallback local storage', err);
  }
  // Also sync to local storage cache
  const localKey = `checkins_${checkIn.userId}`;
  const list = getLocalFallback<WellnessCheckIn>(localKey).filter(i => i.id !== checkIn.id);
  list.unshift(checkIn);
  saveLocalFallback(localKey, list);
}

export async function getCheckIns(userId: string): Promise<WellnessCheckIn[]> {
  try {
    const collectionRef = collection(db, 'users', userId, 'checkins');
    const q = query(collectionRef, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results = snap.docs.map(d => d.data() as WellnessCheckIn);
      saveLocalFallback(`checkins_${userId}`, results);
      return results;
    }
  } catch (err) {
    console.warn('Firestore getCheckIns failed, falling back to cache', err);
  }
  return getLocalFallback<WellnessCheckIn>(`checkins_${userId}`);
}

// ---------------- TASKS ----------------
export async function saveTask(task: TaskItem): Promise<void> {
  const docRef = doc(collection(db, 'users', task.userId, 'tasks'), task.id);
  try {
    await setDoc(docRef, task);
  } catch (err) {
    console.warn('Firestore saveTask failed, fallback local storage', err);
  }
  const localKey = `tasks_${task.userId}`;
  const list = getLocalFallback<TaskItem>(localKey).filter(t => t.id !== task.id);
  list.unshift(task);
  saveLocalFallback(localKey, list);
}

export async function getTasks(userId: string): Promise<TaskItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'tasks');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results = snap.docs.map(d => d.data() as TaskItem);
      saveLocalFallback(`tasks_${userId}`, results);
      return results;
    }
  } catch (err) {
    console.warn('Firestore getTasks fallback', err);
  }
  return getLocalFallback<TaskItem>(`tasks_${userId}`);
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (err) {
    console.warn('Firestore deleteTask fallback', err);
  }
  const localKey = `tasks_${userId}`;
  const list = getLocalFallback<TaskItem>(localKey).filter(t => t.id !== taskId);
  saveLocalFallback(localKey, list);
}

// ---------------- HOBBIES ----------------
export async function saveHobby(hobby: HobbyItem): Promise<void> {
  const docRef = doc(collection(db, 'users', hobby.userId, 'hobbies'), hobby.id);
  try {
    await setDoc(docRef, hobby);
  } catch (err) {
    console.warn('Firestore saveHobby fallback', err);
  }
  const localKey = `hobbies_${hobby.userId}`;
  const list = getLocalFallback<HobbyItem>(localKey).filter(h => h.id !== hobby.id);
  list.unshift(hobby);
  saveLocalFallback(localKey, list);
}

export async function getHobbies(userId: string): Promise<HobbyItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'hobbies');
    const q = query(colRef, orderBy('startedAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results = snap.docs.map(d => d.data() as HobbyItem);
      saveLocalFallback(`hobbies_${userId}`, results);
      return results;
    }
  } catch (err) {
    console.warn('Firestore getHobbies fallback', err);
  }
  return getLocalFallback<HobbyItem>(`hobbies_${userId}`);
}

export async function deleteHobby(userId: string, hobbyId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'hobbies', hobbyId));
  } catch (err) {
    console.warn('Firestore deleteHobby fallback', err);
  }
  const localKey = `hobbies_${userId}`;
  const list = getLocalFallback<HobbyItem>(localKey).filter(h => h.id !== hobbyId);
  saveLocalFallback(localKey, list);
}

// ---------------- PREFERENCES ----------------
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const defaultPrefs: UserPreferences = {
    userId,
    budgetLevel: 'moderate',
    typicalAvailableTimeMinutes: 45,
    preferredLocation: 'San Francisco, CA',
    consentExternalAI: true,
    enableCrisisAssistance: true,
    theme: 'google-light',
    dietaryOrCookingPreferences: 'Healthy, fresh meals, quick weeknight dinners',
    readingPreferences: 'Mindfulness, non-fiction, sci-fi, biography',
    travelPreferences: 'Local nature parks, quiet cafés, art museums, walking trails',
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'users', userId, 'preferences', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserPreferences;
    }
  } catch (err) {
    console.warn('Firestore getUserPreferences fallback', err);
  }
  
  const local = localStorage.getItem(`preferences_${userId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // return default
    }
  }
  return defaultPrefs;
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
  try {
    const docRef = doc(db, 'users', prefs.userId, 'preferences', 'main');
    await setDoc(docRef, prefs);
  } catch (err) {
    console.warn('Firestore saveUserPreferences fallback', err);
  }
  localStorage.setItem(`preferences_${prefs.userId}`, JSON.stringify(prefs));
}

// ---------------- EXPORT & CLEAR DATA ----------------
export async function exportAllUserData(userId: string) {
  const checkins = await getCheckIns(userId);
  const tasks = await getTasks(userId);
  const hobbies = await getHobbies(userId);
  const preferences = await getUserPreferences(userId);

  return {
    exportedAt: new Date().toISOString(),
    userId,
    profile: preferences,
    wellnessCheckins: checkins,
    tasksAndGoals: tasks,
    hobbiesAndInterests: hobbies
  };
}

export async function clearAllUserData(userId: string): Promise<void> {
  // Clear local storage
  localStorage.removeItem(`checkins_${userId}`);
  localStorage.removeItem(`tasks_${userId}`);
  localStorage.removeItem(`hobbies_${userId}`);
  localStorage.removeItem(`preferences_${userId}`);
  localStorage.removeItem(`recommendations_${userId}`);
}
