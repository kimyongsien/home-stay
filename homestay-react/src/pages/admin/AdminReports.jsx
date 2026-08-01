import { useState, useEffect } from 'react';
import { getAllReports, resolveReport } from '../../services/admin';
import AdminHeader from '../../components/admin/AdminHeader';
import { Flag, MoreVertical, ChevronDown, Home, User, Filter } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('unresolved');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await getAllReports();
    setReports(data);
    setLoading(false);
  };

  const handleResolve = async (reportId, action) => {
    if (!confirm(`Mark as resolved with action: ${action}?`)) return;
    await resolveReport(reportId, action);
    alert('Report resolved!');
    loadReports();
    setOpenMenu(null);
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'unresolved' && report.status !== 'resolved') ||
      (statusFilter === 'resolved' && report.status === 'resolved');
    
    const matchesType = typeFilter === 'all' || report.reason === typeFilter;
    
    return matchesStatus && matchesType;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
    
    if (isToday) return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (isYesterday) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getIssueBadge = (reason) => {
    const badges = {
      'Fake Listing': 'bg-red-100 text-red-700',
      'Spam Message': 'bg-gray-200 text-gray-700',
      'Inappropriate Content': 'bg-orange-100 text-orange-700',
      'Scam': 'bg-red-100 text-red-700',
      'Harassment': 'bg-purple-100 text-purple-700',
    };
    return badges[reason] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search reports, users, or listings..." />

      <div className="p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Flag className="text-red-500" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">User Reports & Flags</h1>
          </div>
          <p className="text-gray-600 mt-1">Review and resolve community-reported issues.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-400" />
            
            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Status: {statusFilter === 'unresolved' ? 'Unresolved' : statusFilter === 'resolved' ? 'Resolved' : 'All'}
                <ChevronDown size={16} />
              </button>
              {showStatusDropdown && (
                <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 w-40">
                  {['all', 'unresolved', 'resolved'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm capitalize"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Issue Type: {typeFilter === 'all' ? 'All' : typeFilter}
                <ChevronDown size={16} />
              </button>
              {showTypeDropdown && (
                <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 w-48">
                  {['all', 'Fake Listing', 'Spam Message', 'Inappropriate Content', 'Scam'].map(type => (
                    <button
                      key={type}
                      onClick={() => { setTypeFilter(type); setShowTypeDropdown(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredReports.length} {statusFilter} reports
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-500 text-lg">No reports to review!</p>
              <p className="text-gray-400 text-sm mt-2">Community is behaving well.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reported Item</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Issue Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reported By</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    {/* Reported Item */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.reported_type === 'room' ? (
                          <Home size={18} className="text-gray-400" />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {report.reported_type === 'room' ? 'Listing' : 'User'}: {report.reported_name || report.reported_id}
                        </span>
                      </div>
                    </td>

                    {/* Issue Type Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIssueBadge(report.reason)}`}>
                        {report.reason}
                      </span>
                    </td>

                    {/* Reported By */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {report.reporter_name}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === report.id ? null : report.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === report.id && report.status !== 'resolved' && (
                        <div className="absolute right-6 top-12 bg-white border rounded-lg shadow-lg z-10 w-48">
                          <button
                            onClick={() => handleResolve(report.id, 'warned')}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-yellow-600"
                          >
                            Issue Warning
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'removed')}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-orange-600"
                          >
                            Remove Content
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'banned')}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                          >
                            Ban User
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'dismissed')}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-600"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}