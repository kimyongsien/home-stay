import { db } from '../lib/firebase';
import { 
  collection, doc, getDocs, getDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, addDoc, serverTimestamp 
} from 'firebase/firestore';

// ============ STATISTICS ============

export const getAdminStats = async () => {
  try {
    const [usersSnap, roomsSnap, verificationsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'rooms')),
      getDocs(query(collection(db, 'verifications'), where('status', '==', 'pending')))
    ]);

    const users = usersSnap.docs.map(d => d.data());
    const rooms = roomsSnap.docs.map(d => d.data());

    // Count this week's users
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekUsers = users.filter(u => {
      if (!u.created_at) return false;
      const created = u.created_at.toDate ? u.created_at.toDate() : new Date(u.created_at);
      return created >= weekAgo;
    }).length;

    return {
      totalUsers: users.length,
      totalRooms: rooms.filter(r => r.is_available !== false).length,
      pendingVerifications: verificationsSnap.size,
      thisWeekUsers,
      students: users.filter(u => u.user_type === 'student').length,
      landlords: users.filter(u => u.user_type === 'landlord').length,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalRooms: 0,
      pendingVerifications: 0,
      thisWeekUsers: 0,
      students: 0,
      landlords: 0,
    };
  }
};

// ============ USERS ============

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const banUser = async (userId, reason) => {
  await updateDoc(doc(db, 'users', userId), {
    is_banned: true,
    banned_reason: reason,
    banned_at: serverTimestamp()
  });
};

export const unbanUser = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    is_banned: false,
    banned_reason: null,
    banned_at: null
  });
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
};

// ============ ROOMS ============

export const getAllRoomsAdmin = async () => {
  const snapshot = await getDocs(collection(db, 'rooms'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteRoomAdmin = async (roomId) => {
  await deleteDoc(doc(db, 'rooms', roomId));
};

export const toggleFeatureRoom = async (roomId, isFeatured) => {
  await updateDoc(doc(db, 'rooms', roomId), {
    is_featured: isFeatured
  });
};

// ============ VERIFICATIONS ============

export const getPendingVerifications = async () => {
  const q = query(
    collection(db, 'verifications'),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const approveVerification = async (verificationId, userId) => {
  await updateDoc(doc(db, 'verifications', verificationId), {
    status: 'approved',
    reviewed_at: serverTimestamp()
  });
  await updateDoc(doc(db, 'users', userId), {
    id_verified: true,
    verification_status: 'approved',
    id_verified_at: serverTimestamp()
  });
};

export const rejectVerification = async (verificationId, userId, reason) => {
  await updateDoc(doc(db, 'verifications', verificationId), {
    status: 'rejected',
    rejection_reason: reason,
    reviewed_at: serverTimestamp()
  });
  await updateDoc(doc(db, 'users', userId), {
    verification_status: 'rejected'
  });
};

// ============ REPORTS ============

export const getAllReports = async () => {
  const snapshot = await getDocs(collection(db, 'reports'));
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const dateA = a.created_at?.toDate?.() || new Date(0);
      const dateB = b.created_at?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
};

export const resolveReport = async (reportId, action) => {
  await updateDoc(doc(db, 'reports', reportId), {
    status: 'resolved',
    action_taken: action,
    reviewed_at: serverTimestamp()
  });
};

// ============ ACTIVITY LOG ============

export const getRecentActivity = async (limitCount = 10) => {
  try {
    // Combine recent users and rooms
    const [usersSnap, roomsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'rooms'))
    ]);

    const activities = [];

    // Add recent users
    usersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.created_at) {
        activities.push({
          type: 'user_signup',
          text: `${data.full_name} created a new ${data.user_type} account.`,
          time: data.created_at,
          icon: '👤'
        });
      }
    });

    // Add recent rooms
    roomsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.created_at) {
        activities.push({
          type: 'room_posted',
          text: `${data.landlord_name} posted "${data.title}" near ${data.university_code}.`,
          time: data.created_at,
          icon: '🏠'
        });
      }
    });

    // Sort by time
    activities.sort((a, b) => {
      const dateA = a.time?.toDate?.() || new Date(0);
      const dateB = b.time?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    return activities.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return [];
  }
};