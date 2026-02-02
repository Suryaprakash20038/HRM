import { useState } from "react";
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
import RecruitmentSettings from "./pages/Recruitment/RecruitmentSettings"; // Added
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import AIAssistant from "./EmployeePanel/AIAssistant/AIAssistant"; // Added import
import ChatLayout from "./components/Chat/ChatLayout"; // Added import


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
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

  return <Navigate to="/home" replace />;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');

  if (loading) {
    return <div style={{ height: '100vh', width: '100%', background: '#000' }}></div>;
  }

  if (user) {
    return <RoleBasedRedirect />;
  }

  if (!hasSeenWalkthrough) {
    return <Navigate to="/walkthrough" replace />;
  }

  return <Navigate to="/login" replace />;
};

import EmployeeLayout from "./EmployeePanel/EmployeeLayout";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/walkthrough';
  const hideSidebarAndHeader = isAuthPage || location.pathname === '/home';
  // Only match employee panel routes (/employee/...), not /employees
  const isEmployeePage = location.pathname.startsWith('/employee/') || location.pathname === '/employee';
  const sidebarWidth = collapsed ? 80 : 250;

  if (isEmployeePage) {
    return (
      <ProtectedRoute>
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
          />

          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            sidebarWidth={sidebarWidth}
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

          <Route path="/" element={<RootRoute />} />


          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          } />

          <Route path="/employees/*" element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="/status" element={
            <ProtectedRoute>
              <Status />
            </ProtectedRoute>
          } />

          <Route path="/holidays" element={
            <ProtectedRoute>
              <AdminHolidayDashboard />
            </ProtectedRoute>
          } />

          <Route path="/announcement/*" element={
            <ProtectedRoute>
              <Announcement />
            </ProtectedRoute>
          } />

          <Route path="/shift" element={
            <ProtectedRoute>
              <Shift />
            </ProtectedRoute>
          } />

          <Route path="/leave/*" element={
            <ProtectedRoute>
              <Leave />
            </ProtectedRoute>
          } />

          <Route path="/media" element={
            <ProtectedRoute>
              <MediaDashboard />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute>
              <Payroll />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } />

          <Route path="/tasks/create" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks/edit/:id" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks/:id" element={
            <ProtectedRoute>
              <TaskDetails />
            </ProtectedRoute>
          } />

          <Route path="/tasks-old" element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />

          <Route path="/walkthrough" element={<WalkthroughPage />} />

          <Route path="/resignation/approvals" element={
            <ProtectedRoute>
              <ResignationApprovals />
            </ProtectedRoute>
          } />

          <Route path="/resignation/final-cleanup" element={
            <ProtectedRoute>
              <HRResignationCleanup />
            </ProtectedRoute>
          } />



          <Route path="/accounts" element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          } />

          <Route path="/tickets" element={
            <ProtectedRoute>
              <AdminTicketList />
            </ProtectedRoute>
          } />

          <Route path="/time-management" element={
            <ProtectedRoute>
              <TimeManagement />
            </ProtectedRoute>
          } />

          {/* Recruitment Routes */}
          <Route path="/recruitment" element={
            <ProtectedRoute>
              <RecruitmentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/candidate" element={
            <ProtectedRoute>
              <Candidate />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          } />
          <Route path="/job-descriptions" element={
            <ProtectedRoute>
              <JobDescriptions />
            </ProtectedRoute>
          } />
          <Route path="/recruitment-settings" element={
            <ProtectedRoute>
              <RecruitmentSettings />
            </ProtectedRoute>
          } />

          {/* Chat Route */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          } />

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
