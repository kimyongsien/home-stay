import { useAuth } from '../context/AuthContext';
import { Shield, DollarSign, AlertCircle, Users, MapPin, Briefcase } from 'lucide-react';

export default function TrustBadges() {
  const { profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';

  // ✅ Different badges per user type
  const studentBadges = [
    { icon: DollarSign, text: 'Finding Good Price' },
    { icon: Shield, text: 'Fraud Protection Guarantee' },
    { icon: AlertCircle, text: 'No Hidden Utility Scams' },
  ];

  const professionalBadges = [
    { icon: MapPin, text: 'Verified Locations' },
    { icon: Shield, text: 'Landlord ID Verified' },
    { icon: Briefcase, text: 'Professional Network' },
  ];

  const badges = isStudent ? studentBadges : professionalBadges;

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-700 flex-wrap">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <div className="w-1 h-1 bg-gray-400 rounded-full"></div>}
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-primary" />
                  <span>{badge.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}