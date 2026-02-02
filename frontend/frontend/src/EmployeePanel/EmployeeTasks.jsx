import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import { toast } from 'react-toastify';
import './EmployeeTaskPanel.css';

const EmployeeTaskPanel = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateType, setUpdateType] = useState('progress'); // 'progress' or 'result'

    const [progressData, setProgressData] = useState({
        progressPercent: 0,
        comment: ''
    });

    const [resultData, setResultData] = useState({
        taskResult: 'Success',
        delayReason: '',
        employeeNotes: ''
    });

    const [filters, setFilters] = useState({
        status: '',
        priority: ''
    });

    useEffect(() => {
        fetchMyTasks();
    }, [filters]);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);

            // Fetch tasks (backend identifies user from token)
            const response = await taskService.getMyTasks(filters);

            if (response.success) {
                setTasks(response.data.tasks);
                setStatistics(response.data.statistics);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error(error.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const openUpdateModal = (task, type) => {
        setSelectedTask(task);
        setUpdateType(type);

        if (type === 'progress') {
            setProgressData({
                progressPercent: task.progressPercent || 0,
                comment: ''
            });
            setResultData({
                taskResult: task.taskResult || 'Success',
                delayReason: task.delayReason || '',
                employeeNotes: task.employeeNotes || ''
            });
        }

        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedTask(null);
        setProgressData({ progressPercent: 0, comment: '' });
        setResultData({ taskResult: 'Success', delayReason: '', employeeNotes: '' });
    };

    const handleUpdateProgress = async (e) => {
        e.preventDefault();

        try {
            const response = await taskService.updateProgress(selectedTask._id, progressData);

            if (response.success) {
                toast.success('Progress updated successfully');
                closeUpdateModal();
                fetchMyTasks();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            toast.error(error.message || 'Failed to update progress');
        }
    };

    const handleUpdateResult = async (e) => {
        e.preventDefault();

        if (resultData.taskResult === 'Delayed' && !resultData.delayReason.trim()) {
            toast.error('Please provide a delay reason');
            return;
        }

        try {
            const response = await taskService.updateTaskResult(selectedTask._id, resultData);

            if (response.success) {
                toast.success('Task result updated successfully');
                closeUpdateModal();
                fetchMyTasks();
            }
        } catch (error) {
            console.error('Error updating result:', error);
            toast.error(error.message || 'Failed to update result');
        }
    };

    return (
        <div className="employee-task-panel">
            {/* Header */}
            <div className="panel-header">
                <div>
                    <h1 className="panel-title">📋 My Tasks</h1>
                    <p className="panel-subtitle">Manage your assigned tasks and track progress</p>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="task-stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.total || 0}</div>
                            <div className="stat-label">Total Tasks</div>
                        </div>
                    </div>
                    <div className="stat-card stat-progress">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.inProgress || 0}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                    </div>
                    <div className="stat-card stat-completed">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.completed || 0}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                    <div className="stat-card stat-overdue">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.overdue || 0}</div>
                            <div className="stat-label">Overdue</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="filter-select"
                >
                    <option value="">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>

            {/* Tasks List */}
            <div className="tasks-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No tasks assigned</h3>
                        <p>You don't have any tasks matching the selected filters</p>
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {tasks.map(task => (
                            <div
                                key={task._id}
                                className={`task-card ${taskService.isOverdue(task) ? 'overdue' : ''}`}
                            >
                                <div className="task-card-header">
                                    <div className="task-type-icon">
                                        {taskService.getTaskTypeIcon(task.taskType)}
                                    </div>
                                    <div className="task-badges">
                                        <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`status-badge status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="task-card-title">{task.taskTitle}</h3>
                                <p className="task-card-description">
                                    {task.description?.substring(0, 100)}...
                                </p>

                                <div className="task-progress">
                                    <div className="progress-header">
                                        <span>Progress</span>
                                        <span className="progress-value">{task.progressPercent}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${task.progressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="task-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Due Date:</span>
                                        <span className="meta-value">
                                            {taskService.formatDate(task.dueDate)}
                                        </span>
                                    </div>
                                    {taskService.isOverdue(task) && (
                                        <span className="overdue-badge">⚠️ Overdue</span>
                                    )}
                                </div>

                                {task.assignedBy && (
                                    <div className="assigned-by">
                                        <span className="meta-label">Assigned by:</span>
                                        <span className="meta-value">
                                            {task.assignedBy.firstName} {task.assignedBy.lastName}
                                        </span>
                                    </div>
                                )}

                                <div className="task-actions">
                                    <button
                                        className="btn-action btn-view"
                                        onClick={() => openUpdateModal(task, 'view')}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        className="btn-action btn-progress"
                                        onClick={() => openUpdateModal(task, 'progress')}
                                    >
                                        📈 Update Progress
                                    </button>
                                    <button
                                        className="btn-action btn-result"
                                        onClick={() => openUpdateModal(task, 'result')}
                                    >
                                        ✅ Update Result
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {showUpdateModal && selectedTask && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title">
                                    {updateType === 'view' ? 'Task Details' :
                                        updateType === 'progress' ? 'Update Progress' : 'Update Task Result'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeUpdateModal}></button>
                            </div>

                            <div className="modal-body">
                                <h3 className="modal-task-title">{selectedTask.taskTitle}</h3>

                                {updateType === 'view' ? (
                                    <div className="task-view-details">
                                        <div className="detail-group mb-3">
                                            <label className="fw-bold d-block text-muted small">Description</label>
                                            <p>{selectedTask.description || "No description provided."}</p>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="fw-bold d-block text-muted small">Status</label>
                                                <span className={`status-badge status-${selectedTask.status?.toLowerCase().replace(' ', '-')}`}>
                                                    {selectedTask.status}
                                                </span>
                                            </div>
                                            <div className="col-6">
                                                <label className="fw-bold d-block text-muted small">Priority</label>
                                                <span className={`priority-badge priority-${selectedTask.priority?.toLowerCase()}`}>
                                                    {selectedTask.priority}
                                                </span>
                                            </div>
                                            <div className="col-6">
                                                <label className="fw-bold d-block text-muted small">Due Date</label>
                                                <p>{taskService.formatDate(selectedTask.dueDate)}</p>
                                            </div>
                                            <div className="col-6">
                                                <label className="fw-bold d-block text-muted small">Assigned By</label>
                                                <p>{selectedTask.assignedBy ? `${selectedTask.assignedBy.firstName} ${selectedTask.assignedBy.lastName}` : "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="modal-actions mt-4">
                                            <button type="button" className="btn-cancel w-100" onClick={closeUpdateModal}>
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                ) : updateType === 'progress' ? (
                                    <form onSubmit={handleUpdateProgress}>
                                        <div className="form-group">
                                            <label>Progress Percentage *</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={progressData.progressPercent}
                                                onChange={(e) => setProgressData(prev => ({
                                                    ...prev,
                                                    progressPercent: parseInt(e.target.value)
                                                }))}
                                                className="progress-slider"
                                            />
                                            <div className="progress-display">{progressData.progressPercent}%</div>
                                        </div>

                                        <div className="form-group">
                                            <label>Comment (Optional)</label>
                                            <textarea
                                                value={progressData.comment}
                                                onChange={(e) => setProgressData(prev => ({
                                                    ...prev,
                                                    comment: e.target.value
                                                }))}
                                                placeholder="Add a comment about your progress..."
                                                rows="4"
                                            />
                                        </div>

                                        <div className="modal-actions">
                                            <button type="button" className="btn-cancel" onClick={closeUpdateModal}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn-submit">
                                                Update Progress
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleUpdateResult}>
                                        <div className="form-group">
                                            <label>Task Result *</label>
                                            <select
                                                value={resultData.taskResult}
                                                onChange={(e) => setResultData(prev => ({
                                                    ...prev,
                                                    taskResult: e.target.value
                                                }))}
                                            >
                                                <option value="Success">✅ Success</option>
                                                <option value="Failed">❌ Failed</option>
                                                <option value="Delayed">⏰ Delayed</option>
                                                <option value="Reassigned">🔄 Reassigned</option>
                                            </select>
                                        </div>

                                        {resultData.taskResult === 'Delayed' && (
                                            <div className="form-group">
                                                <label>Delay Reason *</label>
                                                <textarea
                                                    value={resultData.delayReason}
                                                    onChange={(e) => setResultData(prev => ({
                                                        ...prev,
                                                        delayReason: e.target.value
                                                    }))}
                                                    placeholder="Explain the reason for delay..."
                                                    rows="3"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label>Employee Notes (Optional)</label>
                                            <textarea
                                                value={resultData.employeeNotes}
                                                onChange={(e) => setResultData(prev => ({
                                                    ...prev,
                                                    employeeNotes: e.target.value
                                                }))}
                                                placeholder="Add any additional notes..."
                                                rows="4"
                                            />
                                        </div>

                                        <div className="modal-actions">
                                            <button type="button" className="btn-cancel" onClick={closeUpdateModal}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn-submit">
                                                Update Result
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeTaskPanel;
