import { useState, useEffect } from 'react';
import { getPendingVerifications, approveVerification, rejectVerification } from '../../services/admin';
import AdminHeader from '../../components/admin/AdminHeader';
import { CheckCircle, XCircle, GraduationCap, Clock, Calendar, User } from 'lucide-react';

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    setLoading(true);
    const data = await getPendingVerifications();
    setVerifications(data);
    setLoading(false);
  };

  const handleApprove = async (verification) => {
    if (!confirm(`Approve ${verification.user_name}'s verification?`)) return;
    setProcessing(verification.id);
    try {
      await approveVerification(verification.id, verification.user_id);
      alert('✅ Verification approved!');
      loadVerifications();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (verification) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setProcessing(verification.id);
    try {
      await rejectVerification(verification.id, verification.user_id, reason);
      alert('❌ Verification rejected!');
      loadVerifications();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = Math.floor((new Date() - date) / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search verifications..." />

      <div className="p-8">
        {/* Title */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending ID Verifications</h1>
            <p className="text-gray-600 mt-1">Review uploaded student cards to grant the 'Verified Student' badge.</p>
          </div>
          
          {verifications.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Calendar size={16} />
              <span className="font-medium">{verifications.length} students waiting for approval</span>
            </div>
          )}
        </div>

        {/* Verifications List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg">All verifications processed!</p>
            <p className="text-gray-400 text-sm mt-2">Great job! No pending IDs to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map(verification => (
              <div key={verification.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                  
                  {/* ID Card Image */}
                  <div className="md:col-span-4">
                    {verification.document_url ? (
                      <img 
                        src={verification.document_url}
                        alt="ID Card"
                        className="w-full h-40 object-cover rounded-lg bg-gray-100"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No document uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="text-gray-400" size={20} />
                      <span className="text-xl font-bold text-gray-900">{verification.user_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <GraduationCap size={16} />
                      <span>{verification.university_name || verification.university_code || 'Unknown University'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>Submitted {timeAgo(verification.submitted_at)}</span>
                    </div>

                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending Review
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-4 flex flex-col justify-center gap-2">
                    <button
                      onClick={() => handleApprove(verification)}
                      disabled={processing === verification.id}
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      {processing === verification.id ? 'Processing...' : 'Approve & Verify'}
                    </button>
                    
                    <button
                      onClick={() => handleReject(verification)}
                      disabled={processing === verification.id}
                      className="flex items-center justify-center gap-2 border border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject & Request New ID
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}