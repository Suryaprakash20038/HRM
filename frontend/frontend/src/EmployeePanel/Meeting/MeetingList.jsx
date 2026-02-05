import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Video, Calendar, Clock, User, Shield, Plus, Copy } from 'lucide-react';
import CreateMeetingModal from './CreateMeetingModal';
import { EMP_THEME } from '../theme';

const MeetingList = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/meetings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'success') {
                setMeetings(response.data.data.meetings);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            // toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (meetingOrId) => {
        // JITSI - Unlimited Time (New Tab)
        // No API needed, just constructing the URL

        let roomId = typeof meetingOrId === 'object' ? meetingOrId.roomId : meetingOrId;

        // Handle full URLs if pasted
        if (roomId.includes('http')) {
            try {
                const url = new URL(roomId);
                // If it's a Jitsi URL, extract simple name or just use URL
                roomId = url.pathname.replace('/', '');
            } catch (e) {
                // If invalid URL, keep as is
            }
        }

        // Get User Info for Auto-Login
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

        // Construct Jitsi URL
        // https://meet.jit.si/<roomId>#userInfo.displayName="<Name>"
        const domain = 'meet.jit.si';
        const url = `https://${domain}/${roomId}#userInfo.displayName="${encodeURIComponent(userDisplayName)}"`;

        // Open in New Tab (Bypasses 5-minute limit)
        window.open(url, '_blank');
    };

    const handleCopyLink = (meeting) => {
        const link = `https://meet.jit.si/${meeting.roomId}`;
        navigator.clipboard.writeText(link);
        toast.success('Meeting link copied to clipboard!');
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="mb-1 d-flex align-items-center gap-2">
                        <Video size={28} style={{ color: EMP_THEME.royalAmethyst }} />
                        Team Meetings
                    </h2>
                    <p className="text-muted mb-0">Join or schedule video conferences with your team.</p>
                </div>

                <div className="d-flex gap-2 w-100 w-md-auto">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Meeting ID or Link"
                            id="join-meeting-input"
                        />
                        <button
                            className="btn btn-outline-primary"
                            type="button"
                            style={{ borderColor: EMP_THEME.royalAmethyst, color: EMP_THEME.royalAmethyst }}
                            onClick={() => {
                                const input = document.getElementById('join-meeting-input');
                                let val = input.value.trim();
                                if (!val) return toast.error('Please enter a meeting ID or link');

                                // Extract ID if full URL is pasted
                                // Logic: If it contains 'meet.jit.si', take the last part
                                try {
                                    if (val.includes('meet.jit.si')) {
                                        const parts = val.split('/');
                                        val = parts[parts.length - 1]; // active roomId
                                    } else if (val.includes('http')) {
                                        // Fallback for other URLs, but likely we want the last segment
                                        const parts = val.split('/');
                                        val = parts[parts.length - 1];
                                    }
                                } catch (e) { }

                                handleJoin(val);
                            }}
                        >
                            Join
                        </button>
                    </div>

                    <button
                        className="btn d-flex align-items-center gap-2 shadow-sm text-nowrap"
                        style={{ backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' }}
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Schedule
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center p-5">
                    <div className="spinner-border" role="status" style={{ color: EMP_THEME.royalAmethyst }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : meetings.length === 0 ? (
                <div className="text-center p-5 bg-white rounded-4 shadow-sm border border-dashed">
                    <div className="mb-3 bg-light d-inline-block p-4 rounded-circle">
                        <Calendar size={48} className="opacity-50" style={{ color: EMP_THEME.royalAmethyst }} />
                    </div>
                    <h4 className="fw-bold text-dark">No scheduled meetings</h4>
                    <p className="text-muted mb-4">You have no upcoming meetings at the moment.</p>
                    <button
                        className="btn"
                        style={{ color: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Schedule First Meeting
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {meetings.map((meeting) => (
                        <div key={meeting._id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title fw-bold mb-0 text-truncate" title={meeting.title}>{meeting.title}</h5>
                                        <span className={`badge rounded-pill px-3 py-2 ${meeting.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                            {meeting.status?.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex align-items-center text-muted mb-2">
                                            <Clock size={16} className="me-2 opacity-75" style={{ color: EMP_THEME.royalAmethyst }} />
                                            <span>{new Date(meeting.startTime).toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex align-items-center text-muted">
                                            <User size={16} className="me-2 opacity-75" style={{ color: EMP_THEME.royalAmethyst }} />
                                            <span>Term by: <span className="fw-medium text-dark">{meeting.host?.name || 'Unknown'}</span></span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <small className="text-muted d-block mb-2">Allowed Roles:</small>
                                        <div className="d-flex gap-1 flex-wrap">
                                            {meeting.allowedRoles.slice(0, 3).map((role, idx) => (
                                                <span key={idx} className="badge bg-light text-dark border fw-normal">
                                                    {role}
                                                </span>
                                            ))}
                                            {meeting.allowedRoles.length > 3 && (
                                                <span className="badge bg-light text-muted border fw-normal">+{meeting.allowedRoles.length - 3}</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoin(meeting)}
                                        className={`btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-medium ${meeting.status === 'active' ? '' : 'btn-secondary disabled'
                                            }`}
                                        style={meeting.status === 'active' ? { backgroundColor: EMP_THEME.royalAmethyst, color: 'white', border: 'none' } : {}}
                                        disabled={meeting.status === 'ended'}
                                    >
                                        <Video size={18} />
                                        {meeting.status === 'active' ? 'Join Now' : 'Meeting Ended'}
                                    </button>

                                    {meeting.status === 'active' && (
                                        <button
                                            onClick={() => handleCopyLink(meeting)}
                                            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-2 fw-medium border"
                                            style={{ color: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                                        >
                                            <Copy size={18} />
                                            Copy Link
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateMeetingModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onMeetingCreated={fetchMeetings}
            />
        </div>
    );
};

export default MeetingList;
