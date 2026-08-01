import { useState, useEffect } from 'react';
import { getAdminStats, getPendingVerifications, getRecentActivity } from '../../services/admin';
import AdminHeader from '../../components/admin/AdminHeader';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  User, 
  Clock,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    pendingVerifications: 0,
    thisWeekUsers: 0
  });
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const [statsData, verifications, activity] = await Promise.all([
      getAdminStats(),
      getPendingVerifications(),
      getRecentActivity(5)
    ]);
    setStats(statsData);
    setPendingVerifications(verifications.slice(0, 3));
    setRecentActivity(activity);
    setLoading(false);
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search..." />
      
      <div className="p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">System status and pending administrative tasks.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total Users</span>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <span>+{stats.thisWeekUsers} this week</span>
            </div>
          </div>

          {/* Live Room Listings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Live Room Listings</span>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {loading ? '...' : stats.totalRooms.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-2">Active listings</div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Pending ID Verifications</span>
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-red-600">
              {loading ? '...' : stats.pendingVerifications}
            </div>
            <div className="text-xs text-red-500 font-medium mt-2">Action needed</div>
          </div>
        </div>

        {/* Pending Student ID Verifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="text-gray-700" size={22} />
                Pending Student ID Verifications
              </h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve student credentials</p>
            </div>
            {pendingVerifications.length > 0 && (
              <Link to="/admin/verifications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ExternalLink size={12} />
              </Link>
            )}
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">All Caught Up!</h3>
              <p className="text-gray-500 text-sm">No pending student ID verifications at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Claimed University</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Submitted</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Document Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingVerifications.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                            {v.user_name ? (
                              v.user_name.charAt(0).toUpperCase()
                            ) : (
                              <User size={16} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{v.user_name || 'Anonymous User'}</div>
                            <div className="text-xs text-gray-400">ID: {v.id?.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {v.university_code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {v.submitted_at?.toDate?.().toLocaleDateString() || 'Recently'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            to="/admin/verifications"
                            className="px-3.5 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                          >
                            Review & Verify
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Platform Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-gray-700" size={22} />
              Recent Platform Activity
            </h2>
          </div>

          <div className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{timeAgo(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}