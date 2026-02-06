import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';



import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import VerifyOTP from "./pages/Login/VerifyOTP";
import ResetPassword from "./pages/Login/ResetPassword";
import Register from "./pages/Register/Register";
import Shift from "./pages/Shift/Shift";
import Dashboard from "./pages/Dashboard/Dashboard";
import EmployeesPage from "./pages/Employees/Employees";
import Attendance from "./pages/Attendance/Attendance";
import Status from "./pages/Status/Status";
import Leave from "./pages/Leave/Leave";
import AdminHolidayDashboard from "./pages/Holidays/AdminHolidayDashboard";
import Announcement from "./pages/Announcement/Announcement";
import Payroll from "./pages/Payroll/Payroll";
import MediaDashboard from "./pages/Media/MediaDashboard";
import Projects from "./pages/Projects/Projects";
import TaskDashboard from "./pages/Tasks/TaskDashboard";
import TaskList from "./pages/Tasks/TaskList";
import TaskForm from "./pages/Tasks/TaskForm";
import TaskDetails from "./pages/Tasks/TaskDetails";
import WalkthroughPage from "./components/Walkthrough";
import AppIntro from "./components/AppIntro";
import Reports from "./pages/Reports/Reports";
import ResignationApprovals from "./pages/Resignation/ResignationApprovals";
import HRResignationCleanup from "./pages/Resignation/HRResignationCleanup";
import Home from "./pages/Home/Home";


import Accounts from "./pages/Accounts/Accounts";
import AdminTicketList from "./pages/Tickets/AdminTicketList";
import TimeManagement from "./pages/TimeManagement/TimeManagement"; // Import TimeManagement
import RecruitmentDashboard from "./pages/Recruitment/Recruitment-Dashboard";
import Candidate from "./pages/Recruitment/Candidate";
import Interview from "./pages/Recruitment/Interview";
import JobDescriptions from "./pages/Recruitment/JobDescriptions";
import RecruitmentSettings from "./pages/Recruitment/RecruitmentSettings";
import PublicJobApplication from "./pages/Recruitment/PublicJobApplication"; // Added
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import AIAssistant from "./EmployeePanel/AIAssistant/AIAssistant"; // Added import
import ChatLayout from "./components/Chat/ChatLayout"; // Added import


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./App.css";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toLowerCase();

    // Normalize roles comparisons
    const isAllowed = allowedRoles.some(role => {
      const r = role.toLowerCase();
      const u = userRole.toLowerCase();
      if (r === 'hr') return u.includes('hr'); // Allow 'HR Executive' etc for 'hr' requirement
      return r === u;
    });

    if (!isAllowed) {
      // Redirect based on their actual role
      if (['employee', 'teamlead', 'manager'].includes(userRole)) {
        return <Navigate to="/employee/dashboard" replace />;
      } else if (userRole === 'hr') {
        return <Navigate to="/recruitment" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || '';

  if (user && ['employee', 'teamlead', 'manager'].includes(role)) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  // Always show walkthrough on entry to root
  // The Walkthrough component will handle navigation to /home after video

  if (loading) {
    return <div style={{ height: '100vh', width: '100%', background: '#000' }}></div>;
  }

  return <Navigate to="/walkthrough" replace />;
};

import EmployeeLayout from "./EmployeePanel/EmployeeLayout";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/walkthrough' || location.pathname.startsWith('/apply');
  const hideSidebarAndHeader = isAuthPage || location.pathname === '/home';
  // Only match employee panel routes (/employee/...), not /employees
  const isEmployeePage = location.pathname.startsWith('/employee/') || location.pathname === '/employee';

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : (collapsed ? 80 : 250);

  if (isEmployeePage) {
    return (
      <ProtectedRoute allowedRoles={['employee', 'teamlead', 'manager', 'admin', 'hr', 'md']}>
        <EmployeeLayout />
      </ProtectedRoute>
    );
  }

  return (
    <div className={`app-root ${darkMode ? "theme-dark" : "theme-light"}`}>
      {!hideSidebarAndHeader && (
        <>
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobile={isMobile}
          />

          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            sidebarWidth={sidebarWidth}
            isMobile={isMobile}
          />
        </>
      )}

      <main
        style={{
          marginLeft: !hideSidebarAndHeader ? sidebarWidth : 0,
          paddingTop: !hideSidebarAndHeader ? 80 : 0,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh"
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/apply" element={<PublicJobApplication />} />
          <Route path="/apply/:jobId" element={<PublicJobApplication />} />

          <Route path="/" element={<RootRoute />} />


          <Route path="/home" element={<Home />} />

          {/* SHARED ADMIN & HR ROUTES */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/ai-assistant" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <AIAssistant />
            </ProtectedRoute>
          } />

          <Route path="/employees/*" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <EmployeesPage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="/status" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Status />
            </ProtectedRoute>
          } />

          <Route path="/holidays" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <AdminHolidayDashboard />
            </ProtectedRoute>
          } />

          <Route path="/announcement/*" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Announcement />
            </ProtectedRoute>
          } />

          <Route path="/shift" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Shift />
            </ProtectedRoute>
          } />

          <Route path="/leave/*" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Leave />
            </ProtectedRoute>
          } />

          {/* Job Posting / Media */}
          <Route path="/media" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <MediaDashboard />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Payroll />
            </ProtectedRoute>
          } />

          <Route path="/resignation/approvals" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <ResignationApprovals />
            </ProtectedRoute>
          } />

          <Route path="/resignation/final-cleanup" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <HRResignationCleanup />
            </ProtectedRoute>
          } />

          <Route path="/tickets" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <AdminTicketList />
            </ProtectedRoute>
          } />

          <Route path="/time-management" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <TimeManagement />
            </ProtectedRoute>
          } />

          {/* Recruitment Routes */}
          <Route path="/recruitment" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <RecruitmentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/candidate" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Candidate />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <Interview />
            </ProtectedRoute>
          } />
          <Route path="/job-descriptions" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <JobDescriptions />
            </ProtectedRoute>
          } />
          <Route path="/recruitment-settings" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <RecruitmentSettings />
            </ProtectedRoute>
          } />

          {/* Chat Route */}
          <Route path="/chat" element={
            <ProtectedRoute allowedRoles={['admin', 'hr', 'md']}>
              <ChatLayout />
            </ProtectedRoute>
          } />


          {/* ADMIN ONLY ROUTES (Hidden from HR) */}

          <Route path="/projects" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <Projects />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <TaskList />
            </ProtectedRoute>
          } />

          <Route path="/tasks/create" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks/edit/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <TaskDetails />
            </ProtectedRoute>
          } />

          <Route path="/tasks-old" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <TaskDashboard />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />

          <Route path="/accounts" element={
            <ProtectedRoute allowedRoles={['admin', 'md']}>
              <Accounts />
            </ProtectedRoute>
          } />

          <Route path="/walkthrough" element={<WalkthroughPage />} />

        </Routes>
      </main>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppLayout />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
