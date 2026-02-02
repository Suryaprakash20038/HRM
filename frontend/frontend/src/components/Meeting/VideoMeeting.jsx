import React, { useState, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const VideoMeeting = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const joinMeeting = async () => {
            try {
                // Get meeting details and validate access
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Authentication required');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/meetings/${roomId}/join`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === 'success') {
                    setConfig(response.data.data);
                }
            } catch (error) {
                console.error('Error joining meeting:', error);
                toast.error(error.response?.data?.message || 'Failed to join meeting');
                navigate('/employee/meetings');
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            joinMeeting();
        }
    }, [roomId, navigate]);

    const handleReadyToClose = () => {
        navigate('/employee/meetings');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!config) return null;

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={config.roomName}
                configOverwrite={{
                    startWithAudioMuted: config.configOverwrite?.startWithAudioMuted ?? true,
                    startWithVideoMuted: config.configOverwrite?.startWithVideoMuted ?? true,
                    disableThirdPartyRequests: true,
                    prejoinPageEnabled: true,
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false
                }}
                userInfo={{
                    displayName: config.userInfo.displayName,
                    email: config.userInfo.email
                }}
                onApiReady={(externalApi) => {
                    // You can attach listeners here
                }}
                onReadyToClose={handleReadyToClose}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                }}
            />
        </div>
    );
};

export default VideoMeeting;
