import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/interview.css";
import {
  ArrowLeft,
  CalendarX,
  Layers,
  Clock,
  PencilLine,
  Trophy,
  CheckCircle,
  Briefcase,
  IndianRupee,
  Calendar,
  Building,
  CheckCheck,
  FileCheck,
  FileText,
  Search,
  ExternalLink
} from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import candidateService from "../../services/candidateService";
import DesignSelection from "../../components/Recruitment/DesignSelection";
import ContentForm from "../../components/Recruitment/ContentForm";

export default function Interview() {
  const [interviewingCandidates, setInterviewingCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [appointmentSentCandidates, setAppointmentSentCandidates] = useState([]); // New State
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Modal State
  const [modalStep, setModalStep] = useState(1);
  const [offerCandidate, setOfferCandidate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // New Form Structure matching Candidate.jsx
  const [offerForm, setOfferForm] = useState({
    designId: '',
    letterType: 'Interview Call', // Default for Interview Page
    employeeName: '',
    designation: '',
    hrName: 'HR Manager',
    joiningDate: '',
    salary: '',
    bodyContent: 'We are pleased to inform you that you have been shortlisted for an interview.',
    // Interview Specifics
    interviewDate: '',
    interviewTime: '',
    interviewMode: 'Online',
    interviewLocation: '',
    interviewRound: '', // Kept for logic
    // Experience
    lastWorkingDay: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Helper to upload template from modal (Copied from Candidate.jsx for consistency)
  const handleUploadTemplate = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Uploading and extracting text...');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recruitment-settings/templates/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.success) {
        toast.dismiss(toastId);
        toast.success('Template uploaded from PDF!');

        // Allow time for state update if we were re-fetching, but here we just update local state or re-fetch
        loadData();

        // Auto-select and move to next step. Also populate bodyContent from the new template.
        setOfferForm(prev => ({
          ...prev,
          designId: res.data.data._id,
          bodyContent: res.data.data.bodyContent
        }));

        // Short delay to let the user see the success message before switching
        setTimeout(() => {
          setModalStep(2);
        }, 1000);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cands, temps] = await Promise.all([
        candidateService.getAllCandidates(),
        candidateService.getAllTemplates()
      ]);

      // 1. Interviewing: Status 'Interviewing' AND No Offer Yet
      const interviewing = cands.filter(c => c.status === 'Interviewing' && !c.offerDetails);

      // 2. Offer Provided: Status 'Selected' AND Appointment NOT Sent
      const offerSent = cands.filter(c => c.status === 'Selected' && !c.appointmentDetails?.sent);

      // 3. Appointment Sent: Status 'Selected' AND Appointment Sent
      const appointmentSent = cands.filter(c => c.status === 'Selected' && c.appointmentDetails?.sent);

      setInterviewingCandidates(interviewing);
      setSelectedCandidates(offerSent);
      setAppointmentSentCandidates(appointmentSent);
      setTemplates(temps);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LETTER HANDLERS ---
  const openLetterModal = (candidate, overrideType = null) => {
    setOfferCandidate(candidate);
    setSelectedTemplate(null);
    setModalStep(1); // Reset to Step 1

    // Initialize form with candidate data
    setOfferForm({
      designId: '', // Reset design so user must choose
      letterType: overrideType || (candidate.interviewDetails?.round ? 'Next Round' : 'Interview Call'),
      employeeName: candidate.name,
      designation: candidate.appliedFor,
      hrName: 'HR Manager',
      joiningDate: candidate.offerDetails?.joiningDate ? new Date(candidate.offerDetails.joiningDate).toISOString().split('T')[0] : '',
      salary: candidate.offerDetails?.ctc || candidate.expectedSalary || '',
      bodyContent: overrideType === 'Appointment'
        ? 'We are pleased to confirm your appointment.'
        : 'We are pleased to inform you that you have been shortlisted for the next round of interview.',

      // Interview Defaults
      interviewDate: '',
      interviewTime: '',
      interviewMode: 'Online',
      interviewLocation: '',
      interviewRound: candidate.interviewDetails?.round ? `Next Round` : "Technical Round",

      lastWorkingDay: ''
    });
  };

  const handleSendLetter = async (e) => {
    e.preventDefault();
    if (!offerForm.designId) return alert("Select a design template");

    try {
      setIsLoading(true);

      // --- AUTO-FILL PLACEHOLDERS BEFORE SENDING ---
      let processedBody = offerForm.bodyContent || '';
      const map = {
        '{{candidate_name}}': offerForm.employeeName,
        '{{designation}}': offerForm.designation,
        '{{joining_date}}': offerForm.joiningDate ? new Date(offerForm.joiningDate).toLocaleDateString() : '',
        '{{ctc}}': offerForm.salary ? Number(offerForm.salary).toLocaleString() : '',
        '{{hr_name}}': offerForm.hrName,
        '{{interview_date}}': offerForm.interviewDate ? new Date(offerForm.interviewDate).toLocaleDateString() : '',
        '{{interview_time}}': offerForm.interviewTime,
        '{{interview_mode}}': offerForm.interviewMode,
        '{{interview_location}}': offerForm.interviewLocation,
        '{{last_working_day}}': offerForm.lastWorkingDay ? new Date(offerForm.lastWorkingDay).toLocaleDateString() : '',
        '{{current_date}}': new Date().toLocaleDateString()
      };

      Object.keys(map).forEach(key => {
        if (map[key]) {
          processedBody = processedBody.replaceAll(key, map[key]);
        }
      });
      // ---------------------------------------------

      // Check if Custom Template
      const isCustomTemplate = templates.some(t => t._id === offerForm.designId);

      const letterData = {
        designId: isCustomTemplate ? null : offerForm.designId,
        templateId: isCustomTemplate ? offerForm.designId : null,
        letterType: offerForm.letterType,
        name: offerForm.employeeName,
        designation: offerForm.designation,
        hrName: offerForm.hrName,
        bodyContent: processedBody, // Use the processed body
        salary: offerForm.salary,
        joiningDate: offerForm.joiningDate,

        // Interview Details
        interviewDate: offerForm.interviewDate,
        interviewTime: offerForm.interviewTime,
        interviewMode: offerForm.interviewMode,
        interviewLocation: offerForm.interviewLocation,
        interviewRound: offerForm.interviewRound,

        // Experience
        lastWorkingDay: offerForm.lastWorkingDay
      };

      await candidateService.sendOfferLetter(offerCandidate._id || offerCandidate.id, letterData);
      alert("Letter Sent & Status Updated!");
      setOfferCandidate(null);
      loadData(); // Refresh list
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send letter");
    } finally {
      setIsLoading(false);
    }
  };


  // Helper for Status Colors
  const getStatusColor = (status) => {
    if (status === "Selected") return "status-success";
    if (status === "Rejected") return "status-danger";
    return "status-primary";
  };

  return (
    <div className="interview-page">
      <div className="container py-8" style={{ background: '#fdfbff', minHeight: '100vh' }}>

        {/* BACK BUTTON */}
        <div className="mb-6">
          <Link to="/recruitment" className="d-inline-flex align-items-center gap-2 text-[#663399] fw-bold text-decoration-none hover:translate-x-[-4px] transition-transform">
            <ArrowLeft size={18} /> Back to Command
          </Link>
        </div>

        <div className="mb-10">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
            <h2 className="mb-0 fw-black text-[#2E1A47] tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Tactical Screening Scheduler</h2>
          </div>
          <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>Manage calls, next rounds, and operational clearance</p>
        </div>

        {/* ================= SCHEDULED INTERVIEWS SECTION ================= */}
        <h3 className="list-heading">Scheduled Interviews ({interviewingCandidates.length})</h3>

        <div className="interview-list">
          {isLoading ? <p>Loading interviews...</p> : interviewingCandidates.length === 0 ? (
            <div className="empty-state bg-white p-12 rounded-[32px] border-2 border-dashed border-[#E6C7E6] text-center">
              <CalendarX size={48} className="mx-auto mb-4 text-[#cbd5e1]" strokeWidth={1} />
              <p className="text-[#2E1A47] fw-black text-xl mb-2">No active screenings found.</p>
              <p className="text-[#A3779D] fw-bold small">Generate an "Interview Call" from the Candidates page to see them here.</p>
            </div>
          ) : (
            interviewingCandidates.map((c) => (
              <div key={c._id} className={`ticket-card ${getStatusColor(c.status)}`}>

                {/* Left: Date Box */}
                <div className="ticket-date">
                  <span className="day">
                    {c.interviewDetails?.date ? new Date(c.interviewDetails.date).getDate() : "?"}
                  </span>
                  <span className="month">
                    {c.interviewDetails?.date ? new Date(c.interviewDetails.date).toLocaleString('default', { month: 'short' }) : "-"}
                  </span>
                </div>

                {/* Middle: Details */}
                <div className="ticket-info">
                  <h4 className="ticket-name">
                    {c.name}
                    <span className="role-badge">{c.appliedFor}</span>
                  </h4>
                  <p className="ticket-round d-flex align-items-center gap-2">
                    <Layers size={14} className="text-[#663399]" /> {c.interviewDetails?.round || 'Interview'} •
                    <span className="interviewer"> {c.interviewDetails?.mode || 'Online'}</span>
                  </p>
                  <div className="ticket-meta mt-2 d-flex flex-wrap gap-4">
                    <span className="meta-item d-flex align-items-center gap-2 text-[#A3779D] small fw-bold">
                      <Clock size={14} /> {c.interviewDetails?.time || '--:--'}
                    </span>
                    {c.interviewDetails?.link && (
                      <a href={c.interviewDetails.link} target="_blank" rel="noreferrer" className="link-btn text-[#663399] fw-bold small">
                        Join Terminal
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="ticket-actions text-end">
                  <div className={`status-pill px-3 py-1 rounded-full text-[10px] fw-black uppercase tracking-widest bg-[#f3e8ff] text-[#663399] mb-3`}>
                    {c.status}
                  </div>

                  <div className="action-buttons">
                    <button className="btn d-flex align-items-center gap-2"
                      style={{ background: '#663399', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}
                      onClick={() => openLetterModal(c)}>
                      <PencilLine size={14} /> Next Phase / Decision
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= OFFER PROVIDED SECTION ================= */}
        {selectedCandidates.length > 0 && (
          <>
            <h3 className="list-heading d-flex align-items-center gap-2 mt-12 mb-6 fw-black text-[#2E1A47]" style={{ fontSize: '1.25rem' }}>
              <Trophy size={20} className="text-[#663399]" />
              Clearance Granted ({selectedCandidates.length})
            </h3>

            <div className="interview-list d-flex flex-column gap-4">
              {selectedCandidates.map((c) => (
                <div key={c._id} className="ticket-card bg-white p-6 rounded-[24px] shadow-sm border border-[#E6C7E6] d-flex align-items-center gap-6" style={{ borderLeft: '6px solid #10b981' }}>

                  {/* Left: Success Icon */}
                  <div className="ticket-date d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #663399 0%, #2E1A47 100%)' }}>
                    <CheckCircle size={32} color="white" />
                  </div>

                  {/* Middle: Details */}
                  <div className="ticket-info flex-grow-1">
                    <h4 className="ticket-name fw-black text-[#2E1A47] mb-1">
                      {c.name}
                      <span className="role-badge ms-3 px-3 py-1 bg-[#f3e8ff] text-[#663399] rounded-full text-[10px] fw-black">{c.appliedFor}</span>
                    </h4>
                    <p className="ticket-round d-flex align-items-center gap-2 mb-3">
                      <Briefcase size={14} className="text-[#663399]" /> Intelligence Package Dispatched
                    </p>
                    <div className="ticket-meta d-flex gap-4">
                      {c.offerDetails?.ctc && (
                        <span className="meta-item d-flex align-items-center gap-2 text-[#A3779D] small fw-bold">
                          <IndianRupee size={14} />
                          ₹ {parseInt(c.offerDetails.ctc).toLocaleString()}
                        </span>
                      )}
                      {c.offerDetails?.joiningDate && (
                        <span className="meta-item d-flex align-items-center gap-2 text-[#A3779D] small fw-bold">
                          <Calendar size={14} />
                          Deployment: {new Date(c.offerDetails.joiningDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="ticket-actions text-end">
                    <div className="status-pill px-3 py-1 rounded-full text-[10px] fw-black uppercase tracking-widest bg-[#dcfce7] text-[#059669] mb-3">
                      Selected Candidate
                    </div>

                    <button
                      className="btn d-flex align-items-center gap-2 w-100"
                      style={{ background: '#663399', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800 }}
                      onClick={() => openLetterModal(c, 'Appointment')}
                    >
                      <FileText size={16} /> Finalize Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= APPOINTMENT SENT SECTION ================= */}
        {appointmentSentCandidates.length > 0 && (
          <>
            <h3 className="list-heading d-flex align-items-center gap-2 mt-12 mb-6 fw-black text-[#2E1A47]" style={{ fontSize: '1.25rem' }}>
              <Building size={20} className="text-[#663399]" />
              Personnel Onboarded ({appointmentSentCandidates.length})
            </h3>

            <div className="interview-list d-flex flex-column gap-4">
              {appointmentSentCandidates.map((c) => (
                <div key={c._id} className="ticket-card bg-white p-6 rounded-[24px] shadow-sm border border-[#E6C7E6] d-flex align-items-center gap-6" style={{ borderLeft: '6px solid #663399' }}>

                  {/* Left: Appointment Icon */}
                  <div className="ticket-date d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #663399 0%, #2E1A47 100%)' }}>
                    <Briefcase size={32} color="white" />
                  </div>

                  {/* Middle: Details */}
                  <div className="ticket-info flex-grow-1">
                    <h4 className="ticket-name fw-black text-[#2E1A47] mb-1">
                      {c.name}
                      <span className="role-badge ms-3 px-3 py-1 bg-[#f3e8ff] text-[#663399] rounded-full text-[10px] fw-black">{c.appliedFor}</span>
                    </h4>
                    <p className="ticket-round d-flex align-items-center gap-2 mb-3">
                      <CheckCheck size={14} className="text-[#663399]" /> Active Operational Agent
                    </p>
                    <div className="ticket-meta d-flex gap-4">
                      {c.appointmentDetails?.ctc && (
                        <span className="meta-item d-flex align-items-center gap-2 text-[#A3779D] small fw-bold">
                          <IndianRupee size={14} />
                          Final CTC: ₹ {parseInt(c.appointmentDetails.ctc).toLocaleString()}
                        </span>
                      )}
                      {c.appointmentDetails?.joiningDate && (
                        <span className="meta-item d-flex align-items-center gap-2 text-[#A3779D] small fw-bold">
                          <Calendar size={14} />
                          Activation Date: {new Date(c.appointmentDetails.joiningDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="ticket-actions text-end">
                    <div className="status-pill px-3 py-1 rounded-full text-[10px] fw-black uppercase tracking-widest bg-[#f3e8ff] text-[#663399]">
                      <FileCheck size={14} className="me-1" /> Onboarding Complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}


        {/* ================= MODAL REUSED ================= */}
        {offerCandidate && (
          <div className="modal-overlay" onClick={() => { setOfferCandidate(null); setModalStep(1); }}>
            <div className="modal-content-glass offer-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header-premium header-offer">
                <div className="header-content">
                  <h3>Generate Letter</h3>
                  <span className="header-subtitle">For {offerCandidate.name}</span>
                </div>
                <button className="close-btn-glass" onClick={() => { setOfferCandidate(null); setModalStep(1); }}>&times;</button>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="modal-body-scroll" style={{ padding: '30px' }}>

                  {/* STEP 1: Letter Type & Design Selection */}
                  {modalStep === 1 && (
                    <>
                      <div className="mb-4">
                        <label className="form-label fw-bold" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Letter Type</label>
                        <div className="d-flex flex-wrap gap-2" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                          {['Next Round', 'Interview Call', 'Offer', 'Rejection'].map(type => (
                            <button
                              key={type}
                              type="button"
                              className={`btn-primary-sm ${offerForm.letterType === type ? 'active-type' : 'inactive-type'}`}
                              onClick={() => {
                                setOfferForm({ ...offerForm, letterType: type, designId: '' });
                              }}
                              style={{
                                background: offerForm.letterType === type ? '#663399' : 'white',
                                color: offerForm.letterType === type ? 'white' : '#A3779D',
                                border: '1px solid #E6C7E6',
                                padding: '8px 16px',
                                borderRadius: '20px'
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <DesignSelection
                        selectedDesign={offerForm.designId}
                        onSelectDesign={(designId) => {
                          let finalId = designId;
                          let selectedTemplate = templates.find(t => t._id === designId);

                          if (!selectedTemplate) {
                            const styleMatch = designId.match(/^[a-z]+-(.+)$/);
                            if (styleMatch) {
                              const style = styleMatch[1];
                              const styleName = style.charAt(0).toUpperCase() + style.slice(1);
                              const type = offerForm.letterType;

                              const dbTemplate = templates.find(t =>
                                t.type === type &&
                                t.name.includes(styleName) &&
                                !t.isFixedPdf
                              );

                              if (dbTemplate) {
                                finalId = dbTemplate._id;
                                selectedTemplate = dbTemplate;
                              }
                            }
                          }

                          setOfferForm({
                            ...offerForm,
                            designId: finalId,
                            bodyContent: selectedTemplate ? selectedTemplate.bodyContent : offerForm.bodyContent
                          });
                        }}
                        letterType={offerForm.letterType}
                        customTemplates={templates}
                        onUploadTemplate={handleUploadTemplate}
                      />
                    </>
                  )}

                  {/* STEP 2: Content Form */}
                  {modalStep === 2 && (
                    <ContentForm
                      formData={offerForm}
                      onFormChange={setOfferForm}
                      letterType={offerForm.letterType}
                      customTemplates={templates}
                    />
                  )}

                </div>

                <div className="modal-footer-glass" style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  {modalStep === 1 ? (
                    <>
                      <button type="button" className="btn reset" onClick={() => setOfferCandidate(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                      <button
                        type="button"
                        className="btn primary"
                        disabled={!offerForm.designId}
                        onClick={() => setModalStep(2)}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: !offerForm.designId ? '#E6C7E6' : '#663399', color: 'white', cursor: 'pointer' }}
                      >
                        Next: Enter Content &rarr;
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn reset" onClick={() => setModalStep(1)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>&larr; Back</button>
                      <button
                        type="button"
                        className="btn primary"
                        disabled={isLoading}
                        onClick={handleSendLetter}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#663399', color: 'white', cursor: 'pointer' }}
                      >
                        {isLoading ? 'Sending...' : 'Generate & Send Letter'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6); z-index: 1100;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
            animation: fadeIn 0.3s ease;
        }
        
        .header-offer { 
            background: #ffffff !important; 
            border-bottom: 1px solid #f1f5f9;
        }
        .header-offer .header-content h3 { color: #0f172a !important; }
        .header-offer .header-subtitle { color: #64748b !important; }
        .header-offer .close-btn-glass { background: #f1f5f9 !important; color: #64748b !important; }
        .header-offer .close-btn-glass:hover { background: #e2e8f0 !important; color: #0f172a !important; }

        .modal-content-glass {
            background: #ffffff; width: 95%; max-width: 800px;
            border-radius: 24px; overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
        }

        /* Body Scroll Fix */
        .modal-body-scroll { 
            padding: 30px; 
            max-height: 70vh; 
            overflow-y: auto; 
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .modal-body-scroll::-webkit-scrollbar { width: 6px; }
        .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-body-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .modal-body-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .view-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; }
        .full { grid-column: span 2; }
        .control { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; }
        
        .btn-primary-sm {
            padding: 6px 12px; font-size: 0.85rem; border-radius: 6px;
            background: #663399; color: white; border: none; cursor: pointer;
            display: flex; align-items: center; gap: 6px;
        }
        .btn-primary-sm:hover { background: #2E1A47; }
        
         .empty-state {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            color: #64748b;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
         }
      `}</style>

      </div>
    </div>
  );
}
