import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import AppIntro from "../components/AppIntro";
import Header from "../components/Header/Header";
import Sidebar from "./Sidebar";
import EmployeeDashboard from "./EmployeeDashboard";
import EmployeeProfile from "./EmployeeProfile";
import MediaDashboard from "../pages/Media/MediaDashboard";
import EmployeeDailyReport from "./EmployeeDailyReport";
import EmployeeLeave from "./EmployeeLeave";
import EmployeeHolidays from "./EmployeeHolidays";
import EmployeeProjects from "./EmployeeProjects";
import EmployeePayslips from "./EmployeePayslips";
import EmployeeTasks from "./EmployeeTasks";
import EmployeeDocuments from "./EmployeeDocuments";

import EmployeeAttendance from "./EmployeeAttendance";
import TimeTracking from "./pages/TimeTracking/TimeTracking";
import EmployeeAnnouncements from "./EmployeeAnnouncements";
import SubmitResignation from "./SubmitResignation";
import EmployeeApprovals from "./EmployeeApprovals";
import TicketList from "./Ticket/TicketList";
import RaiseTicket from "./Ticket/RaiseTicket";
import TicketDetail from "./Ticket/TicketDetail";
import ChatLayout from "../components/Chat/ChatLayout";
import AIAssistant from "./AIAssistant/AIAssistant";
import MeetingList from "./Meeting/MeetingList";
import VideoMeeting from "../components/Meeting/VideoMeeting";


const EmployeeLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const location = useLocation();
    const sidebarWidth = collapsed ? 80 : 250;

    return (
        <div className={`app-root ${darkMode ? "theme-dark" : "theme-light"}`}>
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

            <main
                style={{
                    marginLeft: sidebarWidth,
                    paddingTop: 80,
                    transition: "margin-left 0.3s ease",
                    minHeight: "100vh"
                }}
            >
                <Routes>
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    <Route path="/employee/profile" element={<EmployeeProfile />} />
                    <Route path="/employee/attendance" element={<EmployeeAttendance />} />
                    <Route path="/employee/time-tracking" element={<TimeTracking />} />
                    <Route path="/employee/leave" element={<EmployeeLeave />} />

                    <Route path="/employee/payslips" element={<EmployeePayslips />} />
                    <Route path="/employee/documents" element={<EmployeeDocuments />} />
                    <Route path="/employee/loans" element={<div>Employee Loans Placeholder</div>} />
                    <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />
                    <Route path="/employee/daily-report" element={<EmployeeDailyReport />} />
                    <Route path="/employee/media-log" element={<MediaDashboard />} />
                    <Route path="/employee/holidays" element={<EmployeeHolidays />} />
                    <Route path="/employee/projects" element={<EmployeeProjects />} />
                    <Route path="/employee/tasks" element={<EmployeeTasks />} />

                    <Route path="/employee/resignation" element={<SubmitResignation />} />
                    <Route path="/employee/approvals" element={<EmployeeApprovals />} />

                    <Route path="/employee/tickets" element={<TicketList />} />
                    <Route path="/employee/tickets/raise" element={<RaiseTicket />} />
                    <Route path="/employee/tickets/:id" element={<TicketDetail />} />

                    <Route path="/employee/ai-assistant" element={<AIAssistant />} />
                    <Route path="/employee/meetings" element={<MeetingList />} />
                    <Route path="/employee/meetings/:roomId" element={<VideoMeeting />} />

                    {/* Chat Route */}
                    <Route path="/employee/chat" element={<ChatLayout />} />

                </Routes>
            </main>
            <Toaster position="top-right" />
        </div>
    );
};

export default EmployeeLayout;

