import { useState, useEffect } from 'react';
import { Home, Users } from 'lucide-react';
import { getAllUniversities, getRoomsByUniversity, getAllRooms } from '../services/rooms';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import StudentSearchForm from '../components/StudentSearchForm';
import GeneralSearchForm from '../components/GeneralSearchForm';

export default function HomePage() {
  const { profile } = useAuth();

  // ✅ ENVIRONMENT SWITCH — undefined/null safely defaults to student
  const isStudent = (profile?.userType || 'student') === 'student';

  const [universities, setUniversities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [generalFilters, setGeneralFilters] = useState({
    district: '', roomType: '', needsParking: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUniversities().then(setUniversities);
  }, []);

  // Student mode: original behavior, untouched
  useEffect(() => {
    if (!isStudent) return;
    setLoading(true);
    (async () => {
      const data = selectedUniversity
        ? await getRoomsByUniversity(selectedUniversity)
        : await getAllRooms();
      setRooms(data);
      setLoading(false);
    })();
  }, [selectedUniversity, isStudent]);

  // Non-student mode: district / type / parking
  useEffect(() => {
    if (isStudent) return;
    setLoading(true);
    (async () => {
      const all = await getAllRooms(100);
      const filtered = all.filter((r) => {
        if (generalFilters.district && r.district !== generalFilters.district) return false;
        if (generalFilters.roomType && r.room_type !== generalFilters.roomType) return false;
        if (generalFilters.needsParking && !(r.amenities || []).includes('parking')) return false;
        return true;
      });
      setRooms(filtered);
      setLoading(false);
    })();
  }, [generalFilters, isStudent]);

  // Group by university (student view only)
  const roomsByUniversity = universities.reduce((acc, uni) => {
    acc[uni.short_code] = rooms.filter((r) => r.university_code === uni.short_code);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isStudent
              ? 'Find Safe, Affordable Student Housing Near Your Campus'
              : 'Find Your Next Home in Phnom Penh'}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {isStudent
              ? 'Verified rooms and student communities across Cambodia.'
              : 'Quality studios and apartments across every Khan.'}
          </p>

          {/* ✅ CONDITIONAL ENVIRONMENT */}
          {isStudent ? (
            <StudentSearchForm onSearch={setSelectedUniversity} />
          ) : (
            <GeneralSearchForm onSearch={setGeneralFilters} />
          )}
        </div>
      </section>

      {/* Quick action cards (unchanged) */}
      <section className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer">
            <Home className="text-primary mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">View Rooms</h3>
            <p className="text-gray-600 text-sm">
              Browse verified spaces within walking distance of your school.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer">
            <Users className="text-primary mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">View Roommates</h3>
            <p className="text-gray-600 text-sm">
              Create a profile and match with other students to split rent costs safely.
            </p>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No rooms available yet.</p>
          </div>
        ) : isStudent ? (
          // ✅ ORIGINAL grouped-by-university layout
          universities.map((uni) => {
            const uniRooms = roomsByUniversity[uni.short_code] || [];
            if (uniRooms.length === 0) return null;
            return (
              <div key={uni.id} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Latest Update near {uni.short_code}
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">LIVE</span>
                  </h2>
                  <button className="text-primary hover:underline text-sm">View All →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uniRooms.slice(0, 3).map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // ✅ NEW flat grid for professionals
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Available in {generalFilters.district || 'Phnom Penh'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer (unchanged) */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm text-gray-600">
          <span className="font-bold text-primary">Home Stay</span>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
          <span>© 2024</span>
        </div>
      </footer>
    </div>
  );
}