import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaBriefcase, FaCalendar, FaEdit, FaSave, FaTimes,
    FaCamera, FaIdCard, FaGlobe, FaBuilding, FaUserTie
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import employeeService from "../services/employeeService";
import toast from "react-hot-toast";

import { EMP_THEME, COMMON_STYLES } from "./theme";

// --- Custom Styles for Minimalist Elevated Design ---
const ACCENT_COLOR = EMP_THEME.royalAmethyst; // Replaced Blue with Theme Primary
const BACKGROUND_COLOR = EMP_THEME.lilacMist; // Updated background
const CARD_COLOR = EMP_THEME.white;


const styles = {
    container: {
        minHeight: "100vh",
        background: BACKGROUND_COLOR,
        padding: "30px",
    },
    // The main container for content
    contentWrapper: {
        maxWidth: "1300px",
        margin: "0 auto",
    },
    // Card style for the profile sections (Clean Elevation)
    elevatedCard: {
        background: CARD_COLOR,
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", // Subtle, clean shadow
        padding: "25px",
        marginBottom: "20px",
        transition: "box-shadow 0.3s ease",
    },
    // Hover effect for an attractive touch
    elevatedCardHover: {
        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.12)",
    },
    header: {
        fontSize: "1.8rem",
        fontWeight: "700",
        color: "#333", // Dark text for high contrast
        margin: 0,
    },
    // Button styles
    buttonPrimary: {
        background: ACCENT_COLOR,
        border: "none",
        color: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: `0 4px 15px ${ACCENT_COLOR}40`,
        transition: "all 0.3s ease",
    },
    buttonSecondary: {
        background: "transparent",
        border: `1px solid ${ACCENT_COLOR}`,
        color: ACCENT_COLOR,
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.3s ease",
    },
    // Profile Avatar (Unique ring design)
    profileAvatar: {
        width: "140px",
        height: "140px",
        borderRadius: "50%",
        background: EMP_THEME.lilacMist, // Use theme background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
        fontSize: "3rem",
        fontWeight: "700",
        border: `5px solid ${ACCENT_COLOR}20`, // Subtle accent ring
        overflow: "hidden",
        margin: "0 auto 15px auto",
        position: "relative",
    },
    cameraButton: {
        position: "absolute",
        bottom: "0px",
        right: "0px",
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        background: ACCENT_COLOR,
        border: `2px solid ${CARD_COLOR}`,
        color: CARD_COLOR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "0.9rem",
    },
    // Input/Display Field Styles
    infoLabel: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: "#666",
        fontSize: "0.85rem",
        marginBottom: "5px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    infoIcon: {
        fontSize: "1rem",
        color: ACCENT_COLOR, // Icon color accent
    },
    infoValueDisplay: {
        padding: "10px 12px",
        borderRadius: "8px",
        background: EMP_THEME.lilacMist, // Use container background color for contrast
        color: "#333",
        fontSize: "1rem",
        minHeight: "40px",
        border: "1px solid #E0E0E0"
    },
    infoInput: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #D1D9E6",
        background: CARD_COLOR,
        color: "#333",
        fontSize: "1rem",
        outline: "none",
        transition: "all 0.3s ease",
    },
    sectionTitle: {
        color: "#333",
        fontSize: "1.4rem",
        fontWeight: "700",
        marginBottom: "15px",
        borderBottom: "2px solid #E0E0E0", // Separator line
        paddingBottom: "8px",
    }
};

