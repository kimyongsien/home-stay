import { useAuth } from '../context/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

export default function SafetyTips({ compact = false }) {
  const { profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';

  // ✅ Different tips per user type
  const studentTips = [
    'Never send deposit before walkthrough',
    'Verify sub-meter vs EDC rates',
    'Request Campus Ambassador escort',
    'Check with your university housing office',
  ];

  const professionalTips = [
    'Never send deposit before walkthrough',
    'Verify sub-meter vs EDC rates',
    'Meet landlord in person, verify ID card',
    'Check building security & neighborhood safety',
    'Read the lease contract carefully',
  ];

  const tips = isStudent ? studentTips : professionalTips;
  const title = isStudent ? 'Student Safety Tips' : 'Renter Safety Tips';

  // ✅ Compact version for shared room detail page
  if (compact) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-200">
        <div className="flex items-start gap-2 mb-2">
          <Shield className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <div className="font-semibold text-yellow-800 text-sm mb-1">
              {title}
            </div>
            <p className="text-xs text-gray-700">
              {isStudent 
                ? 'Always meet in public first or visit the property during daylight. Contact your Campus Ambassador for help.'
                : 'Always meet in public first or visit the property during daylight before making any payments. Verify the landlord\'s ID.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full version for entire room detail page
  return (
    <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm border border-yellow-200">
      <div className="flex items-center gap-2 font-semibold text-yellow-800 mb-2">
        <AlertTriangle size={16} />
        {title}
      </div>
      <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
        {tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ol>
    </div>
  );
}