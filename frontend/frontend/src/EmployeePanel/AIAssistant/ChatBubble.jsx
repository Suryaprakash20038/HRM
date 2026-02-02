import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

const ChatBubble = ({ message }) => {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={`chat-bubble-container ${isAssistant ? 'assistant' : 'user'}`}>
            <div className="avatar">
                {isAssistant ? <Bot size={24} /> : <User size={24} />}
            </div>
            <div className="message-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
        </div>
    );
};

export default ChatBubble;
