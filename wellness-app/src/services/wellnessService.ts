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
  UserPreferences,
  AIChatMessage,
  CompanionType,
  AppTheme 
} from '../types';

export const USER_STORAGE_KEY = 'wellness_agent_current_user_id';
export const USER_NAME_STORAGE_KEY = 'whohum_username';

export interface UserDataSummary {
  exists: boolean;
  userId: string;
  userName: string;
  checkInCount: number;
  taskCount: number;
  hobbyCount: number;
  messageCount: number;
  savedCompanion?: CompanionType;
  savedTheme?: AppTheme;
  preferences?: UserPreferences;
}

export function sanitizeUsernameToId(name: string): string {
  const clean = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
  return 'user_' + (clean || 'friend');
}

export function getCurrentUserName(): string {
  return localStorage.getItem(USER_NAME_STORAGE_KEY) || 'Friend';
}

export function setUserNameAndId(name: string): { userName: string; userId: string } {
  const trimmed = name.trim() || 'Friend';
  const uid = sanitizeUsernameToId(trimmed);
  localStorage.setItem(USER_NAME_STORAGE_KEY, trimmed);
  localStorage.setItem(USER_STORAGE_KEY, uid);
  return { userName: trimmed, userId: uid };
}

export function getCurrentUserId(): string {
  let uid = localStorage.getItem(USER_STORAGE_KEY);
  if (!uid) {
    const uname = localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (uname) {
      uid = sanitizeUsernameToId(uname);
    } else {
      uid = 'user_' + Math.random().toString(36).substring(2, 10);
    }
    localStorage.setItem(USER_STORAGE_KEY, uid);
  }
  return uid;
}

export function switchUserId(newId: string): void {
  if (newId.trim()) {
    localStorage.setItem(USER_STORAGE_KEY, newId.trim());
  }
}

export async function checkUserDataExists(rawNameOrId: string): Promise<UserDataSummary> {
  const trimmed = rawNameOrId.trim();
  if (!trimmed) {
    return {
      exists: false,
      userId: '',
      userName: '',
      checkInCount: 0,
      taskCount: 0,
      hobbyCount: 0,
      messageCount: 0
    };
  }
  const userId = trimmed.startsWith('user_') ? trimmed : sanitizeUsernameToId(trimmed);
  const userName = trimmed.startsWith('user_') 
    ? trimmed.replace(/^user_/, '').replace(/_/g, ' ') 
    : trimmed;

  // 1. Check local storage cache first
  const localCheckins = getLocalFallback<WellnessCheckIn>(`checkins_${userId}`);
  const localTasks = getLocalFallback<TaskItem>(`tasks_${userId}`);
  const localHobbies = getLocalFallback<HobbyItem>(`hobbies_${userId}`);
  const localMessages = getLocalFallback<AIChatMessage>(`messages_${userId}`);
  const localPrefsRaw = localStorage.getItem(`preferences_${userId}`);
  let localPrefs: UserPreferences | undefined = undefined;
  if (localPrefsRaw) {
    try {
      localPrefs = JSON.parse(localPrefsRaw);
    } catch {
      // ignore
    }
  }

  let exists = localCheckins.length > 0 || localTasks.length > 0 || localHobbies.length > 0 || localMessages.length > 0 || Boolean(localPrefs);
  let checkInCount = localCheckins.length;
  let taskCount = localTasks.length;
  let hobbyCount = localHobbies.length;
  let messageCount = localMessages.length;
  let savedCompanion = localPrefs?.companionType;
  let savedTheme = (localPrefs?.theme === 'ember' || localPrefs?.theme === 'brutalist' || localPrefs?.theme === 'light') ? (localPrefs.theme as AppTheme) : undefined;

  // 2. Query Firestore collections if available
  try {
    const prefsDoc = await getDoc(doc(db, 'users', userId, 'preferences', 'main'));
    if (prefsDoc.exists()) {
      exists = true;
      const data = prefsDoc.data() as UserPreferences;
      localPrefs = data;
      if (data.companionType) savedCompanion = data.companionType;
      if (data.theme === 'ember' || data.theme === 'brutalist' || data.theme === 'light') {
        savedTheme = data.theme as AppTheme;
      }
    }

    const checkinsSnap = await getDocs(query(collection(db, 'users', userId, 'checkins'), limit(10)));
    if (!checkinsSnap.empty) {
      exists = true;
      checkInCount = Math.max(checkInCount, checkinsSnap.size);
    }

    const tasksSnap = await getDocs(query(collection(db, 'users', userId, 'tasks'), limit(10)));
    if (!tasksSnap.empty) {
      exists = true;
      taskCount = Math.max(taskCount, tasksSnap.size);
    }

    const hobbiesSnap = await getDocs(query(collection(db, 'users', userId, 'hobbies'), limit(10)));
    if (!hobbiesSnap.empty) {
      exists = true;
      hobbyCount = Math.max(hobbyCount, hobbiesSnap.size);
    }

    const messagesSnap = await getDocs(query(collection(db, 'users', userId, 'messages'), limit(10)));
    if (!messagesSnap.empty) {
      exists = true;
      messageCount = Math.max(messageCount, messagesSnap.size);
    }
  } catch (err) {
    console.warn('Firestore checkUserDataExists fallback:', err);
  }

  return {
    exists,
    userId,
    userName,
    checkInCount,
    taskCount,
    hobbyCount,
    messageCount,
    savedCompanion,
    savedTheme,
    preferences: localPrefs
  };
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

// ---------------- CHAT MESSAGES ----------------
export async function saveChatMessage(userId: string, message: AIChatMessage): Promise<void> {
  const collectionRef = collection(db, 'users', userId, 'messages');
  const docRef = doc(collectionRef, message.id);
  try {
    await setDoc(docRef, message);
  } catch (err) {
    console.warn('Firestore saveChatMessage fallback:', err);
  }
  const localKey = `messages_${userId}`;
  const list = getLocalFallback<AIChatMessage>(localKey).filter(m => m.id !== message.id);
  list.push(message);
  saveLocalFallback(localKey, list);
}

export async function getChatMessages(userId: string): Promise<AIChatMessage[]> {
  try {
    const colRef = collection(db, 'users', userId, 'messages');
    const q = query(colRef, orderBy('timestamp', 'asc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const results = snap.docs.map(d => d.data() as AIChatMessage);
      saveLocalFallback(`messages_${userId}`, results);
      return results;
    }
  } catch (err) {
    console.warn('Firestore getChatMessages fallback:', err);
  }
  return getLocalFallback<AIChatMessage>(`messages_${userId}`);
}

// ---------------- EXPORT & CLEAR DATA ----------------
export async function exportAllUserData(userId: string) {
  const checkins = await getCheckIns(userId);
  const tasks = await getTasks(userId);
  const hobbies = await getHobbies(userId);
  const preferences = await getUserPreferences(userId);
  const messages = await getChatMessages(userId);

  return {
    exportedAt: new Date().toISOString(),
    userId,
    profile: preferences,
    wellnessCheckins: checkins,
    tasksAndGoals: tasks,
    hobbiesAndInterests: hobbies,
    chatMessages: messages
  };
}

export async function clearAllUserData(userId: string): Promise<void> {
  // Clear local storage
  localStorage.removeItem(`checkins_${userId}`);
  localStorage.removeItem(`tasks_${userId}`);
  localStorage.removeItem(`hobbies_${userId}`);
  localStorage.removeItem(`preferences_${userId}`);
  localStorage.removeItem(`recommendations_${userId}`);
  localStorage.removeItem(`messages_${userId}`);
}
