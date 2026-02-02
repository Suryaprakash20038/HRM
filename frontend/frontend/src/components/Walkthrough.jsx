import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function WalkthroughPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const next = location.state?.next || "/";
  const videoRef = useRef(null);

  const handleFinish = () => {
    localStorage.setItem('hasSeenWalkthrough', 'true');
    navigate(next, { replace: true });
  };

  useEffect(() => {
    console.log("Walkthrough Component Mounted");
    // Ensure video plays programmatically
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error("Autoplay failed:", err));
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <video
        ref={videoRef}
        src="/walkthrough.mp4"
        type="video/mp4"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Fullscreen immersive experience
        }}
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
      />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={handleFinish}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          padding: '12px 30px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '30px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          zIndex: 10
        }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        Skip Intro
      </motion.button>
    </div>
  );
}