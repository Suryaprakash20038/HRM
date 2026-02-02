import React, { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationList from './ConversationList';
import ChatPanel from './ChatPanel';
import { MessageSquare } from 'lucide-react';
import './Chat.css';

const ChatLayout = () => {
    const { conversations, activeConversation, loading, connected } = useChat();

    useEffect(() => {
        console.log("🟣 PURPLE THEME LOADED - ChatLayout Mounted");
    }, []);

    return (
        <div className="chat-layout">
            {/* Connection Status */}
            {!connected && (
                <div className="connection-banner">
                    <span className="connection-dot offline"></span>
                    Initializing Chat Service...
                </div>
            )}

            <div className="chat-container">
                {/* Left Sidebar - Conversation List */}
                <div className="chat-sidebar">
                    <ConversationList />
                </div>

                {/* Main Chat Panel */}
                <div className="chat-main">
                    {activeConversation ? (
                        <ChatPanel />
                    ) : (
                        <div className="chat-empty-state">
                            <div className="empty-state-content">
                                <div className="empty-icon-wrapper">
                                    <MessageSquare size={64} className="empty-icon" />
                                </div>
                                <h3>Select a conversation</h3>
                                <p>Choose a chat from the sidebar to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
