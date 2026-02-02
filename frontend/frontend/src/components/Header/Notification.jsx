import { IoNotificationsOutline } from "react-icons/io5";

const Notification = () => {
  return (
    <div className="position-relative" style={{ cursor: "pointer" }}>
      <IoNotificationsOutline size={25} className="text-secondary" />

      <span
        className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
        style={{ fontSize: "8px" }}
      ></span>
    </div>
  );
};

export default Notification;
