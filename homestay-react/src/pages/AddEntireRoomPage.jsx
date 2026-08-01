import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadMultipleImages } from '../services/cloudinary';
import { createRoom, getAllUniversities } from '../services/rooms';
import { Upload, Home, X, Wifi, Snowflake, Bath, Bike, ChefHat, WashingMachine } from 'lucide-react';

export default function AddRoomPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isStudent = (profile?.userType || 'student') === 'student';
  const [universities, setUniversities] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_type: 'room',
    floor_level: 1,
    price_per_month: '',
    electricity_rate: 1000,
    water_rate: 1500,
    province: '',
    district: '',
    university_id: '',
    address: '',
    amenities: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile?.user_type !== 'landlord') {
      alert('Only landlords can add rooms!');
      navigate('/');
      return;
    }
    getAllUniversities().then(setUniversities);
  }, [user, profile]);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setPreviews((prevPreviews) => [
      ...prevPreviews,
      ...newFiles.map(f => URL.createObjectURL(f))
    ]);
  };

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
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
    if (selectedFiles.length < 3) {
      alert('Please upload at least 3 photos!');
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading images...');
      const uploaded = await uploadMultipleImages(selectedFiles);
      
      const images = uploaded.map((img, i) => ({
        url: img.url,
        public_id: img.public_id,
        is_primary: i === 0,
        order: i
      }));

      const selectedUni = universities.find(u => u.id === formData.university_id);

      const roomData = {
        title: formData.title || `${formData.room_type} in ${formData.district}`,
        description: formData.description,
        room_type: formData.room_type,
        listing_type: 'entire',
        posted_by_type: isStudent ? 'student' : 'non-student',
        price_per_month: parseInt(formData.price_per_month) * 100,
        floor_level: parseInt(formData.floor_level),
        electricity_rate: parseInt(formData.electricity_rate),
        water_rate: parseInt(formData.water_rate),
        wifi_included: formData.amenities.includes('wifi'),
        amenities: formData.amenities,
        
        province: formData.province,
        district: formData.district,
        location_summary: `${formData.district}, ${formData.province}`,
        
        university_id: formData.university_id || null,
        university_code: selectedUni?.short_code || '',
        
        landlord_id: user.uid,
        landlord_name: profile.full_name,
        landlord_username: profile.username,
        landlord_verified: profile.id_verified,
        images: images
      };

      const roomId = await createRoom(roomData);
      alert('🎉 Room posted successfully!');
      navigate(`/rooms/${roomId}`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to post room: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Home className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">Post a New Room</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Room Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Room Photos</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
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
                <p className="font-medium text-gray-700">Click or drag to upload photos of your room</p>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 3 photos recommended, JPG or PNG, max 10MB per file
                </p>
              </label>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {previews.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="h-24 w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Room Details & Cost */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Room Details & Cost</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700">Room Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunny Studio Room"
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

              {/* Type & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Room Type *</label>
                  <select
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                    value={formData.room_type}
                    onChange={(e) => updateField('room_type', e.target.value)}
                  >
                    <option value="room">Room</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price/month ($) *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      required
                      min="10"
                      placeholder="75"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg outline-none"
                      value={formData.price_per_month}
                      onChange={(e) => updateField('price_per_month', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Province *</label>
                  <select
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
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
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  >
                    <option value="">Select district...</option>
                    {['Toul Kork','Chamkarmon','Daun Penh','Sen Sok','Mean Chey','Russey Keo','7 Makara','Por Sen Chey']
                      .map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* University & Floor Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nearest University <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
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
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                    value={formData.floor_level}
                    onChange={(e) => updateField('floor_level', e.target.value)}
                  />
                </div>
              </div>

              {/* Utilities */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Electricity (KHR/kWh)</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                    value={formData.electricity_rate}
                    onChange={(e) => updateField('electricity_rate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Water (KHR/m³)</label>
                  <input
                    type="number"
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                    value={formData.water_rate}
                    onChange={(e) => updateField('water_rate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Included Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Included Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'wifi', label: 'Free WiFi', icon: Wifi },
                { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
                { id: 'bathroom', label: 'Private Bathroom', icon: Bath },
                { id: 'parking', label: 'Moto Parking', icon: Bike },
                { id: 'kitchen', label: 'Small Kitchen', icon: ChefHat },
                { id: 'laundry', label: 'Laundry Nearby', icon: WashingMachine },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleArrayItem('amenities', id)}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 ${
                    formData.amenities.includes(id)
                      ? 'border-primary bg-green-50'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <Icon size={24} className={formData.amenities.includes(id) ? 'text-primary' : 'text-gray-600'} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-dark disabled:opacity-50 transition shadow-sm"
          >
            {uploading ? '⏳ Posting...' : 'Post Room'}
          </button>

          <p className="text-center text-sm text-gray-500">
            By posting, you agree to our Community Guidelines.
          </p>
        </form>
      </div>
    </div>
  );
}