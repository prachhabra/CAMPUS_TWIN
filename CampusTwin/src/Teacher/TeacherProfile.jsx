import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { User, Briefcase, Mail, Phone, Building, Save } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';
import { DEPARTMENTS } from '../utils/constants';

const TeacherProfile = () => {
  const { user, updateUserState } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || 'General',
    employeeId: user?.employeeId || '',
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
        showSuccess('Faculty profile updated successfully!');
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
            <Briefcase size={24} color="var(--primary)" /> Faculty Profile & Credentials
          </h2>
          <p className="page-subtitle">
            Manage your faculty information, department affiliation, and contact channels
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
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
            <StatusBadge status="teacher" />
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
            <div><strong>Employee ID:</strong> {user?.employeeId || 'Faculty Staff'}</div>
            <div><strong>Member Since:</strong> {formatDate(user?.createdAt)}</div>
          </div>
        </Card>

        <Card title="Update Faculty Information">
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

              <FormField label="Faculty Employee ID" required>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Department">
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

            <FormField label="Academic Bio & Research Areas">
              <textarea
                name="bio"
                className="form-textarea"
                rows={3}
                placeholder="Share your research interests, teaching background, and office hours..."
                value={formData.bio}
                onChange={handleChange}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={18} />
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfile;
