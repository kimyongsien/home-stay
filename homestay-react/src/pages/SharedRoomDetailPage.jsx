import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById } from '../services/rooms';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Eye, Calendar, Users, Bookmark, Flag, Share2, 
  MessageCircle, Phone, Shield, Wifi, Snowflake, Bath, 
  Bike, Moon, Cigarette, UserX, Sparkles, ChefHat, WashingMachine, Zap, Droplet, CheckCircle
} from 'lucide-react';
import SafetyTips from '../components/SafetyTips';
import LocationMapCard from '../components/LocationMapCard';

export default function SharedRoomDetailPage() {
  const { profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';

  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    getRoomById(id).then(data => {
      setRoom(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Room not found</p>
      </div>
    );
  }

  const daysAgo = room.created_at 
    ? Math.floor((new Date() - room.created_at.toDate()) / (1000 * 60 * 60 * 24))
    : 0;

  const price = (room.split_cost_per_person || room.price_per_month) / 100;

  // Icons mapping for amenities
  const amenityIcons = {
    wifi: { icon: Wifi, label: 'Fast WiFi' },
    ac: { icon: Snowflake, label: 'Air Conditioning' },
    parking: { icon: Bike, label: 'Moto Parking' },
    bathroom: { icon: Bath, label: 'Private Bath' },
    kitchen: { icon: ChefHat, label: 'Small Kitchen' },
    laundry: { icon: WashingMachine, label: 'Laundry Nearby' },
  };

  // Icons mapping for house rules
  const ruleIcons = {
    'Quiet Hours Enforced': { icon: Moon, color: 'text-purple-600' },
    'Casual & Noisy OK': { icon: Users, color: 'text-blue-600' },
    'Non-Smoking': { icon: Cigarette, color: 'text-red-600' },
    'No Overnight Guests': { icon: UserX, color: 'text-orange-600' },
    'Friends Welcome': { icon: Users, color: 'text-green-600' },
    'Strict Cleaning': { icon: Sparkles, color: 'text-blue-600' },
    'Relaxed': { icon: Users, color: 'text-gray-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/roommates" className="text-primary hover:underline">Find Roommates</Link>
          <span>›</span>
          <span>
            Shared {room.room_type} {isStudent ? `near ${room.university_code}` : `in ${room.district || 'Phnom Penh'}`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Room Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image + Share buttons */}
            <div className="relative">
              <img 
                src={room.images?.[selectedImage]?.url || 'https://via.placeholder.com/800x500'}
                alt={room.title}
                className="w-full h-96 object-cover rounded-2xl bg-gray-200"
              />
              
              {/* Share/Save buttons (top-right) */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                  <Share2 size={18} />
                </button>
                <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {room.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {room.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-full object-cover rounded-lg cursor-pointer border-2 ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Title Section */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {room.title || `Shared ${room.room_type} near ${room.university_code}`}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={16} className="text-primary" /> 
                  {isStudent ? `Near ${room.university_code}` : `${room.district || 'Phnom Penh'}`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> Posted {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} /> Views: {room.view_count || 0}
                </span>
              </div>
            </div>

            <hr />

            {/* About the Space */}
            <div>
              <h2 className="text-xl font-bold mb-3">About the Space</h2>
              <div className="text-gray-700 space-y-3 leading-relaxed">
                {room.description ? (
                  <p>{room.description}</p>
                ) : (
                  <p>Looking for a dedicated student to share this spacious {room.room_type}. 
                  It's incredibly close to {room.university_code} ({room.location_summary}), 
                  making it perfect for someone who wants to save time on commuting.</p>
                )}
              </div>
            </div>

            <hr />

            {/* Room Vibe & Rules */}
            <div>
              <h2 className="text-xl font-bold mb-4">Room Vibe & Rules</h2>
              <div className="flex flex-wrap gap-2">
                {/* Noise Level */}
                {room.roommate_preferences?.noise_level && (
                  <RuleBadge 
                    label={room.roommate_preferences.noise_level}
                    icon={ruleIcons[room.roommate_preferences.noise_level]?.icon || Moon}
                    color={ruleIcons[room.roommate_preferences.noise_level]?.color || 'text-gray-600'}
                  />
                )}
                
                {/* Guest Policy */}
                {room.roommate_preferences?.guest_policy && (
                  <RuleBadge 
                    label={room.roommate_preferences.guest_policy}
                    icon={ruleIcons[room.roommate_preferences.guest_policy]?.icon || UserX}
                    color={ruleIcons[room.roommate_preferences.guest_policy]?.color || 'text-gray-600'}
                  />
                )}
                
                {/* Cleaning & Smoking */}
                {room.roommate_preferences?.cleaning_smoking?.map(item => (
                  <RuleBadge
                    key={item}
                    label={item}
                    icon={ruleIcons[item]?.icon || Sparkles}
                    color={ruleIcons[item]?.color || 'text-gray-600'}
                  />
                ))}
                
                {/* Show default if nothing */}
                {(!room.roommate_preferences || Object.keys(room.roommate_preferences).length === 0) && (
                  <p className="text-gray-500 text-sm">No specific rules set</p>
                )}
              </div>
            </div>

            <hr />

            {/* Amenities Included */}
            <div>
              <h2 className="text-xl font-bold mb-4">Amenities Included</h2>
              {(room.amenities && room.amenities.length > 0) || room.wifi_included ? (
                <div className="flex flex-wrap gap-2.5">
                  {room.amenities?.map(amenityId => {
                    const item = amenityIcons[amenityId];
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <div key={amenityId} className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm bg-white text-gray-700">
                        <Icon size={18} className="text-primary" />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                  {room.wifi_included && !room.amenities?.includes('wifi') && (
                    <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm bg-white text-gray-700">
                      <Wifi size={18} className="text-primary" />
                      <span>Fast WiFi</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No amenities listed</p>
              )}
            </div>

            <hr />

            {/* Property Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Property Type</div>
                  <div className="font-medium">{room.room_type || 'Shared Room'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Location</div>
                  <div className="font-medium">{room.location_summary || room.district || 'Phnom Penh'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Floor Level</div>
                  <div className="font-medium">{room.floor_level ? `${room.floor_level} Floor` : '1 Floor'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">
                    {isStudent ? 'Near Campus' : 'District'}
                  </div>
                  <div className="font-medium">
                    {isStudent ? (room.university_code || 'N/A') : (room.district || 'Phnom Penh')}
                  </div>
                </div>
              </div>
            </div>

            {/* Utility Specifics */}
            {(room.electricity_rate || room.water_rate || room.wifi_included) && (
              <>
                <hr />
                <div>
                  <h2 className="text-xl font-bold mb-3">Utility Specifics</h2>
                  <div className="space-y-3 text-gray-700">
                    {room.electricity_rate && (
                      <div className="flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} />
                        Electricity: {room.electricity_rate} KHR/kWh
                      </div>
                    )}
                    {room.water_rate && (
                      <div className="flex items-center gap-2">
                        <Droplet className="text-blue-500" size={20} />
                        Water: {room.water_rate} KHR/m³
                      </div>
                    )}
                    {room.wifi_included && (
                      <div className="flex items-center gap-2">
                        <Wifi className="text-green-500" size={20} />
                        Free high-speed WiFi included
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - Price & Landlord Info (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">${price}</span>
                    <span className="text-gray-500">/ month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Split cost for sharing the {room.room_type || 'room'}.
                  </p>
                </div>

                <hr className="my-4" />

                {/* Landlord Info Header */}
                <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider text-gray-500">LANDLORD INFO</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {(room.landlord_name || room.host_name)?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{room.landlord_name || room.host_name}</div>
                    <div className="text-xs text-gray-500">@{room.landlord_username || room.host_username || 'landlord'}</div>
                  </div>
                </div>

                {room.landlord_verified && (
                  <div className="flex items-center gap-2 text-primary text-sm mb-4">
                    <CheckCircle size={16} />
                    Status: Identity Verified via ID Card
                  </div>
                )}

                <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark mb-2 flex items-center justify-center gap-2 transition shadow-sm">
                  <MessageCircle size={20} /> Secure In-App Chat
                </button>
                
                <button className="w-full border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <Phone size={20} /> Show Phone Number
                </button>

                <div className="mt-4">
                  <SafetyTips compact />
                </div>
              </div>

              {/* Location Map & Action Card */}
              <LocationMapCard room={room} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Rule Badge Component
function RuleBadge({ label, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm">
      <Icon size={16} className={color} />
      <span>{label}</span>
    </div>
  );
}