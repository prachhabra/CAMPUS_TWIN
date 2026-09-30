import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FB',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          padding: '36px',
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              boxShadow: '0 4px 12px rgba(36, 59, 107, 0.25)'
            }}
          >
            <Shield size={28} />
          </div>
          <h2
            style={{
              fontSize: '1.625rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.02em'
            }}
          >
            CampusTwin
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 4 }}>
            The Comprehensive Digital Twin of Your College
          </p>
        </div>

        <Outlet />

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Sparkles size={12} color="var(--accent)" /> Real-Time Institutional Campus Twin Ecosystem
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
