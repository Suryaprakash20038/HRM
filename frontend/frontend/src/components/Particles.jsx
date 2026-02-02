import React, { useEffect, useRef, useState } from 'react';

const Particles = ({
    width,
    height,
    particleCount = 50,
    lineDistance = 100,
    particleColor = 'rgba(6, 182, 212, 0.5)',
    lineColor = 'rgba(6, 182, 212, 0.2)',
    hoverDistance = 220
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: -1000, y: -1000 }); // Default off-screen

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Handle Resize
        const resizeCanvas = () => {
            // Only set width/height if parent is available to avoid 0x0
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            initParticles();
        };

        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                });
            }
        };

        const animate = () => {
            if (!canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse Interaction
                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                // Draw Connections
                // 1. Particle to Particle
                for (let j = index + 1; j < particlesRef.current.length; j++) {
                    const p2 = particlesRef.current[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < lineDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1 - dist / lineDistance;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // 2. Particle to Mouse
                const mdx = p.x - mouseRef.current.x;
                const mdy = p.y - mouseRef.current.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

                if (mDist < hoverDistance) {
                    // Pull particle slightly towards mouse
                    // const force = (hoverDistance - mDist) / hoverDistance;
                    // const mx = (mouseRef.current.x - p.x);
                    // const my = (mouseRef.current.y - p.y);
                    // p.vx += (mx / mDist) * force * 0.05;
                    // p.vy += (my / mDist) * force * 0.05;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(102, 51, 153, ${1 - mDist / hoverDistance})`; // Purple #663399
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            if (!canvas) return;
            // Need to account for canvas offset relative to viewport
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        // Attach listeners to window for smoother drag, or canvas for local 
        // For full screen effects, usually window interaction is preferred, but for component specific, local is safer.
        // Let's attach to parent or document if needed, but here simple listeners on canvas/container work best if it fills space.
        // The previous code attached to window, which is good for full screen. 
        // But if this component is small, `e.clientX - rect.left` handles the offset correctly.

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove); // Tracking mouse globally for interaction

        // Alternatively, track on the canvas element specifically if we only want interaction when hovering the section
        // canvas.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [particleCount, lineDistance, particleColor, lineColor, hoverDistance]);

    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    );
};

export default Particles;
