import { useState } from 'react';
import { MapPin, Bookmark, AlertTriangle, Share2, Map } from 'lucide-react';

export default function LocationMapCard({ room }) {
  const [saved, setSaved] = useState(false);

  if (!room) return null;

  const locationTitle = room.location_summary || `${room.district || ''}, ${room.province || 'Phnom Penh'}`;
  const subAddress = room.address || room.district || 'Phnom Penh, Cambodia';

  const handleOpenGoogleMaps = () => {
    const query = `${room.address ? room.address + ', ' : ''}${locationTitle}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room.title || 'Room Listing',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    alert(saved ? 'Removed from saved rooms' : 'Saved room to your bookmarks!');
  };

  const handleReport = () => {
    alert('Thank you for reporting. Our safety team will review this listing.');
  };

  return (
    <div className="space-y-3">
      {/* Location Map Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {/* Header Address */}
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={18} className="text-gray-700" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm leading-snug">{locationTitle}</h4>
            {subAddress && (
              <p className="text-xs text-gray-500 mt-0.5">{subAddress}</p>
            )}
          </div>
        </div>

        {/* Map Preview Container */}
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-emerald-50 border border-gray-200 flex items-center justify-center group">
          {/* Stylized Map Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 opacity-90" />
          
          {/* Decorative Map Elements */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-4 left-6 w-24 h-1 bg-amber-400 transform -rotate-12 rounded"></div>
            <div className="absolute bottom-8 right-8 w-32 h-1 bg-blue-400 transform rotate-45 rounded"></div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-emerald-400 rounded"></div>
          </div>

          {/* Centered Google Map Button */}
          <button 
            type="button"
            onClick={handleOpenGoogleMaps}
            className="relative z-10 bg-gray-900/90 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            <Map size={15} />
            Show on Google Map
          </button>
        </div>
      </div>

      {/* Action Buttons Row (Save, Report, Share) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleSave}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs ${
            saved 
              ? 'bg-green-50 border-primary text-primary' 
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Bookmark size={16} className={saved ? 'fill-primary text-primary' : ''} />
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          type="button"
          onClick={handleReport}
          className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <AlertTriangle size={16} />
          Report
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
