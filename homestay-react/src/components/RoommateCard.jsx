import { Link } from 'react-router-dom';

export default function RoommateCard({ room, isStudent = true }) {
  const primaryImage = room.images?.find(img => img.is_primary) || room.images?.[0];
  const totalRent = (room.price_per_month || room.split_cost_per_person * 2) / 100;
  const splitPrice = (room.split_cost_per_person || room.price_per_month) / 100;

  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = birthday.toDate ? birthday.toDate() : new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const hostAge = calculateAge(room.host_birthday) || 22;
  const hostSex = room.host_sex === 'female' ? 'Female' : room.host_sex === 'male' ? 'Male' : 'Person';
  
  // ✅ Adaptive host context
  const hostContext = isStudent
    ? `${room.university_code || 'Student'} ${room.host_major || 'Student'} Year ${room.host_school_year || '2'}`
    : room.host_occupation || 'Working Professional';

  const formatHabits = () => {
    const habits = [];
    
    if (room.roommate_preferences?.noise_level) {
      habits.push(room.roommate_preferences.noise_level.replace('Quiet Hours Enforced', isStudent ? 'Quiet Study' : 'Early Sleeper'));
    }
    if (room.roommate_preferences?.cleaning_smoking?.includes('Non-Smoking')) {
      habits.push('Non-smoker');
    }
    if (room.roommate_preferences?.guest_policy === 'No Overnight Guests') {
      habits.push('No Guests');
    }
    if (room.roommate_preferences?.cleaning_smoking?.includes('Strict Cleaning')) {
      habits.push('Keeps Clean');
    }
    if (room.amenities?.includes('kitchen')) {
      habits.push('Cooks often');
    }
    
    return habits.length > 0 ? habits.join(', ') : 'Easy-going';
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow flex flex-col">
      {/* Image with Status Badge */}
      <div className="relative h-48 bg-gray-100">
        <img 
          src={primaryImage?.url || 'https://via.placeholder.com/400x300'}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold shadow-md">
          STATUS: ROOM AVAILABLE FOR SPLIT
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 mb-3">
          {room.title || `Shared ${room.room_type}`}
        </h3>

        {/* ✅ Adaptive Location */}
        <div className="text-sm mb-2">
          <span className="font-semibold text-gray-900">Location:</span>{' '}
          <span className="text-gray-700">
            {isStudent 
              ? room.location_summary 
              : `${room.district || 'Phnom Penh'} - ${room.location_summary}`
            }
          </span>
        </div>

        <div className="text-sm mb-2">
          <span className="font-semibold text-gray-900">Total Cost:</span>{' '}
          <span className="text-gray-700">
            ${totalRent}/month (${splitPrice} per person)
          </span>
        </div>

        <div className="text-sm mb-4">
          <span className="font-semibold text-gray-900">Utilities:</span>{' '}
          <span className="text-gray-700">
            {room.electricity_rate?.toLocaleString() || '1,000'} KHR/kWh shared
          </span>
        </div>

        <hr className="my-2" />

        {/* ✅ Adaptive Resident Info */}
        <div className="text-sm mb-2 mt-2">
          <span className="font-semibold text-gray-900">
            {isStudent ? 'Current Resident:' : 'Current Housemate:'}
          </span>{' '}
          <span className="text-gray-700">
            {room.host_name || 'Anonymous'} 
            {' ('}
            {hostSex}, {hostAge}, {hostContext}
            {')'}
          </span>
        </div>

        <div className="text-sm mb-4 flex-1">
          <span className="font-semibold text-gray-900">
            {isStudent ? 'Habits:' : 'Lifestyle:'}
          </span>{' '}
          <span className="text-gray-700">{formatHabits()}</span>
        </div>

        <Link
          to={`/rooms/${room.id}`}
          className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors mt-auto"
        >
          View Full Property Details
        </Link>
      </div>
    </div>
  );
} 