import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import UserSearch from './UserSearch';
import CreateGroupModal from './CreateGroupModal';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { BASE_URL } from "../../services/api";

const ConversationList = () => {
    const { user } = useAuth();
    const {
        conversations,
        activeConversation,
        setActiveConversation,
        fetchMessages,
        onlineUsers,
        unreadCount,
        createDirectConversation,
        createGroupConversation
    } = useChat();

    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'group' - Main tab state

    // console.log removed

    const filteredConversations = conversations.filter(conv => {
        // Filter by tab
        if (conv.type !== activeTab) return false;

        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();

        // For direct chats, search by participant name
        if (conv.type === 'direct') {
            const otherParticipant = conv.participants.find(p => p.userId && p.userId._id !== user?._id);
            if (!otherParticipant || !otherParticipant.userId) return false;
            const name = `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`.toLowerCase();
            return name.includes(searchLower);
        }

        // For groups, search by name
        return conv.name?.toLowerCase().includes(searchLower);
    });

    const handleSelectConversation = async (conversation) => {
        setActiveConversation(conversation);
        await fetchMessages(conversation._id);
    };

    const getConversationName = (conversation) => {
        if (conversation.type === 'direct') {
            const otherParticipant = conversation.participants.find(
                p => p.userId && p.userId._id !== user?._id
            );
            if (!otherParticipant || !otherParticipant.userId) return 'Unknown User';
            return `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`;
        }
        return conversation.name;
    };

    const getConversationAvatar = (conversation) => {
        if (conversation.type === 'direct') {
            const otherParticipant = conversation.participants.find(
                p => p.userId && p.userId._id !== user?._id
            );
            const pic = otherParticipant?.userId?.profilePicture;
            if (pic) {
                return pic.startsWith('http') ? pic : `${BASE_URL}${pic.startsWith('/') ? '' : '/'}${pic}`;
            }
            return null;
        }
        return conversation.avatar;
    };

    const isUserOnline = (conversation) => {
        if (conversation.type === 'direct') {
            const otherParticipant = conversation.participants.find(
                p => p.userId && p.userId._id !== user?._id
            );
            return otherParticipant && onlineUsers.has(otherParticipant.userId._id);
        }
        return false;
    };

    const getLastMessagePreview = (conversation) => {
        if (!conversation.lastMessage) return 'No messages yet';

        const { content, messageType, senderId } = conversation.lastMessage;

        if (messageType === 'file') return '📎 File';
        if (messageType === 'image') return '🖼️ Image';

        return content?.length > 40 ? content.substring(0, 40) + '...' : content;
    };

    const getLastMessageTime = (conversation) => {
        if (!conversation.lastMessageAt) return '';

        try {
            return formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const handleSelectUser = async (userId) => {
        try {
            await createDirectConversation(userId);
            setShowNewChat(false);
            setSearchQuery('');
        } catch (error) {
            console.error('Failed to create conversation', error);
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            await createGroupConversation(groupData);
            setShowCreateGroup(false);
            setActiveTab('group'); // Switch to group tab
        } catch (error) {
            console.error('Failed to create group', error);
        }
    };

    return (
        <div className="conversation-list">
            {/* Header */}
            <div className="conversation-header">
                <div className="header-title">
                    <MessageCircle size={24} className="header-icon" />
                    <h2>Messages</h2>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-new-group" onClick={() => setShowCreateGroup(true)} title="New Group">
                        <Users size={18} />
                    </button>
                    <button className="btn-new-chat" onClick={() => setShowNewChat(true)} title="New Chat">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="conversation-tabs">
                <button
                    className={`tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
                    onClick={() => setActiveTab('direct')}
                >
                    Direct Chats
                </button>
                <button
                    className={`tab-btn ${activeTab === 'group' ? 'active' : ''}`}
                    onClick={() => setActiveTab('group')}
                >
                    Groups
                </button>
            </div>

            {/* Search */}
            <div className="conversation-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Conversation List */}
            <div className="conversations-scroll">
                {filteredConversations.length === 0 ? (
                    <div className="no-conversations">
                        <MessageCircle size={48} className="no-conv-icon" />
                        <p>No conversations yet</p>
                        <button className="btn-start-chat" onClick={() => setShowNewChat(true)}>
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => (
                        <div
                            key={conversation._id}
                            className={`conversation-item ${activeConversation?._id === conversation._id ? 'active' : ''}`}
                            onClick={() => handleSelectConversation(conversation)}
                        >
                            <div className="conversation-avatar">
                                {getConversationAvatar(conversation) ? (
                                    <img src={getConversationAvatar(conversation)} alt="" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {conversation.type === 'group' ? (
                                            <Users size={20} />
                                        ) : (
                                            getConversationName(conversation).charAt(0).toUpperCase()
                                        )}
                                    </div>
                                )}
                                {isUserOnline(conversation) && (
                                    <span className="online-indicator"></span>
                                )}
                            </div>

                            <div className="conversation-content">
                                <div className="conversation-top">
                                    <h4 className="conversation-name">
                                        {getConversationName(conversation)}
                                    </h4>
                                    <span className="conversation-time">
                                        {getLastMessageTime(conversation)}
                                    </span>
                                </div>
                                <div className="conversation-bottom">
                                    <p className="last-message">
                                        {getLastMessagePreview(conversation)}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                        <span className="unread-count">{conversation.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
                <UserSearch
                    onSelectUser={handleSelectUser}
                    onClose={() => setShowNewChat(false)}
                />
            )}

            {/* Create Group Modal */}
            {showCreateGroup && (
                <CreateGroupModal
                    onCreateGroup={handleCreateGroup}
                    onClose={() => setShowCreateGroup(false)}
                />
            )}
        </div>
    );
};

export default ConversationList;
