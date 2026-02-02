import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { Search, User, X, Check, Users, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onCreateGroup, onClose }) => {
    const [step, setStep] = useState(1); // 1: Group Details, 2: Select Users
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [groupName, setGroupName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await chatService.getAllUsers();
            const userList = result.data?.users || [];
            setAllUsers(userList);
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setUsers(allUsers);
            return;
        }

        const filtered = allUsers.filter(user =>
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUsers(filtered);
    }, [searchTerm, allUsers]);

    const toggleUser = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        if (selectedUsers.size < 2) {
            toast.error('Please select at least 2 members');
            return;
        }

        setCreating(true);
        try {
            await onCreateGroup({
                name: groupName,
                participantIds: Array.from(selectedUsers),
                description: 'Group conversation'
            });
            onClose();
        } catch (error) {
            console.error('Failed to create group:', error);
            toast.error('Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="user-search-modal">
            <div className="user-search-content">
                <div className="user-search-header">
                    <h3>{step === 1 ? 'New Group' : 'Add Members'}</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                {step === 1 ? (
                    <div className="group-details-step">
                        <div className="group-avatar-upload">
                            <div className="group-avatar-placeholder">
                                <Camera size={32} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Group Name</label>
                            <input
                                type="text"
                                placeholder="Enter group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="group-name-input"
                                autoFocus
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-next"
                                disabled={!groupName.trim()}
                                onClick={() => setStep(2)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="user-search-input-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                                autoFocus
                            />
                        </div>

                        <div className="users-list">
                            {loading ? (
                                <div className="loading-spinner-container">
                                    <div className="mini-spinner"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="no-users-found">
                                    <p>No users found</p>
                                </div>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user._id}
                                        className={`user-item ${selectedUsers.has(user._id) ? 'selected' : ''}`}
                                        onClick={() => toggleUser(user._id)}
                                    >
                                        <div className="user-avatar">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" />
                                            ) : (
                                                <div className="avatar-placeholder-small">
                                                    {user.firstName?.charAt(0) || <User size={14} />}
                                                </div>
                                            )}
                                            {selectedUsers.has(user._id) && (
                                                <div className="selection-check">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-info">
                                            <h4>{user.firstName} {user.lastName}</h4>
                                            <p>{user.role || 'Employee'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-footer">
                            <div className="selected-count">
                                {selectedUsers.size} selected
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-back" onClick={() => setStep(1)}>
                                    Back
                                </button>
                                <button
                                    className="btn-create"
                                    disabled={selectedUsers.size < 2 || creating}
                                    onClick={handleCreate}
                                >
                                    {creating ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateGroupModal;
