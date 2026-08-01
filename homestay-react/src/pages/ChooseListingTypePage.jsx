import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bed, DoorOpen } from 'lucide-react';

export default function ChooseListingTypePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile?.user_type !== 'landlord' && profile?.user_type !== 'student') {
      navigate('/');
    }
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-12">
          What are you listing today?
        </h1>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1: Entire Room */}
          <button
            onClick={() => navigate('/add-room/entire')}
            className="bg-white border-2 border-primary rounded-2xl p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:bg-opacity-10 transition-all">
                <Bed size={48} className="text-gray-700 group-hover:text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Entire Room</h2>
              <p className="text-gray-600 text-center">
                Post a private room or apartment
              </p>
            </div>
          </button>

          {/* Option 2: Shared Room */}
          <button
            onClick={() => navigate('/add-room/shared')}
            className="bg-white border-2 border-primary rounded-2xl p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:bg-opacity-10 transition-all">
                <DoorOpen size={48} className="text-gray-700 group-hover:text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Share Room</h2>
              <p className="text-gray-600 text-center">
                Find a roommate to share your space
              </p>
            </div>
          </button>

        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
          <p className="text-blue-800 text-sm text-center">
            <b >Not sure which to choose?</b>
          </p>
            <br />
            <span className="text-blue-700">
              <b>Entire Room:</b> You're a landlord renting out property<br />
              <b>Share Room:</b> You have a space and want a roommate to split costs
            </span>
          
        </div>
      </div>
    </div>
  );
}