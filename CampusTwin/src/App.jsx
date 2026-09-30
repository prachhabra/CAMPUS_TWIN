import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Public Views
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyDigitalId from './pages/VerifyDigitalId';
import NotFound from './pages/NotFound';

// Student Views
import StudentDashboard from './Student/StudentDashboard';
import StudentAnalytics from './Student/StudentAnalytics';
import StudentAttendance from './Student/StudentAttendance';
import StudentDigitalId from './Student/StudentDigitalId';
import StudentCampusMap from './Student/StudentCampusMap';
import StudentEvents from './Student/StudentEvents';
import StudentClubs from './Student/StudentClubs';
import StudentMarketplace from './Student/StudentMarketplace';
import StudentLostFound from './Student/StudentLostFound';
import StudentComplaints from './Student/StudentComplaints';
import StudentStudyGroups from './Student/StudentStudyGroups';
import StudentSkills from './Student/StudentSkills';
import StudentConfession from './Student/StudentConfession';
import StudentPlacement from './Student/StudentPlacement';
import StudentAchievements from './Student/StudentAchievements';
import StudentChat from './Student/StudentChat';
import StudentProfile from './Student/StudentProfile';

// Faculty / Teacher Views
import TeacherDashboard from './Teacher/TeacherDashboard';
import TeacherClasses from './Teacher/TeacherClasses';
import TeacherStudents from './Teacher/TeacherStudents';
import TeacherAttendance from './Teacher/TeacherAttendance';
import TeacherAnalytics from './Teacher/TeacherAnalytics';
import TeacherEvents from './Teacher/TeacherEvents';
import TeacherProfile from './Teacher/TeacherProfile';

// Administration Views
import AdminDashboard from './Admin/AdminDashboard';
import AdminStudents from './Admin/AdminStudents';
import AdminTeachers from './Admin/AdminTeachers';
import AdminAttendance from './Admin/AdminAttendance';
import AdminEvents from './Admin/AdminEvents';
import AdminClubs from './Admin/AdminClubs';
import AdminMarketplace from './Admin/AdminMarketplace';
import AdminLostFound from './Admin/AdminLostFound';
import AdminComplaints from './Admin/AdminComplaints';
import AdminStudyGroups from './Admin/AdminStudyGroups';
import AdminSkills from './Admin/AdminSkills';
import AdminConfessions from './Admin/AdminConfessions';
import AdminPlacements from './Admin/AdminPlacements';
import AdminCampusMap from './Admin/AdminCampusMap';
import AdminAnalytics from './Admin/AdminAnalytics';
import AdminProfile from './Admin/AdminProfile';

// Root redirect handler
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Public Digital ID Verification */}
      <Route path="/verify/:id" element={<VerifyDigitalId />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/analytics" element={<StudentAnalytics />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/digital-id" element={<StudentDigitalId />} />
          <Route path="/student/campus-map" element={<StudentCampusMap />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/clubs" element={<StudentClubs />} />
          <Route path="/student/marketplace" element={<StudentMarketplace />} />
          <Route path="/student/lost-found" element={<StudentLostFound />} />
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/study-groups" element={<StudentStudyGroups />} />
          <Route path="/student/skills" element={<StudentSkills />} />
          <Route path="/student/confession" element={<StudentConfession />} />
          <Route path="/student/placement" element={<StudentPlacement />} />
          <Route path="/student/achievements" element={<StudentAchievements />} />
          <Route path="/student/chat" element={<StudentChat />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Teacher / Faculty Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/events" element={<TeacherEvents />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/teachers" element={<AdminTeachers />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/clubs" element={<AdminClubs />} />
          <Route path="/admin/marketplace" element={<AdminMarketplace />} />
          <Route path="/admin/lost-found" element={<AdminLostFound />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/study-groups" element={<AdminStudyGroups />} />
          <Route path="/admin/skills" element={<AdminSkills />} />
          <Route path="/admin/confessions" element={<AdminConfessions />} />
          <Route path="/admin/placements" element={<AdminPlacements />} />
          <Route path="/admin/campus-map" element={<AdminCampusMap />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
