import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Modal, Button, Form } from 'react-bootstrap';
import { Video, Calendar, Users, Lock, Unlock } from 'lucide-react';
import { EMP_THEME } from '../theme';

const CreateMeetingModal = ({ show, onHide, onMeetingCreated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startTime: '',
        allowedRoles: [], // Default to none (Unlisted)
        settings: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            lobbyMode: false
        }
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title) {
            toast.error('Meeting title is required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/meetings/create`, {
                ...formData,
                // Ensure startTime is a valid date object or string suitable for backend
                startTime: formData.startTime || new Date()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                toast.success('Meeting scheduled successfully!');
                onMeetingCreated(); // Refresh list
                onHide(); // Close modal
                // Reset form
                setFormData({
                    title: '',
                    startTime: '',
                    allowedRoles: [],
                    settings: { startWithAudioMuted: true, startWithVideoMuted: true, lobbyMode: false }
                });
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to create meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (role) => {
        setFormData(prev => {
            const newRoles = prev.allowedRoles.includes(role)
                ? prev.allowedRoles.filter(r => r !== role)
                : [...prev.allowedRoles, role];
            return { ...prev, allowedRoles: newRoles };
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <div className="p-2 rounded-3" style={{ backgroundColor: `${EMP_THEME.royalAmethyst}1a` }}>
                        <Video size={24} style={{ color: EMP_THEME.royalAmethyst }} />
                    </div>
                    Schedule New Meeting
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Meeting Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Weekly Team Sync"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="form-control-lg bg-light border-0"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Start Time (Optional)</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="bg-light border-0"
                        />
                        <Form.Text className="text-muted">
                            Leave blank to start immediately.
                        </Form.Text>
                    </Form.Group>



                    <div className="bg-light p-3 rounded-3 mb-4">
                        <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                            <Users size={18} />
                            Meeting Default Settings
                        </h6>
                        <div className="d-flex gap-4">
                            <Form.Check
                                type="switch"
                                id="mute-audio"
                                label="Start Muted (Audio)"
                                checked={formData.settings.startWithAudioMuted}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    settings: { ...formData.settings, startWithAudioMuted: e.target.checked }
                                })}
                            />
                            <Form.Check
                                type="switch"
                                id="mute-video"
                                label="Start Hidden (Video)"
                                checked={formData.settings.startWithVideoMuted}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    settings: { ...formData.settings, startWithVideoMuted: e.target.checked }
                                })}
                            />
                        </div>
                        <div className="mt-3">
                            <Form.Check
                                type="switch"
                                id="lobby-mode"
                                label={
                                    <span>
                                        Private Meeting <span className="text-muted fw-normal">(Host must admit guests)</span>
                                    </span>
                                }
                                checked={formData.settings.lobbyMode}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    settings: { ...formData.settings, lobbyMode: e.target.checked }
                                })}
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 pt-2">
                        <Button variant="light" onClick={onHide} className="px-4">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="px-4 d-flex align-items-center gap-2"
                            style={{ backgroundColor: EMP_THEME.royalAmethyst, borderColor: EMP_THEME.royalAmethyst }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Calendar size={18} />
                                    Schedule Meeting
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateMeetingModal;
