import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './utils';

export interface LeaderboardEntry {
  userId: string;
  nickname: string;
  highestWave: number;
  totalEnemiesKilled: number;
  totalGoldEarned: number;
  commanderLevel: number;
  lastUpdated: string;
}

export const updateLeaderboard = async (userId: string, data: Partial<LeaderboardEntry>) => {
  const leaderboardDoc = doc(db, `leaderboard/${userId}`);
  try {
    await setDoc(leaderboardDoc, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'leaderboard/' + userId);
  }
};

export const getLeaderboard = async (limitCount: number = 50) => {
  const q = query(collection(db, 'leaderboard'), orderBy('highestWave', 'desc'), limit(limitCount));
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leaderboard');
  }
};
