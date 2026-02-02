import React, { useState } from 'react';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { X, User, Trash2, Shield, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import UserSearch from './UserSearch'; // Reuse UserSearch for adding members? Or create internal

const GroupInfoModal = ({ conversation, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [showAddMember, setShowAddMember] = useState(false);
    const [loading, setLoading] = useState(false);

    // Determines current user's role in the group
    const myParticipant = conversation.participants.find(
        p => p.userId._id === user?._id || p.userId === user?._id
    );
    const isAdmin = myParticipant?.role === 'admin';

    const handleRemoveMember = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to remove ${userName} from the group?`)) return;

        try {
            setLoading(true);
            await chatService.removeParticipant(conversation._id, userId);
            toast.success(`${userName} removed`);
            onUpdate(); // Trigger refresh in parent
        } catch (error) {
            console.error('Remove member error:', error);
            toast.error('Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeAdmin = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to make ${userName} a group admin?`)) return;

        try {
            setLoading(true);
            await chatService.makeGroupAdmin(conversation._id, userId);
            toast.success(`${userName} promoted to admin`);
            onUpdate();
        } catch (error) {
            console.error('Make admin error:', error);
            toast.error('Failed to make admin');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            setLoading(true);
            await chatService.addParticipants(conversation._id, [userId]);
            toast.success('Member added');
            setShowAddMember(false);
            onUpdate();
        } catch (error) {
            console.error('Add member error:', error);
            toast.error('Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const canRemove = (targetId, targetRole) => {
        if (!isAdmin) return false;
        if (targetId === user?._id) return false; // Can't remove self here
        return targetRole !== 'admin';
    };

    const canPromote = (targetRole) => {
        return isAdmin && targetRole !== 'admin';
    };

    return (
        <div className="user-search-modal">
            <div className="user-search-content" style={{ maxWidth: '500px' }}>
                <div className="user-search-header">
                    <h3>Group Info</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="group-info-header" style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="group-avatar-large" style={{
                        width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                        background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {conversation.avatar ? (
                            <img src={conversation.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#86868B' }}>
                                {conversation.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>{conversation.name}</h2>
                    <p style={{ margin: 0, color: '#86868B', fontSize: '14px' }}>
                        {conversation.participants.length} members
                    </p>
                </div>

                <div className="group-members-list" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0 }}>Participants</h4>
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddMember(true)}
                                style={{
                                    border: 'none', background: 'transparent', color: '#007AFF',
                                    fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <UserPlus size={16} /> Add Member
                            </button>
                        )}
                    </div>

                    {conversation.participants.map(p => (
                        <div key={p.userId._id} className="user-item" style={{ cursor: 'default' }}>
                            <div className="user-avatar">
                                {p.userId.profilePicture ? (
                                    <img src={p.userId.profilePicture} alt="" />
                                ) : (
                                    <div className="avatar-placeholder-small">
                                        {p.userId.firstName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="user-info" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4>{p.userId.firstName} {p.userId.lastName}</h4>
                                    {p.role === 'admin' && (
                                        <span style={{
                                            fontSize: '10px', background: '#EBF5FF', color: '#007AFF',
                                            padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'
                                        }}>
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <p>{p.userId.email}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {canPromote(p.role) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleMakeAdmin(p.userId._id, p.userId.firstName); }}
                                        className="make-admin-btn"
                                        style={{
                                            border: 'none', background: '#F0F9FF', color: '#007AFF',
                                            padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                        title="Make Admin"
                                    >
                                        <Shield size={16} />
                                    </button>
                                )}
                                {canRemove(p.userId._id, p.role) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(p.userId._id, p.userId.firstName); }}
                                        className="remove-member-btn"
                                        style={{
                                            border: 'none', background: '#FEF2F2', color: '#EF4444',
                                            padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                        title="Remove from group"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showAddMember && (
                    <div className="add-member-overlay" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 10
                    }}>
                        <UserSearch
                            onSelectUser={handleAddMember}
                            onClose={() => setShowAddMember(false)}
                            existingUsers={new Set(conversation.participants.map(p => p.userId._id))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupInfoModal;
