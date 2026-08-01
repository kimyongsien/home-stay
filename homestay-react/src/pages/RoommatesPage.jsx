import { useState, useEffect } from 'react';
import { getAllRooms, getAllUniversities } from '../services/rooms';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, X } from 'lucide-react';
import RoommateCard from '../components/RoommateCard';
import { PHNOM_PENH_DISTRICTS } from '../components/GeneralSearchForm';

export default function RoommatesPage() {
  const { profile } = useAuth();
  
  // ✅ Get user type (default to student for safety)
  const isStudent = (profile?.userType || 'student') === 'student';
  
  const [rooms, setRooms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    university: '',     // For students
    district: '',       // For non-students
    targetGender: '',
    maxSplit: 500,
    availability: '',
  });

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
    
    // Only show shared rooms
    const sharedRooms = roomsData.filter(r => r.listing_type === 'shared');
    
    setRooms(sharedRooms);
    setUniversities(uniData);
    setLoading(false);
  };

  // ✅ Adaptive filters based on user type
  const filteredRooms = rooms.filter(room => {
    // Students filter by university
    if (isStudent && filters.university && room.university_code !== filters.university) return false;
    
    // Non-students filter by district
    if (!isStudent && filters.district && room.district !== filters.district) return false;
    
    if (filters.targetGender && room.roommate_preferences?.target_gender !== filters.targetGender) return false;
    
    const splitPrice = (room.split_cost_per_person || room.price_per_month) / 100;
    if (splitPrice > filters.maxSplit) return false;
    
    if (filters.availability === 'available' && !room.is_available) return false;
    
    return true;
  });

  const clearFilters = () => {
    setFilters({
      university: '',
      district: '',
      targetGender: '',
      maxSplit: 500,
      availability: '',
    });
  };

  const hasFilters = filters.university || filters.district || filters.targetGender || 
                     filters.maxSplit < 500 || filters.availability;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ✅ Adaptive Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isStudent ? 'Rooms Seeking Roommates' : 'Share a Room, Split the Rent'}
          </h1>
          <p className="text-gray-600">
            {isStudent 
              ? 'Browse available rooms that are ready to be shared and split with verified students.'
              : 'Browse rooms available for sharing. Perfect for fresh workers and young professionals looking to split costs.'
            }
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* ✅ ADAPTIVE: University for students, District for non-students */}
            {isStudent ? (
              <FilterChip
                label={filters.university ? `Near Campus: ${filters.university}` : 'Near Campus'}
                isOpen={openDropdown === 'campus'}
                onToggle={() => setOpenDropdown(openDropdown === 'campus' ? '' : 'campus')}
                active={filters.university}
              >
                <button
                  onClick={() => { setFilters({...filters, university: ''}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  All Universities
                </button>
                {universities.map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => { setFilters({...filters, university: uni.short_code}); setOpenDropdown(''); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {uni.short_code} - {uni.name}
                  </button>
                ))}
              </FilterChip>
            ) : (
              <FilterChip
                label={filters.district ? `Near: ${filters.district}` : 'District / Khan'}
                isOpen={openDropdown === 'district'}
                onToggle={() => setOpenDropdown(openDropdown === 'district' ? '' : 'district')}
                active={filters.district}
              >
                <button
                  onClick={() => { setFilters({...filters, district: ''}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  All Districts
                </button>
                {PHNOM_PENH_DISTRICTS.map(district => (
                  <button
                    key={district}
                    onClick={() => { setFilters({...filters, district}); setOpenDropdown(''); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {district}
                  </button>
                ))}
              </FilterChip>
            )}

            {/* Target Gender */}
            <FilterChip
              label={
                filters.targetGender === 'same_sex_only' ? 'Target Gender: Same-Sex Only' :
                filters.targetGender === 'male_only' ? 'Target Gender: Male Only' :
                filters.targetGender === 'female_only' ? 'Target Gender: Female Only' :
                'Target Gender'
              }
              isOpen={openDropdown === 'gender'}
              onToggle={() => setOpenDropdown(openDropdown === 'gender' ? '' : 'gender')}
              active={filters.targetGender}
            >
              {[
                { value: '', label: 'Any Gender' },
                { value: 'same_sex_only', label: 'Same-Sex Only' },
                { value: 'male_only', label: 'Male Only' },
                { value: 'female_only', label: 'Female Only' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFilters({...filters, targetGender: opt.value}); setOpenDropdown(''); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </FilterChip>

            {/* Your Split Share */}
            <FilterChip
              label={filters.maxSplit < 500 ? `Split Budget: Max $${filters.maxSplit}/mo` : 'Your Split Budget'}
              isOpen={openDropdown === 'split'}
              onToggle={() => setOpenDropdown(openDropdown === 'split' ? '' : 'split')}
              active={filters.maxSplit < 500}
              wide
            >
              <div className="p-4 w-64">
                <div className="text-sm text-gray-600 mb-2">
                  Max: <b>${filters.maxSplit}/mo</b>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={filters.maxSplit}
                  onChange={(e) => setFilters({...filters, maxSplit: parseInt(e.target.value)})}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$20</span>
                  <span>$500+</span>
                </div>
              </div>
            </FilterChip>

            {/* Availability */}
            <FilterChip
              label={filters.availability === 'available' ? 'Availability: Available Now' : 'Availability'}
              isOpen={openDropdown === 'availability'}
              onToggle={() => setOpenDropdown(openDropdown === 'availability' ? '' : 'availability')}
              active={filters.availability}
            >
              <button
                onClick={() => { setFilters({...filters, availability: 'available'}); setOpenDropdown(''); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Available Now
              </button>
              <button
                onClick={() => { setFilters({...filters, availability: ''}); setOpenDropdown(''); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                All
              </button>
            </FilterChip>

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

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available to share
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading share opportunities...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-gray-500 text-lg mb-2">
              {isStudent ? 'No rooms seeking student roommates yet' : 'No rooms available to share yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {hasFilters 
                ? 'Try clearing filters or check back later!' 
                : 'Be the first to post a shared room to split costs!'
              }
            </p>
            {hasFilters && (
              <button 
                onClick={clearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <RoommateCard key={room.id} room={room} isStudent={isStudent} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center text-sm text-gray-600 gap-4">
          <div className="font-bold text-primary text-lg">Home Stay</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Contact Support</a>
            <a href="#" className="hover:text-primary">Campus Partners</a>
          </div>
          <div>© 2024 Home Stay Phnom Penh. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Filter Chip Component
function FilterChip({ label, children, isOpen, onToggle, active, wide }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors ${
          active 
            ? 'border-primary bg-green-50 text-primary font-medium' 
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }`}
      >
        {label}
        <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      
      {isOpen && (
        <div className={`absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-50 ${wide ? 'w-64' : 'min-w-[200px]'}`}>
          {children}
        </div>
      )}
    </div>
  );
}