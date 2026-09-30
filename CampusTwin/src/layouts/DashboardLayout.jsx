import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const pageTitleMap = {
  '/student': 'Student Dashboard',
  '/student/analytics': 'Academic Analytics',
  '/student/attendance': 'Attendance Hub',
  '/student/digital-id': 'Digital Student ID',
  '/student/campus-map': 'Interactive Campus Twin Map',
  '/student/events': 'Campus Events',
  '/student/clubs': 'Student Clubs & Chapters',
  '/student/marketplace': 'Campus Marketplace',
  '/student/lost-found': 'Lost & Found Center',
  '/student/complaints': 'Grievance & Support Desk',
  '/student/study-groups': 'Peer Study Circles',
  '/student/skills': 'Skill Exchange Platform',
  '/student/confession': 'Anonymous Campus Wall',
  '/student/placement': 'Placement & Career Tracker',
  '/student/achievements': 'Badges & Milestone Rewards',
  '/student/chat': 'Real-Time Campus Messenger',
  '/student/profile': 'Student Profile',

  '/teacher': 'Faculty Dashboard',
  '/teacher/classes': 'My Classes & Courses',
  '/teacher/students': 'Student Directory',
  '/teacher/attendance': 'Attendance Sessions & Tracker',
  '/teacher/analytics': 'Academic & Attendance Analytics',
  '/teacher/events': 'Event Management',
  '/teacher/profile': 'Faculty Profile',

  '/admin': 'Executive Administration',
  '/admin/students': 'Student Records Administration',
  '/admin/teachers': 'Faculty Roster Administration',
  '/admin/events': 'Campus Events Moderation',
  '/admin/clubs': 'Clubs & Organizations',
  '/admin/marketplace': 'Marketplace Moderation',
  '/admin/lost-found': 'Lost & Found Administration',
  '/admin/complaints': 'Campus Grievance Management',
  '/admin/study-groups': 'Study Group Governance',
  '/admin/skills': 'Skill Registry',
  '/admin/confessions': 'Confession Moderation Queue',
  '/admin/placements': 'Campus Placement Analytics & Records',
  '/admin/attendance': 'System-Wide Attendance Audit',
  '/admin/analytics': 'Campus Intelligence & System Telemetry',
  '/admin/campus-map': 'Campus Map & Geo-Locations Management',
  '/admin/profile': 'System Administrator Profile'
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitleMap[location.pathname] || 'CampusTwin Digital Twin';

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={title}
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
