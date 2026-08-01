import { 
  collection, doc, getDocs, getDoc, addDoc, 
  updateDoc, query, where, increment, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Get all provinces
export const getProvinces = async () => {
  const snapshot = await getDocs(collection(db, 'provinces'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Get universities by province
export const getUniversitiesByProvince = async (provinceId) => {
  const q = query(
    collection(db, 'universities'),
    where('province_id', '==', provinceId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Get all universities
export const getAllUniversities = async () => {
  const snapshot = await getDocs(collection(db, 'universities'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ✅ FIXED: Get rooms by university (no index needed)
export const getRoomsByUniversity = async (universityCode) => {
  const q = query(
    collection(db, 'rooms'),
    where('university_code', '==', universityCode)
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(room => room.is_available === true)
    .sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(0);
      const dateB = b.created_at?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
};

// ✅ FIXED: Get all available rooms (no index needed)
export const getAllRooms = async (limitCount = 20) => {
  const snapshot = await getDocs(collection(db, 'rooms'));
  
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(room => room.is_available === true)
    .sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(0);
      const dateB = b.created_at?.toDate?.() || new Date(0);
      return dateB - dateA;
    })
    .slice(0, limitCount);
};

// Get single room
export const getRoomById = async (roomId) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    await updateDoc(roomRef, { view_count: increment(1) });
    return { id: roomSnap.id, ...roomSnap.data() };
  }
  return null;
};

// Create new room
export const createRoom = async (roomData) => {
  const docRef = await addDoc(collection(db, 'rooms'), {
    ...roomData,
    view_count: 0,
    is_available: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  return docRef.id;
};