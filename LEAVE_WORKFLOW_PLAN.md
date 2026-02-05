# Role-Based Leave System - Implementation Plan

## 1. Executive Summary
This document details the architectural logic for a hierarchical, role-based leave approval system. The system enforces strict departmental routing and distinct flows for Employees, Team Leads, Managers, and HR personnel. The design leverages the existing `currentStage` state machine pattern to manage workflow transitions.

## 2. Core Architecture

### Data Strategy
- **State Machine**: Utilize `currentStage` (TeamLead → Manager → HR → Admin → Completed) to drive the workflow.
- **Audit Trail**: Use the `approvalChain` object to record the actor, timestamp, and comments for every approval action.
- **Dynamic Routing**: The starting stage and the "Next Stage" logic are determined dynamically by the **Applicant's Role**.

### Role Hierarchy & Permissions
| Role | Can Apply? | Can Approve? | Visibility Scope |
| :--- | :--- | :--- | :--- |
| **Employee** | Yes | No | Own Records |
| **Team Lead** | Yes | Yes (Employees) | Department (Level 1) |
| **Manager** | Yes | Yes (TLs, Employees) | Department (Level 2) |
| **HR** | Yes | Yes (Managers) | Organization (HR Level) |
| **Admin** | n/a | Yes (HR, Final Approvals) | Full System |

---

## 3. Detailed Workflow Logic

### 3.1. Employee Leave Flow
*Standard departmental chain. HR is notified but does not approve.*

1.  **Initialization**:
    -   `currentStage`: **'TeamLead'**
    -   `assignedTo`: Department Team Lead
    -   `status`: 'Pending'

2.  **Stage 1: Team Lead Action**:
    -   **Action**: Approve
    -   **Transition**: Set `currentStage` = **'Manager'**
    -   **Update**: Assign to Department Manager

3.  **Stage 2: Manager Action**:
    -   **Action**: Approve (Final Decision)
    -   **Transition**: Set `currentStage` = **'Completed'**, `status` = 'Approved'
    -   **Trigger**: Send **Notification** to Department HR ("For Your Information")

### 3.2. Team Lead Leave Flow
*Skip TL stage. Admin is notified but does not approve.*

1.  **Initialization**:
    -   `currentStage`: **'Manager'** (Skipping TeamLead)
    -   `assignedTo`: Department Manager
    -   `status`: 'Pending'

2.  **Stage 1: Manager Action**:
    -   **Action**: Approve (Final Decision)
    -   **Transition**: Set `currentStage` = **'Completed'**, `status` = 'Approved'
    -   **Trigger**: Send **Notification** to Admin ("For Your Information")

### 3.3. Manager Leave Flow
*High-level approval chain involving HR and Admin.*

1.  **Initialization**:
    -   `currentStage`: **'HR'**
    -   `assignedTo`: Department HR (or Generic HR)
    -   `status`: 'Pending'

2.  **Stage 1: HR Action**:
    -   **Action**: Approve
    -   **Transition**: Set `currentStage` = **'Admin'**
    -   **Update**: Assign to Admin

3.  **Stage 2: Admin Action**:
    -   **Action**: Approve (Final Decision)
    -   **Transition**: Set `currentStage` = **'Completed'**, `status` = 'Approved'
    -   **Trigger**: Notification to Applicant

### 3.4. HR Leave Flow
*Direct escalation to Admin.*

1.  **Initialization**:
    -   `currentStage`: **'Admin'**
    -   `assignedTo`: Admin
    -   `status`: 'Pending'

2.  **Stage 1: Admin Action**:
    -   **Action**: Approve (Final Decision)
    -   **Transition**: Set `currentStage` = **'Completed'**, `status` = 'Approved'
    -   **Trigger**: Notification to Applicant

---

## 4. State & Status Summary Table

| Applicant Role | Initial Stage | Stage 1 Approver | Stage 2 Approver | Final Status | Notify Only |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Employee** | `TeamLead` | Team Lead | Manager | `Approved` | HR |
| **Team Lead** | `Manager` | Manager | *None* | `Approved` | Admin |
| **Manager** | `HR` | HR | Admin | `Approved` | *None* |
| **HR** | `Admin` | Admin | *None* | `Approved` | *None* |

---

## 5. Dashboard Visibility Logic (Query Filters)

To ensure users only see relevant requests, apply these filters in the `getLeaveRequests` controller:

**1. Team Lead Dashboard:**
```javascript
{
  $or: [
    { employee: currentUserId }, // Own requests
    { 
      currentStage: 'TeamLead', 
      'employee.department': currentUserDepartment // Incoming for approval
    }
  ]
}
```

**2. Manager Dashboard:**
```javascript
{
  $or: [
    { employee: currentUserId }, // Own requests
    { 
      currentStage: 'Manager', 
      'employee.department': currentUserDepartment // Incoming for approval
    }
  ]
}
```

**3. HR Dashboard:**
```javascript
{
  $or: [
    { employee: currentUserId }, // Own requests
    { currentStage: 'HR' },      // Incoming for approval (from Managers)
    { status: 'Approved' }       // Read-only view of all approved leaves (optional)
  ]
}
```

**4. Admin Dashboard:**
```javascript
{
  $or: [
    { currentStage: 'Admin' },   // Incoming for approval
    { status: { $exists: true } } // View All (Superuser)
  ]
}
```

---

## 6. Implementation Notes & Edge Cases

1.  **Rejection Handling**:
    -   If *any* approver rejects the request, set `status` = 'Rejected' and `currentStage` = 'Completed'. The flow stops immediately.
2.  **Missing Roles**:
    -   If a Department has no Team Lead, the system should detect this during initialization and auto-escalate Employee requests to `Manager` stage.
3.  **Notification vs Approval**:
    -   Ensure email subjects clearly distinguish between "Action Required: Approve Leave" and "Notification: Leave Approved".
4.  **Concurrency**:
    -   Ensure `assignedTo` is updated atomically to prevent "ghost" tasks appearing on dashboards after they've been moved to the next stage.
