import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const backfillUserType = async () => {
  const snap = await getDocs(collection(db, 'users'));
  let updated = 0;
  for (const d of snap.docs) {
    if (!d.data().userType) {
      await updateDoc(doc(db, 'users', d.id), { userType: 'student' });
      updated++;
    }
  }
  console.log(`✅ Backfilled ${updated} users`);
  return updated;
};