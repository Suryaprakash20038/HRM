import React, { useState, useEffect } from 'react';
import chatService from '../../services/chatService';
import { Search, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

const UserSearch = ({ onSelectUser, onClose, existingUsers = new Set() }) => {
    // ... (state lines 7-10 remain same)
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

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

    return (
        <div className="user-search-modal">
            <div className="user-search-content">
                <div className="user-search-header">
                    <h3>New Chat</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

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
                        users.map(user => {
                            const isAdded = existingUsers.has(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`user-item ${isAdded ? 'disabled' : ''}`}
                                    onClick={() => !isAdded && onSelectUser(user._id)}
                                    style={isAdded ? { opacity: 0.6, cursor: 'not-allowed', background: '#f9fafb' } : {}}
                                >
                                    <div className="user-avatar">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="" />
                                        ) : (
                                            <div className="avatar-placeholder-small">
                                                {user.firstName?.charAt(0) || <User size={14} />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4>{user.firstName} {user.lastName}</h4>
                                            {isAdded && (
                                                <span style={{ fontSize: '11px', color: '#666', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Already Added
                                                </span>
                                            )}
                                        </div>
                                        <p>{user.role || 'Employee'}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearch;
