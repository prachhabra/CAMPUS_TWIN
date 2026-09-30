import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  User,
  LogOut,
  Menu,
  Shield,
  GraduationCap,
  Briefcase,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { getInitials } from '../utils/helpers';
import StatusBadge from './StatusBadge';

const Navbar = ({ onToggleSidebar, pageTitle = 'CampusTwin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      if (user) {
        const res = await notificationService.getNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      }
    } catch (err) {
      // Silently handle
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // Ignored
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // Ignored
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'admin') return <Shield size={14} color="var(--primary)" />;
    if (user?.role === 'teacher') return <Briefcase size={14} color="var(--secondary)" />;
    return <GraduationCap size={14} color="var(--accent)" />;
  };

  const profilePath =
    user?.role === 'admin'
      ? '/admin/profile'
      : user?.role === 'teacher'
      ? '/teacher/profile'
      : '/student/profile';

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            color: 'var(--text)'
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: showNotifications ? 'var(--primary-light)' : 'transparent',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                width: 340,
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                zIndex: 100
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      color: 'var(--muted)'
                    }}
                  >
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.read && handleMarkAsRead(n._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f3f7',
                        backgroundColor: n.read ? '#fff' : '#f8faff',
                        cursor: n.read ? 'default' : 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: n.read ? 600 : 700,
                          fontSize: '0.8125rem',
                          color: 'var(--text)'
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--muted)',
                          marginTop: 3,
                          lineHeight: 1.4
                        }}
                      >
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-alt)'
            }}
            aria-label="User account menu"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}
              >
                {getInitials(user?.name)}
              </div>
            )}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  maxWidth: 130,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.name || 'User'}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {getRoleIcon()}
                <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </span>
            </div>
            <ChevronDown size={14} color="var(--muted)" />
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 50,
                width: 220,
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                padding: '8px',
                zIndex: 100
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={user?.role} />
                </div>
              </div>

              <Link
                to={profilePath}
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text)',
                  fontWeight: 500,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--background)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={16} /> My Profile
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                  fontWeight: 600,
                  textAlign: 'left',
                  marginTop: 4,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
