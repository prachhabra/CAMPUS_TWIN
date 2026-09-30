import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();

  const homePath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'teacher'
      ? '/teacher'
      : user?.role === 'student'
      ? '/student'
      : '/login';

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px'
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <Compass size={40} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '12px 0 8px' }}>
        Campus Location Not Found
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', maxWidth: 440, marginBottom: 24 }}>
        The digital campus page or resource you are looking for does not exist or has been moved.
      </p>
      <Link to={homePath} className="btn btn-primary">
        <Home size={18} /> Return to Portal Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
