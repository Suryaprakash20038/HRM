# Project Assignment & Scheduling Workflow

This document outlines the role-based workflow for Project Management within the HRM system. Validates strict role separation between Admin, Manager, and Employee.

## 1. Roles & Responsibilities

### **Admin**
*   **Role:** System Overseer & Project Initiator.
*   **Capabilities:**
    - Create new Projects.
    - Define high-level project details: `Project Name`, `Deadline`, `Priority`, `Client`.
    - **Assign Project Manager:** Selects a specific Manager responsible for delivery.
    - **Assign Team Lead:** (Optional) Selects a technical lead.
    - **View Only:** Can view all project details and progress but typically does not perform daily task updates.
    - **Monitoring:** Dashboard view of all active projects and their health.

### **Manager** (Project Manager)
*   **Role:** Project Owner & Scheduler.
*   **Capabilities:**
    - **Receive Assignment:** Notifications when assigned a project by Admin.
    - **Team Selection:** Can add `Employees` to the project team (`Team Members`).
    - **Scheduling:** Break down the project into `Modules` or `Tasks`.
    - **Task Assignment:** Assign specific modules/tasks to specific Team Members.
    - **Timeline Supervision:** Update deadlines for individual modules.
    - **Status Updates:** Update overall Project Status (`Planning` -> `Active` -> `Completed`).
    - **Monitoring:** View detailed progress of each employee.

### **Employee** (Team Member)
*   **Role:** Executor.
*   **Capabilities:**
    - **View:** Can only see projects they are assigned to (as Team Member).
    - **Task View:** Can see modules/tasks assigned specifically to them.
    - **Updates:** Can update **Progress (%)** and **Status** of their assigned tasks.
    - **Comments:** Can add notes/comments to their work logs.
    - **Restrictions:** Cannot change Project details, Deadlines, or assign other members.

---

## 2. Process Workflow

### Phase 1: Project Initiation (Admin)
1.  **Admin** logs in -> Navigates to **Projects** -> **Create New**.
2.  Fills details: Name, Desc, Start/End Date.
3.  **Crucial Step:** Selects **Manager** from dropdown (List of users with role='manager').
4.  Submits -> System creates Project -> **Notification sent to Manager**.

### Phase 2: Planning & Staffing (Manager)
1.  **Manager** receives notification -> Logs in.
2.  Navigates to **My Projects** -> Selects the new Project.
3.  **Staffing:** Clicks "Manage Team" -> Adds Employees to `Team Members` list.
4.  **Scheduling:**
    - Clicks "Add Module/Task".
    - Enters Task Name, Description, Due Date.
    - **Assigns:** Selects an Employee from the *Project Team List*.
    - Submits -> **Notification sent to Employee**.

### Phase 3: Execution (Employee)
1.  **Employee** logs in -> Dashboard shows "New Task Assigned" or finding in **My Projects**.
2.  Opens Project -> Views assigned modules.
3.  Works on task.
4.  **Daily Update:** Updates progress (e.g., 50%) and adds comment ("Research completed").
5.  **Completion:** Sets status to `Completed`.
6.  **Notification sent to Manager** upon completion.

### Phase 4: Monitoring & Closure
1.  **Manager** reviews Employee submissions.
2.  Manager updates overall **Project Progress** (or auto-calculated).
3.  When all modules complete -> Manager sets Project Status to `Completed`.
4.  **Admin** sees "Completed" status on Main Dashboard.

---

## 3. Technical Implementation Rules

### Middleware & Access Control
*   `checkRole('admin')`: For standard CRUD on Projects (Create/Delete).
*   `checkRole('admin', 'manager')`: For Updating Project Structure (Adding Members/Tasks).
    *   *Constraint:* Managers can ONLY edit projects where `project.manager == current_user.id`.

### Notifications (Events)
*   `PROJECT_ASSIGNED`: Triggered on CreateProject. Recipient: Manager.
*   `TASK_ASSIGNED`: Triggered on AddModule. Recipient: Employee.
*   `STATUS_UPDATE`: Triggered on UpdateProgress. Recipient: Manager/Admin.

---

## 4. UI/UX Requirements
*   **Admin View:** Table of Projects with "Assign Manager" column.
*   **Manager View:** Kanban or List view of My Projects. "Add Member" button. "Add Task" modal.
*   **Employee View:** Simplified List of "My Tasks". Progress Slider.
