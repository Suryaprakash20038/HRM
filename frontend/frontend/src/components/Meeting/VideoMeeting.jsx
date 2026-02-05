import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EMP_THEME } from '../../EmployeePanel/theme';
import { ArrowLeft } from 'lucide-react';

const VideoMeeting = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // Simplistic user info retrieval
    let userDisplayName = 'Guest';
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            userDisplayName = `${user.firstName} ${user.lastName}`;
        }
    } catch (e) {
        console.error('Error parsing user info', e);
    }

    const domain = 'meet.jit.si';
    // Jitsi URL construction
    const jitsiUrl = `https://${domain}/${roomId}#userInfo.displayName="${encodeURIComponent(userDisplayName)}"`;

    return (
        <div className="d-flex flex-column h-100" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="p-3 bg-white shadow-sm d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-link text-decoration-none p-0"
                        onClick={() => navigate('/employee/meetings')}
                        style={{ color: EMP_THEME.royalAmethyst }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h5 className="mb-0 fw-bold" style={{ color: EMP_THEME.midnightPlum }}>Meeting: {roomId}</h5>
                </div>
            </div>
            <div className="flex-grow-1 position-relative">
                <iframe
                    src={jitsiUrl}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0
                    }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    title="Jitsi Meeting"
                />
            </div>
        </div>
    );
};

export default VideoMeeting;
