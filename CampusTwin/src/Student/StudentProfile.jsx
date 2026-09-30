import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { User, Mail, Phone, Building, Hash, Calendar, Save, Shield } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';
import { DEPARTMENTS, YEARS } from '../utils/constants';

const StudentProfile = () => {
  const { user, updateUserState } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || 'General',
    year: user?.year || '1st Year',
    rollNumber: user?.rollNumber || '',
    profileImage: user?.profileImage || ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.updateProfile(formData);
      if (res.success) {
        showSuccess('Profile updated successfully!');
        updateUserState(res.user);
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <User size={24} color="var(--primary)" /> Student Profile
          </h2>
          <p className="page-subtitle">
            Manage your personal contact details, bio, and academic profile settings
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Left Profile Card */}
        <Card style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--primary-light)'
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.25rem',
                  fontWeight: 800
                }}
              >
                {getInitials(user?.name)}
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
            {user?.name}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 2 }}>
            {user?.email}
          </p>
          <div style={{ marginTop: 8 }}>
            <StatusBadge status={user?.role} />
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)'
            }}
          >
            <div><strong>Department:</strong> {user?.department}</div>
            <div><strong>Roll Number:</strong> {user?.rollNumber || 'Not Set'}</div>
            <div><strong>Year:</strong> {user?.year || '1st Year'}</div>
            <div><strong>Campus Points:</strong> {user?.points || 0}</div>
            <div><strong>Member Since:</strong> {formatDate(user?.createdAt)}</div>
          </div>
        </Card>

        {/* Right Edit Form */}
        <Card title="Edit Personal Information">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Full Name" required>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <FormField label="Contact Phone">
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Academic Department">
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.filter((d) => d !== 'All').map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Academic Year">
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  {YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Student Roll Number">
                <input
                  type="text"
                  name="rollNumber"
                  className="form-input"
                  value={formData.rollNumber}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Profile Avatar URL (Optional)">
                <input
                  type="url"
                  name="profileImage"
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.profileImage}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <FormField label="Personal Bio & Interests">
              <textarea
                name="bio"
                className="form-textarea"
                rows={3}
                placeholder="Share your academic interests, projects, or background..."
                value={formData.bio}
                onChange={handleChange}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={18} />
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
