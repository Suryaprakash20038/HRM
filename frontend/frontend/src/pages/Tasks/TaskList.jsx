import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import employeeService from '../../services/employeeService';
import projectService from '../../services/projectService';
import { toast } from 'react-toastify';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import './TaskList.css';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';

const TaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [pagination, setPagination] = useState({});

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTaskId, setViewTaskId] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
        priority: '',
        department: '',
        taskType: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Filter options
    const [departments, setDepartments] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchDepartments();
        fetchProjects();
    }, [filters]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getAllTasks(filters);

            if (response.success) {
                setTasks(response.data.tasks);
                setPagination(response.data.pagination);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error(error.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await employeeService.getAllEmployees();
            if (response.success) {
                const uniqueDepts = [...new Set(response.data.employees.map(emp => emp.department))];
                setDepartments(uniqueDepts);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectService.getAllProjects();
            if (response.success) {
                setProjects(response.data.projects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page on filter change
        }));
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            search: value,
            page: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await taskService.deleteTask(taskId);
            if (response.success) {
                toast.success('Task deleted successfully');
                fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error(error.message || 'Failed to delete task');
        }
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            status: '',
            priority: '',
            department: '',
            taskType: '',
            search: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
    };

    const handleOpenCreateModal = () => {
        setSelectedTaskId(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (taskId) => {
        setSelectedTaskId(taskId);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTaskId(null);
    };

    const handleOpenViewModal = (taskId) => {
        setViewTaskId(taskId);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setViewTaskId(null);
    };

    const handleTaskSuccess = () => {
        fetchTasks();
    };

    return (
        <div className="task-list-container">
            {/* Header */}
            <div className="task-header">
                <div className="header-left">
                    <h1 className="page-title">Mission Control</h1>
                    <p className="page-subtitle">Strategic directive orchestration and cross-departmental operations</p>
                </div>
                <button
                    className="btn-create-task"
                    onClick={handleOpenCreateModal}
                >
                    <span className="btn-icon">+</span>
                    Deploy Directive
                </button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="statistics-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.totalTasks || 0}</div>
                            <div className="stat-label">Global Operations</div>
                        </div>
                    </div>
                    <div className="stat-card stat-progress">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.inProgressTasks || 0}</div>
                            <div className="stat-label">Active Missions</div>
                        </div>
                    </div>
                    <div className="stat-card stat-completed">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.completedTasks || 0}</div>
                            <div className="stat-label">Objectives Secured</div>
                        </div>
                    </div>
                    <div className="stat-card stat-overdue">
                        <div className="stat-icon">🚨</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.overdueTasks || 0}</div>
                            <div className="stat-label">Critical Breaches</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Query directive logs or mission parameters..."
                        value={filters.search}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <div className="filters-row">
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Operational Status</option>
                        <option value="To Do">Pending Queue</option>
                        <option value="In Progress">Under Execution</option>
                        <option value="Review">Validation Phase</option>
                        <option value="Completed">Objective Met</option>
                        <option value="Cancelled">Directive Aborted</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Urgency Tier</option>
                        <option value="Low">Standard Flow</option>
                        <option value="Medium">Tactical Priority</option>
                        <option value="High">Strategic Importance</option>
                        <option value="Urgent">Critical Mission</option>
                    </select>

                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Division Unit</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select
                        value={filters.taskType}
                        onChange={(e) => handleFilterChange('taskType', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Mission Category</option>
                        <option value="Feature">System Innovation</option>
                        <option value="Bug">Protocol Repair</option>
                        <option value="Improvement">Efficiency Upgrade</option>
                        <option value="Research">Intelligence Gathering</option>
                        <option value="Meeting">Strategic Briefing</option>
                        <option value="Admin">Operational Support</option>
                        <option value="Testing">Quality Assurance</option>
                        <option value="Documentation">Knowledge Base</option>
                    </select>

                    <button onClick={clearFilters} className="btn-clear-filters">
                        Reset Parameters
                    </button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="tasks-table-container">
                {loading ? (
                    <div className="loading-state py-5 text-center">
                        <div className="spinner-border text-primary" style={{ color: '#663399' }} role="status"></div>
                        <p className="mt-3" style={{ color: '#A3779D', fontWeight: 600 }}>Synchronizing Mission Intel...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state py-5 text-center">
                        <div className="empty-icon mb-3" style={{ fontSize: '3rem' }}>🛰️</div>
                        <h3 style={{ color: '#2E1A47', fontWeight: 800 }}>No Active Directives</h3>
                        <p style={{ color: '#A3779D' }}>Adjust your tracking parameters or deploy a new strategic mission</p>
                        <button
                            className="btn-create-task mt-4 mx-auto"
                            onClick={handleOpenCreateModal}
                        >
                            Initiate First Mission
                        </button>
                    </div>
                ) : (
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Strategic Directive</th>
                                <th>Protocol</th>
                                <th>Assigned Agent</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Execution</th>
                                <th>Target Date</th>
                                <th>Tactical Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task._id} className={taskService.isOverdue(task) ? 'row-overdue' : ''}>
                                    <td>
                                        <div className="task-title-cell">
                                            <div className="task-title">{task.taskTitle}</div>
                                            <p className="task-description-preview">{task.description}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="task-type-badge">
                                            {task.taskType}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="employee-cell">
                                            <img
                                                src={task.assignedTo?.profileImage || `https://ui-avatars.com/api/?name=${task.assignedTo?.firstName || 'A'}&background=E6C7E6&color=663399`}
                                                alt={task.assignedTo?.firstName}
                                                className="employee-avatar"
                                            />
                                            <div className="employee-info-compact">
                                                <div className="employee-name-mini">
                                                    {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                                                </div>
                                                <span className="department-tag-mini">{task.department}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="progress-cell">
                                            <div className="progress-bar-container">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${task.progressPercent}%`, height: '100%' }}
                                                ></div>
                                            </div>
                                            <span className="progress-text ms-2">{task.progressPercent}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="due-date-cell">
                                            <div style={{ fontWeight: 700 }}>{taskService.formatDate(task.dueDate)}</div>
                                            {taskService.isOverdue(task) && (
                                                <span className="overdue-badge">BREACHED</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-view"
                                                onClick={() => handleOpenViewModal(task._id)}
                                                title="Intel View"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleOpenEditModal(task._id)}
                                                title="Recalibrate Directive"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDeleteTask(task._id)}
                                                title="Retire Directive"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                    >
                        Previous Cycle
                    </button>

                    <div className="pagination-info">
                        Phase {pagination.currentPage} of {pagination.totalPages}
                        <span className="total-count">({pagination.total} global directives)</span>
                    </div>

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.totalPages}
                    >
                        Next Cycle
                    </button>
                </div>
            )}

            {/* Task Create/Edit Modal */}
            <TaskForm
                show={showModal}
                onClose={handleCloseModal}
                taskId={selectedTaskId}
                onSuccess={handleTaskSuccess}
            />

            {/* Task View Details Modal */}
            <TaskDetails
                show={showViewModal}
                taskId={viewTaskId}
                onClose={handleCloseViewModal}
            />
        </div>

    );
};

export default TaskList;
