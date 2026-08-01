import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById } from '../services/rooms';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Zap, Droplet, Wifi, CheckCircle, Phone, MessageCircle, 
  Eye, Calendar, Share2, Bookmark, Snowflake, Bath, Bike, ChefHat, WashingMachine 
} from 'lucide-react';
import SafetyTips from '../components/SafetyTips';
import LocationMapCard from '../components/LocationMapCard';

const amenityIcons = {
  wifi: { icon: Wifi, label: 'Fast WiFi' },
  ac: { icon: Snowflake, label: 'Air Conditioning' },
  parking: { icon: Bike, label: 'Moto Parking' },
  bathroom: { icon: Bath, label: 'Private Bath' },
  kitchen: { icon: ChefHat, label: 'Small Kitchen' },
  laundry: { icon: WashingMachine, label: 'Laundry Nearby' },
};

export default function RoomDetailPage() {
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

  const hasAmenities = (room.amenities && room.amenities.length > 0) || room.wifi_included;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/find-rooms" className="text-primary hover:underline">Find Rooms</Link>
          <span>›</span>
          <span>{room.title || `${room.room_type} Room`}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Room Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image + Share buttons */}
            <div className="relative">
              <img 
                src={room.images?.[selectedImage]?.url || 'https://via.placeholder.com/800x500'}
                alt={room.title}
                className="w-full h-96 object-cover rounded-2xl bg-gray-200"
              />
              
              {/* Share/Save buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition">
                  <Share2 size={18} />
                </button>
                <button className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition">
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
                    alt={`Preview ${idx}`}
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
                {room.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin size={16} className="text-primary" /> 
                  {room.district || (isStudent && room.university_code ? `Near ${room.university_code}` : room.location_summary || 'Phnom Penh')}
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
              <div className="text-gray-700 leading-relaxed space-y-3">
                {room.description ? (
                  <p>{room.description}</p>
                ) : (
                  <p>Spacious {room.room_type || 'room'} located in {room.location_summary || room.district || 'Phnom Penh'}, perfect for comfortable staying.</p>
                )}
              </div>
            </div>

            <hr />

            {/* Amenities Included */}
            <div>
              <h2 className="text-xl font-bold mb-4">Amenities Included</h2>
              {hasAmenities ? (
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
                <p className="text-gray-500 text-sm">No specific amenities listed</p>
              )}
            </div>

            <hr />

            {/* Property Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase">Property Type</div>
                  <div className="font-medium">{room.room_type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Location</div>
                  <div className="font-medium">{room.location_summary || room.district || 'Phnom Penh'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Floor Level</div>
                  <div className="font-medium">{room.floor_level ? `${room.floor_level} Floor` : 'N/A'}</div>
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
            <hr />
            <div>
              <h2 className="text-xl font-bold mb-3">Utility Specifics</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} />
                  Electricity: {room.electricity_rate} KHR/kWh
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="text-blue-500" size={20} />
                  Water: {room.water_rate} KHR/m³
                </div>
                {room.wifi_included && (
                  <div className="flex items-center gap-2">
                    <Wifi className="text-green-500" size={20} />
                    Free high-speed WiFi included
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Landlord Info (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      ${(room.price_per_month / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-500">/ month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Entire {room.room_type || 'room'} listing.
                  </p>
                </div>

                <hr className="my-4" />

                {/* Landlord Info */}
                <h3 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider text-gray-500">Landlord Info</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {room.landlord_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{room.landlord_name}</div>
                    <div className="text-xs text-gray-500">@{room.landlord_username || 'landlord'}</div>
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