const EmployeeProfile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        dateOfBirth: "",
        gender: "",
        position: "",
        department: "",
        joiningDate: "",
        profileImage: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Simulate fetch delay
                await new Promise(resolve => setTimeout(resolve, 500));
                const employee = await employeeService.getMyProfile();
                if (employee) {
                    // Using placeholder/sample data as the actual data is unknown
                    const employeeData = {
                        firstName: employee.firstName || "Surya",
                        lastName: employee.lastName || "Prakash S",
                        email: employee.email || "surya.prakash@mern.com",
                        phone: employee.phone || "6383456066",
                        address: employee.address || "123 Dev Street, Kunathur",
                        city: employee.city || "Coimbatore",
                        state: employee.state || "Tamil Nadu",
                        country: employee.country || "India",
                        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : "2003-11-14",
                        gender: employee.gender || "Male",
                        position: employee.position || "Mern Stack Developer",
                        department: employee.department || "IT",
                        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : "2025-05-11",
                        profileImage: employee.profileImage || null,
                    };
                    setFormData(employeeData);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // TODO: API call to update profile
        toast.success("Profile saved successfully!", { icon: '✅' });
        console.log("Saving profile:", formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // In a real app, you might want to reload the original data here
        setIsEditing(false);
        toast("Editing cancelled.", { icon: '👋' });
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    // Reusable Info Field Component with improved styling
    const InfoField = ({ icon: Icon, label, value, name, type = "text", editable = true }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: "1.5rem" }}
        >
            <label style={styles.infoLabel}>
                <Icon style={styles.infoIcon} />
                {label}
            </label>
            {isEditing && editable ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    style={styles.infoInput}
                    onFocus={(e) => e.target.style.borderColor = ACCENT_COLOR}
                    onBlur={(e) => e.target.style.borderColor = "#D1D9E6"}
                />
            ) : (
                <div style={styles.infoValueDisplay}>
                    {value || "N/A"}
                </div>
            )}
        </motion.div>
    );

    if (loading) {
        return (
            <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ color: "#333", fontSize: "1.2rem" }}>Loading profile...</div>
            </div>
        );
    }

    const initials = `${formData.firstName?.charAt(0) || ''}${formData.lastName?.charAt(0) || ''}`;
    const formattedJoinDate = formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : "N/A";

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>

                {/* Header and Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ ...styles.elevatedCard, padding: "15px 25px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}
                >
                    <h1 style={styles.header}>
                        <FaUserTie style={{ marginRight: "10px", color: ACCENT_COLOR }} /> Employee Profile
                    </h1>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {!isEditing ? (
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${ACCENT_COLOR}60` }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsEditing(true)}
                                style={styles.buttonPrimary}
                            >
                                <FaEdit /> Edit Details
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.03, background: "#10B981", boxShadow: `0 6px 20px #10B98160` }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    style={{ ...styles.buttonPrimary, background: "#059669" }} // Green for Save
                                >
                                    <FaSave /> Save Changes
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03, background: "#EEE" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCancel}
                                    style={styles.buttonSecondary}
                                >
                                    <FaTimes /> Cancel
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>

                <div className="row g-4">

                    {/* Profile Summary Card (Left Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="col-lg-4"
                    >
                        <motion.div
                            style={{ ...styles.elevatedCard, textAlign: "center", padding: "30px 20px" }}
                            whileHover={styles.elevatedCardHover}
                        >

                            {/* Profile Picture */}
                            <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
                                <div style={styles.profileAvatar}>
                                    {formData.profileImage ? (
                                        <img
                                            src={getImageUrl(formData.profileImage)}
                                            alt="Profile"
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                                        />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={styles.cameraButton}
                                        onClick={() => toast("Image upload feature activated.", { icon: '📸' })}
                                    >
                                        <FaCamera />
                                    </motion.button>
                                )}
                            </div>

                            {/* Name and Position */}
                            <h2 style={{ color: "#333", fontSize: "1.5rem", fontWeight: "700", marginBottom: "5px" }}>
                                {formData.firstName} {formData.lastName}
                            </h2>
                            <p style={{ color: ACCENT_COLOR, fontSize: "1rem", fontWeight: "600", marginBottom: "25px" }}>
                                {formData.position || "Employee"}
                            </p>

                            {/* Key Employment Details Box */}
                            <div style={{
                                background: BACKGROUND_COLOR,
                                borderRadius: "10px",
                                padding: "15px",
                                border: "1px solid #E0E0E0"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <span style={{ color: "#666", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaBuilding style={{ color: "#FFC107" }} /> Department
                                    </span>
                                    <span style={{ color: "#333", fontWeight: "600" }}>{formData.department || "N/A"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#666", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaCalendar style={{ color: "#28A745" }} /> Joined On
                                    </span>
                                    <span style={{ color: "#333", fontWeight: "600" }}>{formattedJoinDate}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Profile Information Fields (Right Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="col-lg-8"
                    >
                        <motion.div style={styles.elevatedCard} whileHover={styles.elevatedCardHover}>

                            {/* Personal Information Section */}
                            <h3 style={styles.sectionTitle}>
                                Personal & Contact Information
                            </h3>

                            <div className="row">
                                <div className="col-md-6">
                                    <InfoField icon={FaUser} label="First Name" value={formData.firstName} name="firstName" />
                                </div>
                                <div className="col-md-6">
                                    <InfoField icon={FaUser} label="Last Name" value={formData.lastName} name="lastName" />
                                </div>
                                <div className="col-md-6">
                                    <InfoField icon={FaEnvelope} label="Email" value={formData.email} name="email" type="email" editable={false} />
                                </div>
                                <div className="col-md-6">
                                    <InfoField icon={FaPhone} label="Phone Number" value={formData.phone} name="phone" type="tel" />
                                </div>
                                <div className="col-md-6">
                                    <InfoField icon={FaCalendar} label="Date of Birth" value={formData.dateOfBirth} name="dateOfBirth" type="date" />
                                </div>
                                <div className="col-md-6">
                                    <InfoField icon={FaIdCard} label="Gender" value={formData.gender} name="gender" />
                                </div>
                            </div>

                            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px dashed #E0E0E0" }} />

                            {/* Address Information Section */}
                            <h3 style={styles.sectionTitle}>
                                Address Details
                            </h3>

                            <div className="row">
                                <div className="col-md-12">
                                    <InfoField icon={FaMapMarkerAlt} label="Street Address" value={formData.address} name="address" />
                                </div>
                                <div className="col-md-4">
                                    <InfoField icon={FaGlobe} label="City" value={formData.city} name="city" />
                                </div>
                                <div className="col-md-4">
                                    <InfoField icon={FaGlobe} label="State / Region" value={formData.state} name="state" />
                                </div>
                                <div className="col-md-4">
                                    <InfoField icon={FaGlobe} label="Country" value={formData.country} name="country" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;