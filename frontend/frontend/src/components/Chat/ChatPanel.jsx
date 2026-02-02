import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import GroupInfoModal from './GroupInfoModal';
import { Phone, Video, MoreVertical, Users } from 'lucide-react';
import chatService from '../../services/chatService';

const ChatPanel = () => {
    const { user } = useAuth();
    const { activeConversation, setActiveConversation, messages, typingUsers, loading, fetchMessages } = useChat();
    const messagesEndRef = useRef(null);
    const [showGroupInfo, setShowGroupInfo] = useState(false);

    // Requirement 4: Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            const isInitialLoad = !messagesEndRef.current?.previousMessageCount || messages.length > messagesEndRef.current.previousMessageCount + 20; // Heuristic
            const behavior = isInitialLoad ? 'auto' : 'smooth';

            messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });

            // Store count to detect large jumps
            if (messagesEndRef.current) {
                messagesEndRef.current.previousMessageCount = messages.length;
            }
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const handleGroupUpdate = async () => {
        try {
            const result = await chatService.getConversationById(activeConversation._id);
            if (result.data && result.data.conversation) {
                setActiveConversation(result.data.conversation);
            }
        } catch (error) {
            console.error('Failed to refresh conversation', error);
        }
    };

    const getConversationName = () => {
        if (!activeConversation) return '';

        if (activeConversation.type === 'direct') {
            const otherParticipant = activeConversation.participants.find(
                p => p.userId && p.userId._id !== user?._id
            );
            if (!otherParticipant || !otherParticipant.userId) return 'Unknown User';
            return `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`;
        }
        return activeConversation.name;
    };

    const getConversationAvatar = () => {
        if (!activeConversation) return null;

        if (activeConversation.type === 'direct') {
            const otherParticipant = activeConversation.participants.find(
                p => p.userId && p.userId._id !== user?._id
            );
            const pic = otherParticipant?.userId?.profilePicture;
            if (pic) {
                return pic.startsWith('http') ? pic : `http://localhost:5000${pic.startsWith('/') ? '' : '/'}${pic}`;
            }
            return null;
        }
        return activeConversation.avatar;
    };

    const getParticipantCount = () => {
        if (!activeConversation || activeConversation.type === 'direct') return null;
        return activeConversation.participants.length;
    };

    const isTyping = typingUsers.has(activeConversation?._id);
    const typingUsersList = isTyping ? Array.from(typingUsers.get(activeConversation._id)) : [];

    if (!activeConversation) return null; // Should be handled by layout but safety check

    return (
        <React.Fragment>
            {/* Header */}
            <div className="chat-panel-header">
                <div className="chat-header-left">
                    <div className="chat-header-avatar">
                        {getConversationAvatar() ? (
                            <img src={getConversationAvatar()} alt="" />
                        ) : (
                            <div className="avatar-placeholder">
                                {activeConversation?.type === 'group' ? (
                                    <Users size={20} />
                                ) : (
                                    getConversationName().charAt(0).toUpperCase()
                                )}
                            </div>
                        )}
                    </div>
                    <div className="chat-header-info">
                        <h3>{getConversationName()}</h3>
                        {getParticipantCount() && (
                            <span className="participant-count">{getParticipantCount()} members</span>
                        )}
                    </div>
                </div>

                <div className="chat-header-actions">
                    <button className="header-action-btn" title="Voice Call">
                        <Phone size={20} />
                    </button>
                    <button className="header-action-btn" title="Video Call">
                        <Video size={20} />
                    </button>
                    <button
                        className="header-action-btn"
                        title="More Options"
                        onClick={() => activeConversation.type === 'group' && setShowGroupInfo(true)}
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages-area">
                {loading && messages.length === 0 ? (
                    <div className="messages-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((message, index) => (
                            <MessageItem
                                key={message._id}
                                message={message}
                                isFirstInGroup={
                                    index === 0 ||
                                    messages[index - 1].senderId._id !== message.senderId._id
                                }
                                isLastInGroup={
                                    index === messages.length - 1 ||
                                    messages[index + 1].senderId._id !== message.senderId._id
                                }
                            />
                        ))}
                        {isTyping && <TypingIndicator users={typingUsersList} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageInput />

            {/* Group Info Modal */}
            {showGroupInfo && (
                <GroupInfoModal
                    conversation={activeConversation}
                    onClose={() => setShowGroupInfo(false)}
                    onUpdate={handleGroupUpdate}
                />
            )}
        </React.Fragment>
    );
};

export default ChatPanel;
