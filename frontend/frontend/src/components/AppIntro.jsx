import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function AppIntro() {
  const [hide, setHide] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt autoplay when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error("Intro video autoplay failed:", err));
    }
  }, []);

  if (hide) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          objectFit: "cover",
        }}
        autoPlay
        muted
        playsInline
        onEnded={() => setHide(true)}
      />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setHide(true)}
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
    </motion.div>
  );
}