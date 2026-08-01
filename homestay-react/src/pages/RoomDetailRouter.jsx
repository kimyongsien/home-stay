import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RoomDetailPage from './RoomDetailPage';
import SharedRoomDetailPage from './SharedRoomDetailPage';

export default function RoomDetailRouter() {
  const { id } = useParams();
  const [listingType, setListingType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkType = async () => {
      const docSnap = await getDoc(doc(db, 'rooms', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 🐛 DEBUG - Check browser console (F12)
        console.log('🐛 Full Room Data:', data);
        console.log('🐛 listing_type value:', data.listing_type);
        console.log('🐛 Will show:', data.listing_type === 'shared' ? 'SHARED PAGE' : 'ENTIRE PAGE');
        
        setListingType(data.listing_type || 'entire');
      }
      setLoading(false);
    };
    checkType();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return listingType === 'shared' ? <SharedRoomDetailPage /> : <RoomDetailPage />;
}