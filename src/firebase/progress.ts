import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './utils';

export interface ProgressData {
  gold: number;
  unlockedTurrets: string[];
  unlockedUpgrades: string[];
  inventory: string[];
  commanderExp: number;
  medals: string[];
  nickname: string;
  totalWavesSurvived: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  highestEndlessWaves: Record<string, number>;
  lastUpdated: any;
}

export const saveUserProgress = async (userId: string, data: Partial<ProgressData>) => {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, {
      ...data,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users/' + userId);
  }
};

export const loadUserProgress = async (userId: string): Promise<ProgressData | null> => {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as ProgressData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users/' + userId);
  }
};

export const saveGameSession = async (userId: string, sessionData: any) => {
  const sessionId = sessionData.id || doc(collection(db, 'sessions')).id;
  const sessionRef = doc(db, 'sessions', sessionId);
  try {
    await setDoc(sessionRef, {
      ...sessionData,
      userId,
      id: sessionId,
      lastUpdated: Date.now()
    }, { merge: true });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'sessions/' + sessionId);
  }
};

export const getSessions = async (userId: string, type: 'endless' | 'sandbox') => {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    where('type', '==', type)
  );
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'sessions');
  }
};

export const deleteGameSession = async (sessionId: string) => {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'sessions/' + sessionId);
  }
};
