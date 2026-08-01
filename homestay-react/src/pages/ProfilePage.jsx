import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAllUniversities } from '../services/rooms';
import { 
  Edit3, MapPin, GraduationCap, User, Calendar, 
  Phone, Mail, Home, Bookmark, Settings as SettingsIcon, Trash2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [myRooms, setMyRooms] = useState([]);
  const [savedRooms, setSavedRooms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getAllUniversities().then(setUniversities);
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load my listings
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('landlord_id', '==', user.uid)
      );
      const roomsSnap = await getDocs(roomsQuery);
      setMyRooms(roomsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBirthday = (timestamp) => {
    if (!timestamp) return null;
    let date;
    if (typeof timestamp === 'string' && timestamp.includes('-')) {
      const parts = timestamp.split('-');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        date = new Date(timestamp);
      }
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          
          {/* Cover Photo */}
          <div 
            className="h-48 bg-gradient-to-r from-primary to-green-600 relative"
            style={{
              backgroundImage: profile.cover_url 
                ? `url(${profile.cover_url})` 
                : 'linear-gradient(to right, #0d6b3f, #10b981)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* Profile Info */}
          <div className="px-8 pb-8 relative">
            
            {/* Avatar (overlapping cover) */}
            <div className="flex justify-between items-end -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-500">
                      {profile.full_name?.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-0.5">
              {profile.full_name}
            </h1>
            {profile.username && (
              <p className="text-sm font-medium text-gray-500 mb-3">
                @{profile.username}
              </p>
            )}

            {/* Edit Button */}
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 mb-6"
            >
              <Edit3 size={14} /> Edit Profile
            </Link>

            {/* About Me */}
            {profile.bio && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">About Me</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed">
                  {profile.bio}
                </div>
              </div>
            )}

            {/* Two Column Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Quick Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Details</h3>
                <div className="space-y-2 text-sm">
                  {profile.hometown && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={16} className="text-primary" />
                      <span>{profile.hometown}</span>
                    </div>
                  )}
                  {profile.current_location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={16} className="text-primary" />
                      <span>{profile.current_location}</span>
                    </div>
                  )}
                  {(profile.university_name || profile.university_id) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <GraduationCap size={16} className="text-primary" />
                      <span>
                        {profile.university_name || 
                         universities.find(u => u.id === profile.university_id)?.name || 
                         `University ID: ${profile.university_id}`}
                      </span>
                    </div>
                  )}
                  {(profile.gender || profile.sex || profile.nationality) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={16} className="text-primary" />
                      <span>
                        {(profile.gender || profile.sex) && 
                          ((profile.gender || profile.sex).charAt(0).toUpperCase() + (profile.gender || profile.sex).slice(1))
                        }
                        {(profile.gender || profile.sex) && profile.nationality && ' | '}
                        {profile.nationality}
                      </span>
                    </div>
                  )}
                  {profile.birthday && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-primary" />
                      <span>{formatBirthday(profile.birthday)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} className="text-primary" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} className="text-primary" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home size={16} /> My Listings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark size={16} /> Saved Rooms
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon size={16} /> Settings
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : myRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500 mb-4">You haven't posted any rooms yet</p>
                    <Link
                      to="/add-room"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                    >
                      Post Your First Room
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myRooms.map(room => (
                      <MyListingCard key={room.id} room={room} onUpdate={loadUserData} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Rooms Tab */}
            {activeTab === 'saved' && (
              <div className="text-center py-12">
                <Bookmark className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">Save your favorite rooms to view them here!</p>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <Link
                  to="/profile/edit"
                  className="block p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-sm text-gray-500">Update your personal information</div>
                </Link>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium">Privacy Settings</div>
                  <div className="text-sm text-gray-500">Manage your privacy preferences</div>
                </div>
                <div className="p-4 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer text-red-600">
                  <div className="font-medium">Delete Account</div>
                  <div className="text-sm text-red-500">Permanently delete your account</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// My Listing Card Component
function MyListingCard({ room, onUpdate }) {
  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0];
  const isShared = room.listing_type === 'shared';
  const price = isShared 
    ? (room.split_cost_per_person || room.price_per_month) / 100
    : room.price_per_month / 100;

  const handleToggleAvailability = async () => {
    const newStatus = !room.is_available;
    const message = newStatus 
      ? 'Publish this listing?' 
      : 'Mark this room as rented? (It will be hidden from search)';
    
    if (!confirm(message)) return;

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      await updateDoc(doc(db, 'rooms', room.id), {
        is_available: newStatus
      });
      
      alert(newStatus ? '✅ Listing published!' : '✅ Marked as rented!');
      onUpdate(); // Reload the listings
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${room.title}"? This cannot be undone!`)) return;

    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      await deleteDoc(doc(db, 'rooms', room.id));
      alert('✅ Listing deleted!');
      onUpdate();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40">
        <img 
          src={primaryImage?.url || 'https://via.placeholder.com/400x300'}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            room.is_available 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {room.is_available ? 'Active' : 'Rented'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold line-clamp-1">{room.title}</h3>
          <span className="text-primary font-bold whitespace-nowrap ml-2">
            ${price.toFixed(0)}{isShared ? ' split' : '/mo'}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <MapPin size={12} />
          {room.district || 'Phnom Penh'}
        </div>

        {/* ✅ Working buttons */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Link 
            to={`/edit-room/${room.id}`}
            className="text-center px-3 py-2 border rounded text-sm hover:bg-gray-50 font-medium"
          >
            Edit Listing
          </Link>
          <button 
            onClick={handleToggleAvailability}
            className="text-center px-3 py-2 border rounded text-sm hover:bg-gray-50 font-medium"
          >
            {room.is_available ? 'Mark as Rented' : 'Publish Listing'}
          </button>
        </div>

        {/* Delete button */}
        <button 
          onClick={handleDelete}
          className="w-full text-center px-3 py-2 border border-red-200 rounded text-sm text-red-600 hover:bg-red-50 font-medium"
        >
          Delete Listing
        </button>
      </div>
    </div>
  );
}