import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/auth';
import { 
  Home, LayoutDashboard, Users, ShieldCheck, 
  Building2, Flag, GraduationCap, Settings, LogOut 
} from 'lucide-react';

export default function AdminSidebar({ pendingCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
    ${isActive(path)
      ? 'bg-white text-gray-900' 
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
  `;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Home className="text-gray-900" size={20} />
          </div>
          <div>
            <div className="font-bold">Home Stay</div>
            <div className="text-xs text-gray-400 uppercase">Housing Admin</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        
        {/* Global Analytics */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-4">
            Global Analytics
          </div>
          <Link to="/admin" className={linkClass('/admin')}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        {/* Community Management */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-4">
            Community Management
          </div>
          <Link to="/admin/users" className={linkClass('/admin/users')}>
            <Users size={18} />
            Users Management
          </Link>
          <Link to="/admin/verifications" className={linkClass('/admin/verifications')}>
            <ShieldCheck size={18} />
            <span className="flex-1">Verifications</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount} Pending
              </span>
            )}
          </Link>
        </div>

        {/* Property Management */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-4">
            Property Management
          </div>
          <Link to="/admin/rooms" className={linkClass('/admin/rooms')}>
            <Building2 size={18} />
            Rooms Management
          </Link>
          <Link to="/admin/reports" className={linkClass('/admin/reports')}>
            <Flag size={18} />
            Reports
          </Link>
        </div>

        {/* Configuration */}
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold mb-2 px-4">
            Configuration
          </div>
          <Link to="/admin/universities" className={linkClass('/admin/universities')}>
            <GraduationCap size={18} />
            Universities
          </Link>
          <Link to="/admin/settings" className={linkClass('/admin/settings')}>
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}