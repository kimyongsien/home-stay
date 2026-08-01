import { useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { profile } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || 'Admin User',
    email: profile?.email || 'admin@homestay.com.kh'
  });

  // Toggle switches state
  const [config, setConfig] = useState({
    maintenance_mode: false,
    require_id_booking: true,
    auto_approve_landlords: true,
    email_new_verifications: true,
    email_user_reports: true,
    weekly_digest: false
  });

  const toggleSetting = (key) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const handleSaveProfile = () => {
    alert('Profile settings saved! (Demo)');
  };

  return (
    <div className="min-h-screen">
      <AdminHeader searchPlaceholder="Search..." />

      <div className="p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Manage your admin account and global system preferences.</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-1">Profile Information</h2>
          <p className="text-sm text-gray-600 mb-6">Update your personal details and public profile.</p>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-xl">
              {profileData.full_name?.charAt(0)}
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Upload New Avatar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                value={profileData.full_name}
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg outline-none"
                value={profileData.email}
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Platform Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold mb-1">Platform Configuration</h2>
          <p className="text-sm text-gray-600 mb-6">Core rules and operational settings for the Home Stay platform.</p>

          <div className="divide-y divide-gray-100">
            <SettingItem
              title="Maintenance Mode"
              description="Temporarily disable access to the main platform for users."
              enabled={config.maintenance_mode}
              onToggle={() => toggleSetting('maintenance_mode')}
            />
            <SettingItem
              title="Require ID for Booking"
              description="Force students to be verified before they can contact landlords."
              enabled={config.require_id_booking}
              onToggle={() => toggleSetting('require_id_booking')}
            />
            <SettingItem
              title="Auto-Approve Landlords"
              description="Allow landlord accounts to go live immediately upon registration."
              enabled={config.auto_approve_landlords}
              onToggle={() => toggleSetting('auto_approve_landlords')}
            />
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-1">Alerts & Notifications</h2>
          <p className="text-sm text-gray-600 mb-6">Control which administrative events trigger email alerts.</p>

          <div className="divide-y divide-gray-100">
            <SettingItem
              title="New ID Verifications"
              description="Send an email when a new student ID is submitted."
              enabled={config.email_new_verifications}
              onToggle={() => toggleSetting('email_new_verifications')}
            />
            <SettingItem
              title="User Reports"
              description="Send an email when a user flags a listing or account."
              enabled={config.email_user_reports}
              onToggle={() => toggleSetting('email_user_reports')}
            />
            <SettingItem
              title="Weekly Digest"
              description="Receive a weekly summary of platform growth and analytics."
              enabled={config.weekly_digest}
              onToggle={() => toggleSetting('weekly_digest')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component
function SettingItem({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-0.5">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-gray-900' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}