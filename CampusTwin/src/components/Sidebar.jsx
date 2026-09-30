import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  CalendarCheck,
  CreditCard,
  MapPin,
  Calendar,
  Users,
  ShoppingBag,
  HelpCircle,
  AlertOctagon,
  BookOpen,
  Sparkles,
  MessageSquareQuote,
  Briefcase,
  Award,
  MessageCircle,
  GraduationCap,
  Shield,
  Layers,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Academic Analytics', path: '/student/analytics', icon: BarChart2 },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Digital ID', path: '/student/digital-id', icon: CreditCard },
    { name: 'Campus Map', path: '/student/campus-map', icon: MapPin },
    { name: 'Events', path: '/student/events', icon: Calendar },
    { name: 'Clubs', path: '/student/clubs', icon: Users },
    { name: 'Marketplace', path: '/student/marketplace', icon: ShoppingBag },
    { name: 'Lost & Found', path: '/student/lost-found', icon: HelpCircle },
    { name: 'Complaints', path: '/student/complaints', icon: AlertOctagon },
    { name: 'Study Groups', path: '/student/study-groups', icon: BookOpen },
    { name: 'Skill Exchange', path: '/student/skills', icon: Sparkles },
    { name: 'Confessions', path: '/student/confession', icon: MessageSquareQuote },
    { name: 'Placements', path: '/student/placement', icon: Briefcase },
    { name: 'Achievements', path: '/student/achievements', icon: Award },
    { name: 'Campus Chat', path: '/student/chat', icon: MessageCircle }
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'My Classes', path: '/teacher/classes', icon: Layers },
    { name: 'Students', path: '/teacher/students', icon: GraduationCap },
    { name: 'Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Analytics', path: '/teacher/analytics', icon: BarChart2 },
    { name: 'Events', path: '/teacher/events', icon: Calendar }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Teachers', path: '/admin/teachers', icon: Briefcase },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Clubs', path: '/admin/clubs', icon: Users },
    { name: 'Marketplace', path: '/admin/marketplace', icon: ShoppingBag },
    { name: 'Lost & Found', path: '/admin/lost-found', icon: HelpCircle },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertOctagon },
    { name: 'Study Groups', path: '/admin/study-groups', icon: BookOpen },
    { name: 'Skills', path: '/admin/skills', icon: Sparkles },
    { name: 'Confessions', path: '/admin/confessions', icon: MessageSquareQuote },
    { name: 'Placements', path: '/admin/placements', icon: Briefcase },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Campus Map', path: '/admin/campus-map', icon: MapPin },
    { name: 'Settings', path: '/admin/profile', icon: Settings }
  ];

  const links =
    role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90,
            display: 'block'
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 95,
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          flexShrink: 0
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}
              >
                CampusTwin
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>
                Digital Twin OS
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              color: 'var(--muted)',
              display: 'none',
              padding: 4
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.06em'
            }}
          >
            {role.toUpperCase()} PORTAL
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/student' || link.path === '/teacher' || link.path === '/admin'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User points banner for student */}
        {role === 'student' && (
          <div
            style={{
              padding: '16px 20px',
              margin: '12px',
              backgroundColor: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 92, 252, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--accent)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)' }}>
                {user?.points || 0} Points
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
              Active Campus Citizen
            </div>
          </div>
        )}
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .mobile-backdrop {
            display: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
