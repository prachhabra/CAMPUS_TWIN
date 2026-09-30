import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import { DEPARTMENTS, YEARS } from '../utils/constants';
import { UserPlus, User, Mail, Lock, Building, Hash, Calendar, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: DEPARTMENTS[0],
    rollNumber: '',
    employeeId: '',
    year: YEARS[0],
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'student' && !formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Student roll number / registration number is required';
    }

    if (formData.role === 'teacher' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Faculty / Employee ID is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      showSuccess(`Account registered successfully! Welcome to CampusTwin, ${res.user.name}.`);

      if (res.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please check the entered data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
          Create an Account
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 4 }}>
          Join your institutional digital campus platform
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Role Selection Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--background)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: 20,
            gap: 4
          }}
        >
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, role: 'student' }))}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: formData.role === 'student' ? 'var(--surface)' : 'transparent',
              color: formData.role === 'student' ? 'var(--primary)' : 'var(--muted)',
              boxShadow: formData.role === 'student' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => setFormData((p) => ({ ...p, role: 'teacher' }))}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: formData.role === 'teacher' ? 'var(--surface)' : 'transparent',
              color: formData.role === 'teacher' ? 'var(--primary)' : 'var(--muted)',
              boxShadow: formData.role === 'teacher' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Faculty Account
          </button>
        </div>

        <FormField label="Full Name" error={errors.name} required>
          <div style={{ position: 'relative' }}>
            <User
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}
            />
            <input
              type="text"
              name="name"
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </FormField>

        <FormField label="Institutional Email" error={errors.email} required>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}
            />
            <input
              type="email"
              name="email"
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="e.g. student@college.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Department" required>
            <select
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            >
              {DEPARTMENTS.filter((d) => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </FormField>

          {formData.role === 'student' ? (
            <FormField label="Academic Year" required>
              <select
                name="year"
                className="form-select"
                value={formData.year}
                onChange={handleChange}
                disabled={loading}
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
            <FormField label="Faculty Employee ID" error={errors.employeeId} required>
              <input
                type="text"
                name="employeeId"
                className="form-input"
                placeholder="e.g. FAC-2024-08"
                value={formData.employeeId}
                onChange={handleChange}
                disabled={loading}
              />
            </FormField>
          )}
        </div>

        {formData.role === 'student' && (
          <FormField label="Roll / Registration Number" error={errors.rollNumber} required>
            <div style={{ position: 'relative' }}>
              <Hash
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted)'
                }}
              />
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="e.g. 23CS0104"
                value={formData.rollNumber}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </FormField>
        )}

        <FormField label="Contact Phone (Optional)">
          <div style={{ position: 'relative' }}>
            <Phone
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}
            />
            <input
              type="tel"
              name="phone"
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Password" error={errors.password} required>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>

          <FormField label="Confirm Password" error={errors.confirmPassword} required>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </FormField>
        </div>

        <button
          type="submit"
          className="btn btn-accent"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading}
        >
          <UserPlus size={18} />
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>

      <div
        style={{
          marginTop: 20,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        Already have an institutional account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
