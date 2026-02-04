# Enterprise Project & Task Management Workflow

This document outlines the hierarchical role-based workflow for the Project Management system.

## 1. Hierarchy & Roles

| Role | Responsibility | Scope |
| :--- | :--- | :--- |
| **Admin** | System Governance | Creates Projects, Assigns Executive Manager. (No task level access). |
| **Manager** | Strategic Execution | Owns Projects, Defines Phases (Modules), Assigns Team Leads. Monitor progress. |
| **Team Lead (TL)** | Tactial Operation | Owns Modules, Breaks down into Tasks, Assigns Employees. Validates work. |
| **Employee** | Execution | Performs Tasks, Updates status/progress. |

---

## 2. Detailed Workflows

### A. Admin Workflow (Project Initiation)
1.  **Create Project**: Admin creates a new project.
    *   *Inputs*: Name, Client, Dates, Budget, Attachments (SRS).
2.  **Assign Assignment**: Admin selects one **Executive Manager**.
    *   *System Action*: Notification sent to Manager. Status updates to `Planning`.
    *   *Constraint*: Admin does *not* assign TLs or Developers.

### B. Manager Workflow (Phase Planning)
1.  **Receive Project**: Manager views assigned projects in "My Projects".
2.  **Define Architecture**:
    *   Manager creates **Project Modules** (Phases).
    *   *Examples*: "Frontend", "Backend API", "Mobile App", "Testing Phase".
3.  **Allocates Leadership**:
    *   For each Module, Manager assigns a **Team Lead**.
    *   *System Action*: TL receives notification "You are lead for Module X".
4.  **Oversight**:
    *   Manager views Gantt charts/Progress bars.
    *   Cannot modify granular Tasks created by TL.

### C. Team Lead Workflow (Task Execution)
1.  **Receive Module**: TL sees "Assigned Modules".
2.  **Task Breakdown**:
    *   TL creates **Tasks** linked to their Module.
    *   *Task Details*: Title, Description, Priority, Due Date.
3.  **Resource Allocation**:
    *   TL assigns **Employees** to specific tasks.
    *   *System Action*: Employee notified.
4.  **Validation**:
    *   TL reviews "Completed" tasks. Can "Approve" or "Reject" (Request Changes).

### D. Employee Workflow (Development)
1.  **My Board**: Employee sees a Kanban/List of "My Tasks".
2.  **Action**:
    *   Updates status: `To Do` -> `In Progress` -> `Review`.
    *   Adds Comments / Uploads Files.
3.  **Constraint**: Cannot see tasks of others (unless "Public" visibility is toggled, usually restricted).

---

## 3. Data Architecture (Schema Design)

### Project Model (Updated)
*   **Root Fields**: `manager: ObjectId(Employee)`
*   **Modules (Embedded)**:
    *   `name`, `description`, `dates`
    *   `teamLead`: `ObjectId(Employee)` (The Module Owner)
    *   `status`: `Pending`, `Active`, `Completed`

### Task Model (New Collection)
*   **References**:
    *   `project`: `ObjectId(Project)`
    *   `moduleId`: `ObjectId` (Link to specific module)
    *   `assignedBy`: `ObjectId(Employee)` (The TL)
    *   `assignedTo`: `[ObjectId(Employee)]`
*   **Fields**:
    *   `title`, `description`
    *   `priority`: `Low`, `Medium`, `High`, `Critical`
    *   `status`: `To Do`, `In Progress`, `In Review`, `Done`
    *   `timeline`: `{ start, due }`
    *   `attachments`: `[]`
    *   `comments`: `[{ user, text, time }]`

---

## 4. API & Security Rules (RBAC)

*   **Middleware**: `checkRole(['role'])` + `checkProjectAccess`
*   **Rules**:
    *   `POST /projects`: **Admin** only.
    *   `PUT /projects/:id/modules`: **Manager** (must be assigned manager).
    *   `POST /tasks`: **Team Lead** (must be assigned to the module's project).
    *   `PATCH /tasks/:id/status`: **Employee** (must be assigned) or **TL**.

---

## 5. Implementation Status ✅

### Backend (Completed)
- ✅ **Task Model** (`Task.js`) - New collection for task management
- ✅ **Project Model** - Updated with `teamLead` field in modules
- ✅ **Task Controller** - Create, Read, Update operations
- ✅ **Project Controller** - Added Manager/TL workflow functions:
  - `assignTeamLeadToModule` - Manager assigns TL to module
  - `getMyManagedProjects` - Manager views their projects
  - `getMyModules` - TL views their assigned modules
- ✅ **Routes** - All endpoints registered and protected

### Frontend (Completed)
- ✅ **taskService.js** - API service for task operations
- ✅ **projectService.js** - Extended with workflow functions:
  - `assignTeamLeadToModule`
  - `getMyManagedProjects`
  - `getMyModules`

### API Endpoints

#### Project Management
```
GET    /api/projects/my-managed          # Manager: Get managed projects
PATCH  /api/projects/:id/modules/:moduleId/assign-tl  # Manager: Assign TL
GET    /api/projects/my-modules          # TL: Get assigned modules
```

#### Task Management
```
POST   /api/tasks                        # TL: Create task
GET    /api/tasks?myTasks=true           # Employee: Get my tasks
GET    /api/tasks?projectId=:id          # Get tasks by project
GET    /api/tasks?moduleId=:id           # Get tasks by module
PATCH  /api/tasks/:id/status             # Update task status
```

### Next Steps (Frontend UI)
1. **Manager Dashboard**:
   - View managed projects
   - Module management interface
   - TL assignment dropdown per module
   
2. **Team Lead Dashboard**:
   - View assigned modules
   - Task creation form
   - Employee assignment interface
   - Task board (Kanban/List)

3. **Employee Dashboard**:
   - "My Tasks" board
   - Task status updates
   - Comment/file upload functionality

---

