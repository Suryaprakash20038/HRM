import React from 'react';

const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;

    const getTypingText = () => {
        if (users.length === 1) {
            return `${users[0].userName} is typing`;
        } else if (users.length === 2) {
            return `${users[0].userName} and ${users[1].userName} are typing`;
        } else {
            return `${users.length} people are typing`;
        }
    };

    return (
        <div className="typing-indicator">
            <div className="typing-avatar">
                <div className="avatar-placeholder-small">
                    {users[0].userName.charAt(0)}
                </div>
            </div>
            <div className="typing-bubble">
                <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <span className="typing-text">{getTypingText()}</span>
        </div>
    );
};

export default TypingIndicator;
