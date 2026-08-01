import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { getPendingVerifications } from '../../services/admin';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (profile?.is_admin) {
      getPendingVerifications().then(list => setPendingCount(list.length));
    }
  }, [profile]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Not admin
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have admin permissions (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs text-red-600">is_admin: true</code>) to view this page.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingCount={pendingCount} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}