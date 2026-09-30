import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  KeyRound, 
  Server, 
  Cpu, 
  Database 
} from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';
import { DEPARTMENTS } from '../utils/constants';

const AdminProfile = () => {
  const { user, updateUserState } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || 'Administration',
    profileImage: user?.profileImage || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingProfile(true);
      const res = await authService.updateProfile(formData);
      if (res.success) {
        showSuccess('Administrator profile updated successfully');
        updateUserState(res.user);
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New password and confirmation do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        showSuccess('Administrator security credentials updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          System Administrator Profile & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Configure institutional identity, administrative credentials, and system privileges.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Admin Card & Profile Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Identity Snapshot */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div 
                style={{ 
                  width: '72px', 
                  height: '72px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: '#FFFFFF',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(36, 59, 107, 0.2)'
                }}
              >
                {getInitials(user?.name || 'Administrator')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {user?.name}
                  </h2>
                  <StatusBadge status="Admin" />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {user?.email}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Full Root Institutional Authority
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card title="Update Institutional Information" subtitle="Changes will be reflected across administrative audit trails">
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <FormField label="Full Name" required>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </FormField>

              <FormField label="Contact Phone">
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  placeholder="+91 XXXXX XXXXX"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </FormField>

              <FormField label="Administrative Department">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                >
                  <option value="Administration">Administration & Governance</option>
                  <option value="IT & Infrastructure">IT & Digital Systems</option>
                  <option value="Academic Affairs">Academic Affairs</option>
                  <option value="Student Welfare">Student Welfare</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Administrative Bio">
                <textarea 
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleProfileChange}
                  placeholder="Responsibilities, office hours, or contact procedures..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', resize: 'vertical' }}
                />
              </FormField>

              <button
                type="submit"
                disabled={submittingProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                <Save size={18} />
                {submittingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </Card>
        </div>

        {/* Right Column: Security & System Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Password & Security */}
          <Card title="Security & Authentication" subtitle="Update your root administrative credentials">
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <FormField label="Current Password" required>
                <input 
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </FormField>

              <FormField label="New Password" required>
                <input 
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 6 characters"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </FormField>

              <FormField label="Confirm New Password" required>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                  required
                />
              </FormField>

              <button
                type="submit"
                disabled={submittingPassword}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                <KeyRound size={18} />
                {submittingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </Card>

          {/* System Diagnostics Card */}
          <Card title="Institutional Engine Status" subtitle="CampusTwin deployment runtime diagnostics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--surface-subtle)', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Server size={16} /> Backend Architecture
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Node.js / Express REST Engine</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--surface-subtle)', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Database size={16} /> Database Engine
                </span>
                <span style={{ fontWeight: 600, color: '#10B981' }}>MongoDB 27017 (Connected)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--surface-subtle)', borderRadius: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Cpu size={16} /> Real-Time Telemetry
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Socket.io WebSockets (Live)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--surface-subtle)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Joined Since</span>
                <span style={{ fontWeight: 600 }}>{user?.createdAt ? formatDate(user.createdAt) : 'Initial Deploy'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
