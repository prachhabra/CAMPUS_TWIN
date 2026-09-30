import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { CreditCard, Printer, Shield, Sparkles, Building, Hash, Calendar } from 'lucide-react';
import { getInitials, formatDate } from '../utils/helpers';

const StudentDigitalId = () => {
  const { user } = useAuth();
  const idCardRef = useRef(null);

  const verificationUrl = `${window.location.origin}/verify/${user?._id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <CreditCard size={24} color="var(--primary)" /> Digital Campus ID
          </h2>
          <p className="page-subtitle">
            Institutional cryptographic student identity card with verifiable QR code
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print / Save ID Card
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px 0'
        }}
      >
        {/* Printable/Displayable ID Card Container */}
        <div
          ref={idCardRef}
          style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)',
            border: '2px solid var(--primary)',
            overflow: 'hidden',
            position: 'relative'
          }}
          className="digital-id-card"
        >
          {/* Top Institutional Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #243B6B 0%, #1A2A4D 100%)',
              color: '#FFFFFF',
              padding: '20px',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 4
              }}
            >
              <Shield size={20} color="#7C5CFC" />
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                CAMPUS TWIN UNIVERSITY
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              OFFICIAL DIGITAL STUDENT CREDENTIAL
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px 28px', textAlign: 'center' }}>
            {/* Profile Avatar / Photo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--primary-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {getInitials(user?.name)}
                </div>
              )}
            </div>

            {/* Student Name & Status */}
            <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)' }}>
              {user?.name}
            </h3>
            <div style={{ marginTop: 4, display: 'inline-block' }}>
              <StatusBadge status={user?.role} />
            </div>

            {/* ID Details Grid */}
            <div
              style={{
                marginTop: 20,
                textAlign: 'left',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Hash size={14} /> Roll Number:
                </span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {user?.rollNumber || 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={14} /> Department:
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text)', textAlign: 'right', maxWidth: 200 }}>
                  {user?.department}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} /> Year / Batch:
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {user?.year || '1st Year'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> Unique Campus ID:
                </span>
                <code style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                  {user?._id}
                </code>
              </div>
            </div>

            {/* QR Code Section */}
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div
                style={{
                  padding: 10,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <QRCodeSVG value={verificationUrl} size={110} level="H" />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 500 }}>
                Scan to cryptographically verify credentials
              </span>
            </div>
          </div>

          {/* Bottom Card Strip */}
          <div
            style={{
              backgroundColor: 'var(--primary)',
              height: 8,
              width: '100%'
            }}
          />
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .digital-id-card, .digital-id-card * {
            visibility: visible;
          }
          .digital-id-card {
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDigitalId;
