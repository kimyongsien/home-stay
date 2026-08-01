import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import { Home, LogOut, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();  // ← Get current path

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Home className="text-primary" size={28} />
          <span className="text-xl font-bold text-primary">HomeStay</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/find-rooms" 
            className={`font-medium ${
              isActive('/find-rooms') 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-700 hover:text-primary'
            }`}
          >
            Find Rooms
          </Link>
          <Link 
            to="/roommates" 
            className={`font-medium ${
              isActive('/roommates') 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-700 hover:text-primary'
            }`}
          >
            Find Roommates
          </Link>
          <Link 
            to="/about" 
            className={`font-medium ${
              isActive('/about') 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-700 hover:text-primary'
            }`}
          >
            About
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {profile?.user_type === 'landlord' && (
                <Link 
                  to="/add-room"
                  className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  <Plus size={18} /> Add Room
                </Link>
              )}
              <Link to="/profile" className="text-sm text-gray-600 hover:text-primary">
                Hi, {profile?.full_name?.split(' ')[0]}!
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-700 hover:text-red-600"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link 
                to="/signup"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}  