import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/auth';
import { uploadImage } from '../services/cloudinary';
import { getAllUniversities } from '../services/rooms';
import { User, Edit3, Camera, Save } from 'lucide-react';

export default function EditProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [universities, setUniversities] = useState([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    hometown: '',
    current_location: '',
    university_id: '',
    university_name: '',
    gender: '',
    nationality: '',
    birthday: '',
    phone: '',
    avatar_url: '',
    cover_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getAllUniversities().then(setUniversities);
    
    if (profile) {
      // Split full_name into first and last
      const nameParts = profile.full_name?.split(' ') || ['', ''];
      setForm({
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        username: profile.username || '',
        bio: profile.bio || '',
        hometown: profile.hometown || '',
        current_location: profile.current_location || '',
        university_id: profile.university_id || '',
        university_name: profile.university_name || '',
        gender: profile.gender || profile.sex || '',
        nationality: profile.nationality || '',
        birthday: profile.birthday 
          ? (typeof profile.birthday === 'string' 
              ? profile.birthday 
              : new Date(profile.birthday.toDate ? profile.birthday.toDate() : profile.birthday).toISOString().split('T')[0])
          : '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        cover_url: profile.cover_url || '',
      });
    }
  }, [user, profile]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const result = await uploadImage(file);
      setForm({ ...form, avatar_url: result.url });
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await uploadImage(file);
      setForm({ ...form, cover_url: result.url });
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Find university name
    const selectedUni = universities.find(u => u.id === form.university_id);

    const updates = {
      full_name: `${form.first_name} ${form.last_name}`.trim(),
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      bio: form.bio,
      hometown: form.hometown,
      current_location: form.current_location,
      university_id: form.university_id,
      university_name: selectedUni?.name || form.university_name,
      gender: form.gender,
      sex: form.gender,
      nationality: form.nationality,
      birthday: form.birthday,
      phone: form.phone,
      avatar_url: form.avatar_url,
      cover_url: form.cover_url,
    };

    const result = await updateUserProfile(user.uid, updates);
    
    if (result.success) {
      await refreshProfile();
      alert('✅ Profile updated!');
      navigate('/profile');
    } else {
      alert('Error: ' + result.error);
    }
    setSaving(false);
  };

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Cover Photo */}
          <div 
            className="h-48 relative"
            style={{
              backgroundImage: form.cover_url 
                ? `url(${form.cover_url})` 
                : 'linear-gradient(to right, #0d6b3f, #10b981)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <label className="absolute top-4 right-4 bg-white/90 p-2 rounded-full cursor-pointer hover:bg-white">
              <Edit3 size={16} className="text-gray-700" />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Avatar */}
          <div className="px-8 relative">
            <div className="flex -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {form.avatar_url ? (
                    <img 
                      src={form.avatar_url} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                      {form.first_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-primary p-2 rounded-full cursor-pointer hover:bg-primary-dark">
                  <Camera size={14} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-8 pb-8 space-y-6">
            
            {/* Name & Username */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.first_name}
                    onChange={(e) => updateField('first_name', e.target.value)}
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.last_name}
                    onChange={(e) => updateField('last_name', e.target.value)}
                    placeholder="Johnston"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  placeholder="alex_johnston"
                />
              </div>
            </div>

            <hr />

            {/* About Me Section */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <User size={18} /> About Me
              </h3>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Bio <span className="text-primary text-xs">({form.bio.length}/150)</span>
                </label>
                <textarea
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={form.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Write a short bio about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Hometown</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.hometown}
                    onChange={(e) => updateField('hometown', e.target.value)}
                    placeholder="e.g. Phnom Penh"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Current Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.current_location}
                    onChange={(e) => updateField('current_location', e.target.value)}
                    placeholder="e.g. Siem Reap"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">University</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={form.university_id}
                  onChange={(e) => updateField('university_id', e.target.value)}
                >
                  <option value="">Select university...</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr />

            {/* Identity Section */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <User size={18} /> Identity
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nationality</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Cambodian">Cambodian</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="American">American</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Birthday</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={form.birthday}
                  onChange={(e) => updateField('birthday', e.target.value)}
                />
              </div>
            </div>

            <hr />

            {/* Contact Info */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                📇 Contact Info
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 outline-none"
                    value={profile?.email || ''}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="px-3 py-2 border border-r-0 rounded-l-lg bg-gray-50 text-sm">
                      KH +855
                    </span>
                    <input
                      type="tel"
                      className="flex-1 px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-primary outline-none"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 0123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full text-gray-600 py-2 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}