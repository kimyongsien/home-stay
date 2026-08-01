import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadMultipleImages } from '../services/cloudinary';
import { getAllUniversities } from '../services/rooms';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Upload, Home, X, ArrowLeft, Wifi, Snowflake, 
  Bath, Bike, ChefHat, WashingMachine, Check 
} from 'lucide-react';

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'aircon', label: 'Air Conditioning', icon: Snowflake },
  { id: 'private_bathroom', label: 'Private Bathroom', icon: Bath },
  { id: 'parking', label: 'Moto Parking', icon: Bike },
  { id: 'kitchen', label: 'Small Kitchen', icon: ChefHat },
  { id: 'laundry', label: 'Laundry Nearby', icon: WashingMachine },
];

export default function EditRoomPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';
  
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_type: 'room',
    listing_type: 'entire',
    floor_level: 1,
    price_per_month: '',
    electricity_rate: 1000,
    water_rate: 1500,
    province: '',
    district: '',
    university_id: '',
    is_available: true,
    amenities: [],
    // Shared room preferences
    noise_level: '',
    guest_policy: '',
    cleaning_smoking: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load universities
      const unis = await getAllUniversities();
      setUniversities(unis);

      // Load room data
      const roomRef = doc(db, 'rooms', id);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        alert('Room not found!');
        navigate('/profile');
        return;
      }

      const roomData = roomSnap.data();

      // Check if user owns this room
      if (roomData.landlord_id !== user.uid && roomData.host_id !== user.uid) {
        alert('You do not have permission to edit this room!');
        navigate('/profile');
        return;
      }

      // Populate form
      setFormData({
        title: roomData.title || '',
        description: roomData.description || '',
        room_type: roomData.room_type || 'room',
        listing_type: roomData.listing_type || (roomData.room_type === 'shared_room' ? 'shared' : 'entire'),
        floor_level: roomData.floor_level || 1,
        price_per_month: (roomData.price_per_month / 100).toString() || '',
        electricity_rate: roomData.electricity_rate || 1000,
        water_rate: roomData.water_rate || 1500,
        province: roomData.province || '',
        district: roomData.district || '',
        university_id: roomData.university_id || '',
        is_available: roomData.is_available !== false,
        amenities: roomData.amenities || (roomData.wifi_included ? ['wifi'] : []),
        noise_level: roomData.roommate_preferences?.noise_level || '',
        guest_policy: roomData.roommate_preferences?.guest_policy || '',
        cleaning_smoking: roomData.roommate_preferences?.cleaning_smoking || []
      });

      setExistingImages(roomData.images || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected]);
    setNewPreviews((prev) => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    if (existingImages.length + newFiles.length <= 1) {
      alert('At least 1 photo is required!');
      return;
    }
    if (!confirm('Remove this image?')) return;
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId) => {
    const current = formData.amenities || [];
    if (current.includes(amenityId)) {
      setFormData({ ...formData, amenities: current.filter(id => id !== amenityId) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenityId] });
    }
  };

  const togglePreference = (field, value) => {
    setFormData({ ...formData, [field]: formData[field] === value ? '' : value });
  };

  const toggleArrayItem = (field, value) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length + newFiles.length === 0) {
      alert('Please keep or upload at least 1 photo!');
      return;
    }

    setSaving(true);

    try {
      // Upload new images if any
      let uploadedImages = [];
      if (newFiles.length > 0) {
        console.log('📤 Uploading new images...');
        const uploaded = await uploadMultipleImages(newFiles);
        uploadedImages = uploaded.map((img, i) => ({
          url: img.url,
          public_id: img.public_id,
          is_primary: existingImages.length === 0 && i === 0,
          order: existingImages.length + i,
        }));
      }

      // Combine existing + new images
      const allImages = [...existingImages, ...uploadedImages];

      // Make sure at least one image is primary
      if (allImages.length > 0 && !allImages.some(img => img.is_primary)) {
        allImages[0].is_primary = true;
      }

      // Get university code
      const selectedUni = universities.find(u => u.id === formData.university_id);

      // Update Firestore
      const updates = {
        title: formData.title,
        description: formData.description,
        room_type: formData.room_type,
        floor_level: parseInt(formData.floor_level) || 1,
        price_per_month: parseInt(formData.price_per_month) * 100,
        split_cost_per_person: parseInt(formData.price_per_month) * 100,
        electricity_rate: parseInt(formData.electricity_rate) || 1000,
        water_rate: parseInt(formData.water_rate) || 1500,
        wifi_included: (formData.amenities || []).includes('wifi'),
        amenities: formData.amenities || [],
        province: formData.province,
        district: formData.district,
        location_summary: `${formData.district}, ${formData.province}`,
        university_id: formData.university_id || null,
        university_code: selectedUni?.short_code || '',
        is_available: formData.is_available,
        images: allImages,
        updated_at: serverTimestamp(),
      };

      if (formData.listing_type === 'shared' || formData.room_type === 'shared_room') {
        updates.roommate_preferences = {
          noise_level: formData.noise_level,
          guest_policy: formData.guest_policy,
          cleaning_smoking: formData.cleaning_smoking,
        };
      }

      await updateDoc(doc(db, 'rooms', id), updates);
      alert('✅ Room updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isShared = formData.listing_type === 'shared' || formData.room_type === 'shared_room';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-200 rounded-xl transition bg-white shadow-xs"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <Home className="text-primary" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Edit Your Room</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Room Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Photos</h2>
            
            {/* Existing Photos */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Current Photos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img 
                        src={img.url} 
                        className="h-28 w-full object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition"
                      >
                        <X size={12} />
                      </button>
                      {img.is_primary && (
                        <div className="absolute bottom-1.5 left-1.5 bg-primary text-white text-xs px-2 py-0.5 rounded-md font-medium">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Dropzone */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload size={20} className="text-gray-600" />
                </div>
                <p className="font-medium text-gray-700">Click or drag to add more photos</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG or PNG, max 10MB per file
                </p>
              </label>
            </div>

            {/* New Image Previews */}
            {newPreviews.length > 0 && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  New Photos to Upload
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {newPreviews.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} className="h-28 w-full object-cover rounded-xl border border-blue-200" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Room Details & Cost */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Details & Cost</h2>

            {/* Availability Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4 border border-gray-200">
              <div>
                <div className="font-semibold text-gray-900 text-sm">Availability Status</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formData.is_available ? 'Currently Active (Visible to searchers)' : 'Marked as Rented (Hidden from search)'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('is_available', !formData.is_available)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_available ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_available ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700">Room Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious Room near RUPP"
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your room..."
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              {/* Room Type & Monthly Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Room Type *</label>
                  <select
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.room_type}
                    onChange={(e) => updateField('room_type', e.target.value)}
                  >
                    <option value="room">Room</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                    <option value="shared_room">Shared Room</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price / month ($) *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="150"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      value={formData.price_per_month}
                      onChange={(e) => updateField('price_per_month', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Province *</label>
                  <select
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.province}
                    onChange={(e) => updateField('province', e.target.value)}
                  >
                    <option value="">Select province...</option>
                    {['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 
                      'Kampong Cham', 'Kandal', 'Kampot', 'Kep', 'Preah Vihear'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">District / Khan *</label>
                  <select
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  >
                    <option value="">Select district...</option>
                    {['Toul Kork','Chamkarmon','Daun Penh','Sen Sok','Mean Chey','Russey Keo','7 Makara','Por Sen Chey']
                      .map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Nearest University & Floor Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nearest University <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.university_id}
                    onChange={(e) => updateField('university_id', e.target.value)}
                  >
                    <option value="">None / Not applicable</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.short_code} - {uni.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Floor Level</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.floor_level}
                    onChange={(e) => updateField('floor_level', e.target.value)}
                  />
                </div>
              </div>

              {/* Utility Rates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Electricity (KHR/kWh)</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.electricity_rate}
                    onChange={(e) => updateField('electricity_rate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Water (KHR/m³)</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={formData.water_rate}
                    onChange={(e) => updateField('water_rate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Included Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Included Amenities</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select all features and facilities available for this room
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = (formData.amenities || []).includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition text-left ${
                      isSelected
                        ? 'border-2 border-primary bg-green-50 text-primary font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Roommate Preferences (if shared room) */}
          {isShared && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Roommate Preferences & Vibe</h2>
              
              <div className="space-y-6">
                {/* Noise Level */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Noise Level Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {['Quiet & Studious', 'Moderate / Normal', 'Social & Lively'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => togglePreference('noise_level', level)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                          formData.noise_level === level
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Policy */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Guest Policy</label>
                  <div className="flex flex-wrap gap-2">
                    {['No Overnight Guests', 'Guests Allowed w/ Notice', 'Any Time'].map((policy) => (
                      <button
                        key={policy}
                        type="button"
                        onClick={() => togglePreference('guest_policy', policy)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                          formData.guest_policy === policy
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {policy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Habits */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">House Habits & Rules</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'no_smoking', label: 'No Smoking Inside' },
                      { id: 'pets_allowed', label: 'Pets Allowed' },
                      { id: 'weekly_cleaning', label: 'Shared Weekly Cleaning' },
                    ].map((item) => {
                      const isChecked = (formData.cleaning_smoking || []).includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleArrayItem('cleaning_smoking', item.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between transition text-sm ${
                            isChecked
                              ? 'border-2 border-primary bg-green-50 text-primary font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isChecked && <Check size={16} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition shadow-sm disabled:opacity-50 text-center"
            >
              {saving ? '⏳ Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}