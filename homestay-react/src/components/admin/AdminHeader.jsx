import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Maximize, Minimize, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader() {
  const { profile } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200/80 shadow-sm shadow-gray-300/50 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left Side: Actions */}
        <div className="flex items-center gap-3">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (F11)" : "Toggle Fullscreen (F11)"}
            className="flex items-center gap-2 p-2 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-xs font-medium"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          {/* Go to User Website */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Public Website"
            className="flex items-center gap-2 p-2 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-xs font-medium"
          >
            <Globe size={18} />
            <span className="hidden sm:inline">View Main Site</span>
            <ExternalLink size={14} className="text-gray-400" />
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : profile?.full_name ? (
                profile.full_name.charAt(0).toUpperCase()
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-900 leading-tight">
                {profile?.full_name || 'Admin Account'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}