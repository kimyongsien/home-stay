import { useState, useEffect } from 'react';
import { getAllRooms, getAllUniversities } from '../services/rooms';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, X, Shield, DollarSign, AlertCircle } from 'lucide-react';
import RoomCardHorizontal from '../components/RoomCardHorizontal';
import TrustBadges from '../components/TrustBadges';
import { PHNOM_PENH_DISTRICTS } from '../components/GeneralSearchForm';

export default function FindRoomsPage() {
  const { profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';

  const [rooms, setRooms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    availability: '',       // 'available', 'all'
    roomType: '',           // 'room', 'apartment', 'studio'
    budgetMin: 0,
    budgetMax: 500,
    university: '',
    district: '',
  });
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [roomsData, uniData] = await Promise.all([
      getAllRooms(50),
      getAllUniversities()
    ]);
    
    // ✅ CHANGE 1: Filter out shared rooms - only show entire rooms
    const entireRooms = roomsData.filter(r => r.listing_type !== 'shared');
    
    setRooms(entireRooms);
    setUniversities(uniData);
    setLoading(false);
  };

  // Apply filters
  const filteredRooms = rooms.filter(room => {
    // Availability filter
    if (filters.availability === 'available' && !room.is_available) return false;
    
    // Room type filter
    if (filters.roomType && room.room_type !== filters.roomType) return false;
    
    // Budget filter
    const price = room.price_per_month / 100;
    if (price < filters.budgetMin || price > filters.budgetMax) return false;
    
    // Adaptive Location filter
    if (isStudent && filters.university && room.university_code !== filters.university) return false;
    if (!isStudent && filters.district && room.district !== filters.district) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({
      availability: '',
      roomType: '',
      budgetMin: 0,
      budgetMax: 500,
      university: '',
      district: '',
    });
  };

  const hasFilters = filters.availability || filters.roomType || filters.university || filters.district ||
                     filters.budgetMin > 0 || filters.budgetMax < 500;

  return (
    <div className="min-h-screen bg-white">
      {/* Filter Bar */}
      <div className="border-b bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Availability Filter */}
            <FilterDropdown
              label="Availability"
              isOpen={openDropdown === 'availability'}
              onToggle={() => setOpenDropdown(openDropdown === 'availability' ? '' : 'availability')}
              active={filters.availability}
            >
              <button 
                onClick={() => { setFilters({...filters, availability: 'available'}); setOpenDropdown(''); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Available Now
              </button>
              <button 
                onClick={() => { setFilters({...filters, availability: ''}); setOpenDropdown(''); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                All Rooms
              </button>
            </FilterDropdown>

            {/* Room Type Filter - ✅ CHANGE 2: Removed "Shared Room" option */}
            <FilterDropdown
              label="Room Type"
              isOpen={openDropdown === 'roomType'}
              onToggle={() => setOpenDropdown(openDropdown === 'roomType' ? '' : 'roomType')}
              active={filters.roomType}
            >
              {[
                { value: '', label: 'All Types' },
                { value: 'room', label: 'Room' },
                { value: 'apartment', label: 'Apartment' },
                { value: 'studio', label: 'Studio' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFilters({...filters, roomType: opt.value}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize"
                >
                  {opt.label}
                </button>
              ))}
            </FilterDropdown>

            {/* Rent Budget Filter */}
            <FilterDropdown
              label="Rent Budget"
              isOpen={openDropdown === 'budget'}
              onToggle={() => setOpenDropdown(openDropdown === 'budget' ? '' : 'budget')}
              active={filters.budgetMin > 0 || filters.budgetMax < 500}
              wide
            >
              <div className="p-4 w-64">
                <div className="flex justify-between text-sm mb-2">
                  <span>${filters.budgetMin}</span>
                  <span>${filters.budgetMax}+</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Min Budget</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters({...filters, budgetMin: parseInt(e.target.value)})}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max Budget</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters({...filters, budgetMax: parseInt(e.target.value)})}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </FilterDropdown>

            {/* ✅ ADAPTIVE LOCATION FILTER: University for students, District for non-students */}
            {isStudent ? (
              <FilterDropdown
                label={filters.university ? `University: ${filters.university}` : 'Select University'}
                isOpen={openDropdown === 'university'}
                onToggle={() => setOpenDropdown(openDropdown === 'university' ? '' : 'university')}
                active={filters.university}
              >
                <button
                  onClick={() => { setFilters({...filters, university: ''}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  All Universities
                </button>
                {universities.map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => { setFilters({...filters, university: uni.short_code}); setOpenDropdown(''); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {uni.short_code} - {uni.name}
                  </button>
                ))}
              </FilterDropdown>
            ) : (
              <FilterDropdown
                label={filters.district ? `District: ${filters.district}` : 'District / Khan'}
                isOpen={openDropdown === 'district'}
                onToggle={() => setOpenDropdown(openDropdown === 'district' ? '' : 'district')}
                active={filters.district}
              >
                <button
                  onClick={() => { setFilters({...filters, district: ''}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  All Districts
                </button>
                {PHNOM_PENH_DISTRICTS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setFilters({...filters, district: d}); setOpenDropdown(''); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {d}
                  </button>
                ))}
              </FilterDropdown>
            )}

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Adaptive Trust Badges */}
      <TrustBadges />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">View Rooms Center</h1>
          <div className="text-sm text-gray-600">
            {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No rooms match your filters</p>
            <button 
              onClick={clearFilters}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <RoomCardHorizontal key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center text-sm text-gray-600 gap-4">
          <div className="font-bold text-primary text-lg">Home Stay</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact Us</a>
            <a href="#" className="hover:text-primary">Help Center</a>
          </div>
          <div>© 2024 Home Stay Phnom Penh. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Dropdown Component
function FilterDropdown({ label, children, isOpen, onToggle, active, wide }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm ${
          active 
            ? 'border-primary bg-green-50 text-primary font-medium' 
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }`}
      >
        {label}
        <ChevronDown size={16} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      
      {isOpen && (
        <div className={`absolute top-full mt-1 bg-white border rounded-lg shadow-lg z-50 ${wide ? 'w-64' : 'w-48'}`}>
          {children}
        </div>
      )}
    </div>
  );
}