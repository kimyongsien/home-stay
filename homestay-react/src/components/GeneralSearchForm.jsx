import { useState } from 'react';
import { MapPin, Search, Car } from 'lucide-react';

export const PHNOM_PENH_DISTRICTS = [
  'Toul Kork', 'Chamkarmon', 'Daun Penh', 'Sen Sok',
  'Mean Chey', 'Russey Keo', '7 Makara', 'Por Sen Chey'
];

export default function GeneralSearchForm({ onSearch }) {
  const [district, setDistrict] = useState('');
  const [roomType, setRoomType] = useState('');
  const [needsParking, setNeedsParking] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    onSearch({ district, roomType, needsParking });
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl shadow-lg p-4 max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* District / Khan */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-primary" size={18} />
          <select
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">All Districts / Khan</option>
            {PHNOM_PENH_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Professional-friendly type filter */}
        <select
          className="px-3 py-2.5 border border-gray-200 rounded-lg outline-none bg-white"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="">Any Type</option>
          <option value="studio">Studio</option>
          <option value="apartment">Apartment</option>
          <option value="room">Room</option>
        </select>

        {/* Parking toggle */}
        <button
          type="button"
          onClick={() => setNeedsParking(!needsParking)}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium ${
            needsParking
              ? 'border-primary bg-green-50 text-primary'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          <Car size={16} /> Parking
        </button>

        {/* Search */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark"
        >
          <Search size={18} /> Search
        </button>
      </div>
    </form>
  );
}