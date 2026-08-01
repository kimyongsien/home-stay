import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Sign up new user
export const signUp = async (email, password, userData) => {
  try {
    // 1. Create auth account
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    
    // 2. Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: email,
      full_name: userData.full_name,
      username: userData.username,
      phone: userData.phone || '',
      user_type: userData.user_type,
      userType: userData.userType || 'student',   // ✅ NEW (defaults for safety)
      university_id: userData.university_id || '',
      university_name: userData.university_name || '',
      university_code: userData.university_code || '',
      sex: userData.sex || 'male',
      gender: userData.sex || 'male',
      birthday: userData.birthday || '',
      avatar_url: '',
      id_verified: false,
      created_at: serverTimestamp()
    });
    
    // 3. If student, create student_details subcollection
    if (userData.user_type === 'student') {
      await setDoc(doc(db, 'users', user.uid, 'student_details', 'info'), {
        university_id: userData.university_id || '',
        university_name: userData.university_name || '',
        school_year: userData.school_year || 1,
        sex: userData.sex || '',
        gender: userData.sex || '',
        birthday: userData.birthday || '',
        habits: {}
      });
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCred.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ✅ NEW: Used by Edit Profile page
export const updateUserProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};