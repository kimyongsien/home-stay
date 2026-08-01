import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthChange, getUserProfile } from '../services/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid) => {
    const result = await getUserProfile(uid);
    if (result.success) {
      // ✅ BACKWARD COMPATIBILITY:
      // Users created before this patch have no `userType` field.
      // Default to "student" so the UI never crashes.
      setProfile({
        ...result.data,
        userType: result.data.userType || 'student',
      });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadProfile]);

  // Lets Edit Profile refresh the navbar/context after saving
  const refreshProfile = useCallback(
    () => user && loadProfile(user.uid),
    [user, loadProfile]
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};