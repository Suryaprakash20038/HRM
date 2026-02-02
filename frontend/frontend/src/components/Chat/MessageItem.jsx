import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Check, CheckCheck, Download, FileText, Image as ImageIcon } from 'lucide-react';

const MessageItem = ({ message, isFirstInGroup, isLastInGroup }) => {
    const { user } = useAuth();
    const isSent = message.senderId._id === user._id;

    const getMessageTime = () => {
        try {
            return format(new Date(message.createdAt), 'HH:mm');
        } catch {
            return '';
        }
    };

    const getMessageStatus = () => {
        if (!isSent) return null;

        const { status } = message;

        if (status.read && status.read.length > 0) {
            return <CheckCheck size={16} className="status-icon read" />;
        }
        if (status.delivered && status.delivered.length > 0) {
            return <CheckCheck size={16} className="status-icon delivered" />;
        }
        if (status.sent) {
            return <Check size={16} className="status-icon sent" />;
        }

        return <div className="status-icon sending">...</div>;
    };

    const renderAttachment = (attachment) => {
        if (attachment.fileType === 'image') {
            return (
                <div className="message-image">
                    <img src={attachment.fileUrl} alt={attachment.fileName} />
                </div>
            );
        }

        return (
            <div className="message-file">
                <div className="file-icon">
                    {attachment.fileType === 'pdf' ? (
                        <FileText size={24} color="#FF3B30" />
                    ) : (
                        <FileText size={24} color="#007AFF" />
                    )}
                </div>
                <div className="file-info">
                    <span className="file-name">{attachment.fileName}</span>
                    <span className="file-size">
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                    </span>
                </div>
                <a
                    href={attachment.fileUrl}
                    download={attachment.fileName}
                    className="file-download"
                >
                    <Download size={18} />
                </a>
            </div>
        );
    };

    return (
        <div className={`message-item ${isSent ? 'sent' : 'received'} ${!isFirstInGroup ? 'not-first' : ''}`}>
            {isFirstInGroup && (
                <div className="message-avatar">
                    {message.senderId.profilePicture ? (
                        <img src={message.senderId.profilePicture} alt="" />
                    ) : (
                        <div className="avatar-placeholder-small">
                            {message.senderId.firstName.charAt(0)}
                        </div>
                    )}
                </div>
            )}

            <div className="message-content-wrapper">
                {!isSent && isFirstInGroup && (
                    <div className="message-sender-name">
                        {message.senderId.firstName} {message.senderId.lastName}
                    </div>
                )}

                <div className={`message-bubble ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}>
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments">
                            {message.attachments.map((attachment, index) => (
                                <div key={index}>
                                    {renderAttachment(attachment)}
                                </div>
                            ))}
                        </div>
                    )}

                    {message.content && (
                        <div className="message-text">{message.content}</div>
                    )}

                    <div className="message-meta">
                        <span className="message-time">{getMessageTime()}</span>
                        {getMessageStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
