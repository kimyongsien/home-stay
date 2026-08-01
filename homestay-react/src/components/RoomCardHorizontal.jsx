import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Share2 } from 'lucide-react';
import LocationBadge from './LocationBadge';

export default function RoomCardHorizontal({ room }) {
  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0];
  const isShared = room.listing_type === 'shared';
  const price = isShared 
    ? (room.split_cost_per_person || room.price_per_month) / 100 
    : room.price_per_month / 100;

  const handleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Chat feature coming soon!');
  };

  const handleCall = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Phone: ' + (room.landlord_phone || 'Not available'));
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + `/rooms/${room.id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <Link to={`/rooms/${room.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
        {/* Image with Badge */}
        <div className="relative h-56 bg-gray-100">
          <img 
            src={primaryImage?.url || 'https://via.placeholder.com/400x300'}
            alt={room.title}
            className="w-full h-full object-cover"
          />
          {/* ✅ Adaptive Location Badge */}
          <div className="absolute top-3 left-3">
            <LocationBadge room={room} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Room Type & Availability */}
          <div className="text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-2">
            <span>{room.room_type?.replace('_', ' ') || 'Room'}</span>
            <span className="text-gray-300">•</span>
            <span className={room.is_available ? 'text-primary' : 'text-red-500'}>
              {room.is_available ? 'Available Now' : 'Not Available'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
            {room.title || `${room.room_type} near ${room.university_code}`}
          </h3>

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-bold text-primary">${price.toFixed(0)}</span>
            <span className="text-gray-600 ml-1">/ month</span>
            {isShared && <span className="text-xs text-blue-600 ml-2">(split)</span>}
          </div>

          {/* Utility Info Boxes */}
          <div className="space-y-2 mb-4">
            <div className="bg-gray-100 rounded-md px-3 py-2 text-xs text-gray-700">
              [ Electricity: {room.electricity_rate?.toLocaleString() || '1,000'} KHR/kWh ]
            </div>
            <div className="bg-gray-100 rounded-md px-3 py-2 text-xs text-gray-700">
              [ Water: {room.water_rate?.toLocaleString() || '1,500'} KHR/m³ ]
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleChat}
              className="flex items-center justify-center gap-1 bg-primary text-white py-2 rounded-md text-xs font-medium hover:bg-primary-dark transition-colors"
            >
              <MessageCircle size={14} /> Chat In-App
            </button>
            <button
              onClick={handleCall}
              className="flex items-center justify-center gap-1 border border-gray-300 text-gray-700 py-2 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <Phone size={14} /> Call
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1 border border-gray-300 text-gray-700 py-2 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}