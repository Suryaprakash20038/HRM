import React from "react";
import { useAuth } from "../context/AuthContext";
import ManagerProjectDashboard from "./ManagerProjectDashboard";
import TeamLeadModuleDashboard from "./TeamLeadModuleDashboard";
import EmployeeProjectsView from "./EmployeeProjectsView";

export default function EmployeeProjects() {
    const { user } = useAuth();

    // Determine role
    const role = user?.role?.toLowerCase() || '';
    const position = user?.position?.toLowerCase() || '';

    // Check if user is a manager
    const isManager = role === 'manager' || position.includes('manager');

    // Check if user is a team lead
    const isTeamLead = role === 'teamlead' || position.includes('lead') || position.includes('tl');

    // Render based on role
    if (isManager) {
        return <ManagerProjectDashboard />;
    } else if (isTeamLead) {
        return <TeamLeadModuleDashboard />;
    } else {
        // Regular employee - show project details (Read-only)
        return <EmployeeProjectsView />;
    }
}
