import { Link } from "react-router-dom";
import { Users, Target, FileText, Settings } from "lucide-react";
import "../../css/recruitment.css";

const RecruitmentDashboard = () => {
  const cards = [
    {
      title: "Candidates",
      desc: "View all candidates",
      icon: Users,
      link: "/candidate",
    },
    {
      title: "Interviews",
      desc: "Schedule interviews",
      icon: Target,
      link: "/interview",
    },
    {
      title: "Job Descriptions",
      desc: "Manage job roles",
      icon: FileText,
      link: "/job-descriptions",
    },
    {
      title: "Settings",
      desc: "Configuration",
      icon: Settings,
      link: "/recruitment-settings",
    },
  ];

  return (
    <div className="min-vh-100 p-5" style={{ background: '#fdfbff', backgroundImage: 'radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.03) 0px, transparent 50%)' }}>
      <div className="container py-4">
        <div className="mb-5">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
            <h2 className="fw-black text-[#2E1A47] m-0" style={{ fontSize: '2.5rem', letterSpacing: '-1px', fontWeight: 900 }}>Recruitment Dashboard</h2>
          </div>
          <p className="text-[#A3779D] fw-bold" style={{ fontSize: '1.1rem' }}>Manage your hiring pipeline</p>
        </div>

        <div className="row g-4 mt-3">
          {cards.map((card, index) => (
            <div className="col-md-6 col-lg-3" key={index}>
              <div
                className="card border-0 p-4 h-100"
                style={{
                  borderRadius: '28px',
                  background: '#ffffff',
                  boxShadow: '0 15px 35px -5px rgba(102, 51, 153, 0.1)',
                  border: '1px solid #E6C7E6',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.borderColor = '#663399';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E6C7E6';
                }}
              >
                <div className="d-flex align-items-center justify-content-center mb-4" style={{
                  width: '60px',
                  height: '60px',
                  background: '#f3e8ff',
                  borderRadius: '18px',
                  color: '#663399'
                }}>
                  <card.icon size={28} strokeWidth={2.5} />
                </div>

                <h5 className="fw-black text-[#2E1A47] mb-2" style={{ fontWeight: 800 }}>{card.title}</h5>
                <p className="text-[#A3779D] font-bold" style={{ fontSize: '0.85rem' }}>{card.desc}</p>

                <Link to={card.link} className="btn w-100 mt-4" style={{
                  background: '#663399',
                  color: 'white',
                  borderRadius: '14px',
                  padding: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  boxShadow: '0 8px 20px -5px rgba(102, 51, 153, 0.4)'
                }}>
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDashboard;
