import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const res = await login(formData);
      showSuccess(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
          Sign In to Your Account
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 4 }}>
          Enter your institutional credentials to access your portal
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField label="Email Address" error={errors.email} required>
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
              placeholder="e.g. yourname@college.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password} required>
          <div style={{ position: 'relative' }}>
            <Lock
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
              type="password"
              name="password"
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
        </FormField>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading}
        >
          <LogIn size={18} />
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        Don't have an account yet?{' '}
        <Link
          to="/register"
          style={{ color: 'var(--accent)', fontWeight: 600 }}
        >
          Create Student / Faculty Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
