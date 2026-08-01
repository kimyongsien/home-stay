import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../services/auth';
import { getAllUniversities } from '../services/rooms';
import { User, Mail, Lock, Phone, GraduationCap, Home } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    user_type: 'student',
    userType: 'student',
    university_id: '',
    school_year: 1,
    sex: 'male',
    birthday: ''
  });

  useEffect(() => {
    getAllUniversities().then(setUniversities);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedUni = universities.find(u => u.id === formData.university_id);
    const enrichedData = {
      ...formData,
      university_name: selectedUni?.name || '',
      university_code: selectedUni?.short_code || '',
      gender: formData.sex || 'male',
    };

    const result = await signUp(formData.email, formData.password, enrichedData);
    
    if (result.success) {
      alert('🎉 Account created successfully!');
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-green-50 to-white">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join HomeStay community</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* User Type Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => updateField('user_type', 'student')}
            className={`p-4 rounded-lg border-2 text-center ${
              formData.user_type === 'student' 
                ? 'border-primary bg-green-50 text-primary' 
                : 'border-gray-200'
            }`}
          >
            <GraduationCap className="mx-auto mb-2" size={32} />
            <div className="font-semibold">I'm a Student</div>
          </button>
          <button
            type="button"
            onClick={() => updateField('user_type', 'landlord')}
            className={`p-4 rounded-lg border-2 text-center ${
              formData.user_type === 'landlord' 
                ? 'border-primary bg-green-50 text-primary' 
                : 'border-gray-200'
            }`}
          >
            <Home className="mx-auto mb-2" size={32} />
            <div className="font-semibold">I'm a Landlord</div>
          </button>
        </div>
        {/* ✅ NEW: Contextual search experience */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Housing Profile
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('userType', 'student')}
              className={`p-3 rounded-lg border-2 text-sm font-medium ${
                formData.userType === 'student'
                  ? 'border-primary bg-green-50 text-primary'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => updateField('userType', 'non-student')}
              className={`p-3 rounded-lg border-2 text-sm font-medium ${
                formData.userType === 'non-student'
                  ? 'border-primary bg-green-50 text-primary'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              💼 Non-Student (Professional)
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Controls which search experience you see on the homepage.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="+855 12 345 678"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          {/* University */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              University {formData.user_type === 'student' ? '*' : '(Optional)'}
            </label>
            <select
              required={formData.user_type === 'student'}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.university_id}
              onChange={(e) => updateField('university_id', e.target.value)}
            >
              <option value="">Select university...</option>
              {universities.map(uni => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
          </div>

          {/* Sex, Birthday, Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.user_type === 'student' && (
              <div>
                <label className="text-sm font-medium text-gray-700">Year</label>
                <select
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                  value={formData.school_year}
                  onChange={(e) => updateField('school_year', parseInt(e.target.value))}
                >
                  {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Sex</label>
              <select
                className="w-full mt-1 px-4 py-2 border rounded-lg outline-none"
                value={formData.sex}
                onChange={(e) => updateField('sex', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Birthday</label>
              <input
                type="date"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.birthday}
                onChange={(e) => updateField('birthday', e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}