import { useAuth } from '../context/AuthContext';

export default function LocationBadge({ room, small = false }) {
  const { profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';

  // ✅ Smart adaptive logic
  let locationText;
  
  if (isStudent) {
    // Students: Show university if available, otherwise district (fallback)
    if (room.university_code) {
      locationText = `NEAR ${room.university_code}`;
    } else {
      locationText = (room.district || 'PHNOM PENH').toUpperCase();
    }
  } else {
    // Non-students: Always show district
    locationText = (room.district || 'PHNOM PENH').toUpperCase();
  }

  const sizeClass = small 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-3 py-1 text-xs';

  return (
    <div className={`bg-white ${sizeClass} rounded-md font-semibold text-primary shadow-md`}>
      {locationText}
    </div>
  );
}
