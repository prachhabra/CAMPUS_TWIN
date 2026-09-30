import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';

const VerifyDigitalId = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifiedData, setVerifiedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const res = await authService.verifyDigitalId(id);
        if (res.success) {
          setVerifiedData(res);
        }
      } catch (err) {
        setError(err.message || 'Digital ID credential could not be verified');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVerification();
    }
  }, [id]);

  if (loading) {
    return <Loader message="Verifying Digital ID cryptographic token..." fullPage />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        {/* Verification Banner */}
        <div
          style={{
            backgroundColor: error ? 'var(--danger)' : 'var(--success)',
            color: '#fff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          {error ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>
              {error ? 'Verification Failed' : 'Official Institutional Credential Verified'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              CampusTwin Cryptographic ID Verification System
            </div>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.9375rem', marginBottom: 20 }}>
                {error}
              </p>
              <Link to="/login" className="btn btn-secondary">
                <ArrowLeft size={16} /> Return to Portal
              </Link>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border)'
                }}
              >
                {verifiedData.user.profileImage ? (
                  <img
                    src={verifiedData.user.profileImage}
                    alt={verifiedData.user.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800
                    }}
                  >
                    {getInitials(verifiedData.user.name)}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
                    {verifiedData.user.name}
                  </h3>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={verifiedData.user.role} />
                  </div>
                </div>
              </div>

              {/* Identity Detail Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  margin: '20px 0'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                    DEPARTMENT
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                    {verifiedData.user.department}
                  </div>
                </div>

                {verifiedData.user.rollNumber && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                      ROLL NUMBER
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {verifiedData.user.rollNumber}
                    </div>
                  </div>
                )}

                {verifiedData.user.employeeId && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                      FACULTY ID
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {verifiedData.user.employeeId}
                    </div>
                  </div>
                )}

                {verifiedData.user.year && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                      ACADEMIC YEAR
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                      {verifiedData.user.year}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>
                    MEMBER SINCE
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                    {formatDate(verifiedData.user.createdAt)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--background)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <ShieldCheck size={16} color="var(--success)" />
                Verified at: {new Date(verifiedData.verificationTimestamp).toLocaleString()}
              </div>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  Go to CampusTwin Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyDigitalId;
