import { Link } from 'react-router-dom';
import { MapPin, Zap, CheckCircle, Users } from 'lucide-react';
import LocationBadge from './LocationBadge';

export default function RoomCard({ room }) {
  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0];
  const isShared = room.listing_type === 'shared';
  const price = isShared 
    ? (room.split_cost_per_person || room.price_per_month) / 100 
    : room.price_per_month / 100;

  return (
    <Link to={`/rooms/${room.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="relative h-48">
          <img 
            src={primaryImage?.url || 'https://via.placeholder.com/400x300'}
            alt={room.title}
            className="w-full h-full object-cover"
          />
          
          {/* Type Badge - Top Left */}
          {isShared ? (
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Users size={14} /> SHARED
            </div>
          ) : (
            room.landlord_verified && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={14} /> VERIFIED
              </div>
            )
          )}

          {/* ✅ Location Badge (top right) */}
          <div className="absolute top-2 right-2">
            <LocationBadge room={room} small />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{room.title}</h3>
            <span className="text-primary font-bold whitespace-nowrap ml-2">
              ${price.toFixed(0)}
              <span className="text-xs text-gray-500">
                {isShared ? '/mo split' : '/mo'}
              </span>
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="line-clamp-1">{room.location_summary}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Zap size={14} /> {room.electricity_rate} KHR/kWh
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}