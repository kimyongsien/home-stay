import { useState, useEffect } from 'react';
import { getAllUsers, banUser, unbanUser, deleteUser } from '../../services/admin';
import AdminHeader from '../../components/admin/AdminHeader';
import { MoreVertical, ChevronDown, Search } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleBan = async (userId) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;
    await banUser(userId, reason);
    alert('User banned!');
    loadUsers();
    setOpenMenu(null);
  };

  const handleUnban = async (userId) => {
    if (!confirm('Unban this user?')) return;
    await unbanUser(userId);
    alert('User unbanned!');
    loadUsers();
    setOpenMenu(null);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user permanently? This cannot be undone!')) return;
    await deleteUser(userId);
    alert('User deleted!');
    loadUsers();
    setOpenMenu(null);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.user_type === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const roleLabels = {
    all: 'Role: All',
    student: 'Role: Student',
    landlord: 'Role: Landlord',
    admin: 'Role: Admin'
  };

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search users..." />

      <div className="p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Directory</h1>
          <p className="text-gray-600 mt-1">Manage tenant and landlord accounts</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {roleLabels[roleFilter]}
                <ChevronDown size={16} />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 w-48">
                  {['all', 'student', 'landlord', 'admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => { setRoleFilter(role); setShowRoleDropdown(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize"
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">University</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map(user => (
                    <tr key={user.id} className={user.is_banned ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                            {user.full_name?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name}
                              {user.is_banned && <span className="ml-2 text-xs text-red-600">(BANNED)</span>}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.user_type === 'student' 
                            ? 'bg-blue-100 text-blue-700'
                            : user.user_type === 'landlord'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {user.user_type?.charAt(0).toUpperCase() + user.user_type?.slice(1)}
                        </span>
                      </td>

                      {/* University */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.university_code || '-'}
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === user.id && (
                          <div className="absolute right-6 top-12 bg-white border rounded-lg shadow-lg z-10 w-40">
                            {user.is_banned ? (
                              <button
                                onClick={() => handleUnban(user.id)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-green-600"
                              >
                                Unban User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBan(user.id)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-orange-600"
                              >
                                Ban User
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            >
                              Delete User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === i + 1 
                          ? 'bg-gray-900 text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}