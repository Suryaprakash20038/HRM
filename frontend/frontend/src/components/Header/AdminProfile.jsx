import { FaUserCircle } from "react-icons/fa";

const AdminProfile = () => {
  return (
    <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
      <FaUserCircle size={32} className="text-secondary" />
      <div>
        <p className="m-0 fw-semibold">Admin</p>
        <p className="m-0 text-muted" style={{ fontSize: "12px" }}>Logged in</p>
      </div>
    </div>
  );
};

export default AdminProfile;
