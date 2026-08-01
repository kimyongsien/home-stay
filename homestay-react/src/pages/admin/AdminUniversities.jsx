import { useState, useEffect } from 'react';
import { getAllUniversities } from '../../services/rooms';
import AdminHeader from '../../components/admin/AdminHeader';
import { doc, deleteDoc, addDoc, collection, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GraduationCap, MoreVertical, Plus, Search, ChevronDown, X } from 'lucide-react';

export default function AdminUniversities() {
  const [universities, setUniversities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUni, setNewUni] = useState({
    name: '',
    short_code: '',
    province_id: 'pp_001',
    district: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [unisData, roomsSnap] = await Promise.all([
      getAllUniversities(),
      getDocs(collection(db, 'rooms'))
    ]);
    setUniversities(unisData);
    setRooms(roomsSnap.docs.map(d => d.data()));
    setLoading(false);
  };

  const handleAddUniversity = async () => {
    if (!newUni.name || !newUni.short_code) {
      alert('Please fill required fields!');
      return;
    }
    await addDoc(collection(db, 'universities'), {
      ...newUni,
      short_code: newUni.short_code.toUpperCase(),
      created_at: serverTimestamp()
    });
    alert('University added!');
    setShowAddModal(false);
    setNewUni({ name: '', short_code: '', province_id: 'pp_001', district: '' });
    loadData();
  };

  const handleDelete = async (uniId, name) => {
    if (!confirm(`Delete ${name}? This might affect existing rooms!`)) return;
    await deleteDoc(doc(db, 'universities', uniId));
    alert('University deleted!');
    loadData();
    setOpenMenu(null);
  };

  const countRoomsForUniversity = (shortCode) => {
    return rooms.filter(r => r.university_code === shortCode).length;
  };

  const filteredUnis = universities.filter(uni =>
    uni.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.short_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search..." />

      <div className="p-8">
        {/* Title */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Directory & Campuses</h1>
            <p className="text-gray-600 mt-1">Manage target institutions, campuses, and surrounding search zones.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus size={16} /> Add University
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by university name or acronym..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              STATUS
              <button className="flex items-center gap-1 px-3 py-1 border rounded-lg text-sm">
                All <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Universities Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUnis.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No universities found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Institution</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Primary District</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Active Listings</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnis.map(uni => (
                  <tr key={uni.id} className="hover:bg-gray-50">
                    {/* Institution */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <GraduationCap size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{uni.name}</div>
                          <div className="text-xs text-gray-500">{uni.short_code}</div>
                        </div>
                      </div>
                    </td>

                    {/* District */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {uni.district || 'Phnom Penh'}
                    </td>

                    {/* Active Listings */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {countRoomsForUniversity(uni.short_code)} listings
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === uni.id ? null : uni.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === uni.id && (
                        <div className="absolute right-6 top-12 bg-white border rounded-lg shadow-lg z-10 w-40">
                          <button
                            onClick={() => alert('Edit feature coming soon!')}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(uni.id, uni.name)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                          >
                            Delete
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

      {/* Add University Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New University</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal University of Phnom Penh"
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                  value={newUni.name}
                  onChange={(e) => setNewUni({...newUni, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Short Code *</label>
                <input
                  type="text"
                  placeholder="e.g. RUPP"
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none uppercase"
                  value={newUni.short_code}
                  onChange={(e) => setNewUni({...newUni, short_code: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">District</label>
                <input
                  type="text"
                  placeholder="e.g. Toul Kork"
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                  value={newUni.district}
                  onChange={(e) => setNewUni({...newUni, district: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Province</label>
                <select
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                  value={newUni.province_id}
                  onChange={(e) => setNewUni({...newUni, province_id: e.target.value})}
                >
                  <option value="pp_001">Phnom Penh</option>
                  <option value="sr_001">Siem Reap</option>
                  <option value="bb_001">Battambang</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUniversity}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Add University
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}