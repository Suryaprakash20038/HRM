import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
    const { activeConversation, sendMessage, uploadFile, emitTyping, emitStopTyping, connected } = useChat();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleTyping = (e) => {
        if (!connected) return;
        setMessage(e.target.value);

        if (!isTyping && e.target.value.length > 0) {
            setIsTyping(true);
            emitTyping(activeConversation._id);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            emitStopTyping(activeConversation._id);
        }, 3000);
    };

    const handleFileSelect = async (e) => {
        if (!connected) {
            toast.error('Cannot upload while offline');
            return;
        }
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        setUploading(true);

        try {
            const uploadedFiles = await Promise.all(
                files.map(file => uploadFile(file, activeConversation._id))
            );

            setAttachments(prev => [...prev, ...uploadedFiles]);
            toast.success(`${files.length} file(s) uploaded`);
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!connected) {
            toast.error('You are offline');
            return;
        }
        if (!message.trim() && attachments.length === 0) return;

        const messageType = attachments.length > 0 ?
            (attachments[0].fileType === 'image' ? 'image' : 'file') :
            'text';

        try {
            await sendMessage(
                activeConversation._id,
                message.trim(),
                messageType,
                attachments
            );

            // Clear input
            setMessage('');
            setAttachments([]);
            setIsTyping(false);
            emitStopTyping(activeConversation._id);
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input-container">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="attachments-preview">
                    {attachments.map((file, index) => (
                        <div key={index} className="attachment-item">
                            {file.fileType === 'image' ? (
                                <img src={file.fileUrl} alt={file.fileName} className="attachment-thumbnail" />
                            ) : (
                                <div className="attachment-file">
                                    <Paperclip size={16} />
                                    <span>{file.fileName}</span>
                                </div>
                            )}
                            <button
                                className="remove-attachment"
                                onClick={() => removeAttachment(index)}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className={`message-input-wrapper ${!connected ? 'disabled' : ''}`}>
                <button
                    className="input-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !connected}
                    title="Attach file"
                >
                    {uploading ? (
                        <div className="mini-spinner"></div>
                    ) : (
                        <Paperclip size={20} />
                    )}
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />

                <textarea
                    className="message-input"
                    placeholder={!connected ? "Reconnecting..." : "Type a message..."}
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    disabled={!connected}
                    rows={1}
                    style={{
                        minHeight: '44px',
                        maxHeight: '120px',
                        resize: 'none',
                        overflowY: message.split('\n').length > 3 ? 'auto' : 'hidden'
                    }}
                />

                <button
                    className="input-action-btn"
                    title="Emoji"
                    disabled={!connected}
                >
                    <Smile size={20} />
                </button>

                <button
                    className={`send-btn ${message.trim() || attachments.length > 0 ? 'active' : ''}`}
                    onClick={handleSend}
                    disabled={(!message.trim() && attachments.length === 0) || !connected}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
