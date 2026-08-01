import { useState, useEffect } from 'react';
import { getAllRoomsAdmin, deleteRoomAdmin, toggleFeatureRoom } from '../../services/admin';
import { getAllUniversities } from '../../services/rooms';
import AdminHeader from '../../components/admin/AdminHeader';
import { MoreVertical, MapPin, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openMenu, setOpenMenu] = useState(null);
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [roomsData, unisData] = await Promise.all([
      getAllRoomsAdmin(),
      getAllUniversities()
    ]);
    setRooms(roomsData);
    setUniversities(unisData);
    setLoading(false);
  };

  const handleDelete = async (roomId, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone!`)) return;
    await deleteRoomAdmin(roomId);
    alert('Room deleted!');
    loadData();
    setOpenMenu(null);
  };

  const handleFeature = async (roomId, currentFeatured) => {
    await toggleFeatureRoom(roomId, !currentFeatured);
    alert(currentFeatured ? 'Removed from featured' : 'Marked as featured!');
    loadData();
    setOpenMenu(null);
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'all' || room.university_code === campusFilter;
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'entire' && room.listing_type !== 'shared') ||
      (typeFilter === 'shared' && room.listing_type === 'shared');
    
    return matchesSearch && matchesCampus && matchesType;
  });

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search by room title" />

      <div className="p-8">
        {/* Title Row */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Rooms Directory</h1>
            <p className="text-gray-600 mt-1">Monitor all active listings and manage Ambassador Verifications.</p>
          </div>

          <div className="flex gap-3">
            {/* Campus Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCampusDropdown(!showCampusDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {campusFilter === 'all' ? 'All Campuses' : campusFilter}
                <ChevronDown size={16} />
              </button>
              {showCampusDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 w-48">
                  <button
                    onClick={() => { setCampusFilter('all'); setShowCampusDropdown(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    All Campuses
                  </button>
                  {universities.map(uni => (
                    <button
                      key={uni.id}
                      onClick={() => { setCampusFilter(uni.short_code); setShowCampusDropdown(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {uni.short_code}
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
                {typeFilter === 'all' ? 'All Types' : typeFilter === 'entire' ? 'Entire Room' : 'Shared Room'}
                <ChevronDown size={16} />
              </button>
              {showTypeDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 w-48">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'entire', label: 'Entire Room' },
                    { value: 'shared', label: 'Shared Room' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setTypeFilter(opt.value); setShowTypeDropdown(false); }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Listing Button */}
            <Link
              to="/add-room"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              <Plus size={16} /> New Listing
            </Link>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-500">No rooms found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Listing</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type & Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Host</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.map(room => {
                  const isShared = room.listing_type === 'shared';
                  const price = isShared 
                    ? (room.split_cost_per_person || room.price_per_month) / 100
                    : room.price_per_month / 100;
                  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0];

                  return (
                    <tr key={room.id} className="hover:bg-gray-50">
                      {/* Listing */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={primaryImage?.url || 'https://via.placeholder.com/60'}
                            alt={room.title}
                            className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{room.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} className="text-primary" />
                              {room.location_summary}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Price */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                          isShared 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isShared ? 'Shared Room' : 'Entire Room'}
                        </span>
                        <div className="text-sm font-semibold text-gray-900">
                          ${price.toFixed(0)}{isShared ? ' split' : '/mo'}
                        </div>
                      </td>

                      {/* Host */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {room.landlord_name || room.host_name || 'Unknown'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === room.id ? null : room.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === room.id && (
                          <div className="absolute right-6 top-12 bg-white border rounded-lg shadow-lg z-10 w-48">
                            <Link
                              to={`/rooms/${room.id}`}
                              target="_blank"
                              className="block px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
                            >
                              View Listing
                            </Link>
                            <button
                              onClick={() => handleFeature(room.id, room.is_featured)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-purple-600"
                            >
                              {room.is_featured ? 'Unfeature' : 'Feature Room'}
                            </button>
                            <button
                              onClick={() => handleDelete(room.id, room.title)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            >
                              Delete Room
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Total Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} in total
        </div>
      </div>
    </div>
  );
}