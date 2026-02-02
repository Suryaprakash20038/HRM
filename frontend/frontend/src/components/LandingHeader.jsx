import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo4 from '../assets/logo4.png';
import logo3 from '../assets/logo5.png';

const LandingHeader = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getDashboardPath = () => {
        if (!user) return '/login';
        const role = user?.role?.toLowerCase();
        if (['employee', 'teamlead', 'manager'].includes(role)) {
            return '/employee/dashboard';
        }
        return '/dashboard';
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 h-[104px] flex items-center py-4 ${isScrolled ? 'bg-[#2E1A47] shadow-lg' : 'bg-[#E6C7E6]'}`}>
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between -mt-[10px]">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer pt-[2px]" onClick={() => window.scrollTo(0, 0)}>
                        <img src={isScrolled ? logo4 : logo3} alt="Logo" className="w-40 h-auto object-contain -mt-0.5" />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Overview', 'Features', 'Modules', 'Why Us'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(" ", "")}`}
                                className={`text-base font-bold transition-colors ${isScrolled ? 'text-[#E6C7E6] hover:text-white' : 'text-[#2E1A47] hover:text-[#663399]'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {!user && (
                            <button
                                onClick={() => navigate('/login')}
                                className={`text-base font-bold transition-colors ${isScrolled ? 'text-[#E6C7E6] hover:text-white' : 'text-[#2E1A47] hover:text-[#663399]'}`}
                            >
                                Log in
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/login')}
                            className={`px-6 py-2 text-base font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${isScrolled ? 'bg-[#E6C7E6] text-[#2E1A47] hover:bg-[#E6C7E6]' : 'bg-[#2E1A47] text-white hover:bg-[#663399] shadow-[#663399]/25'}`}
                        >
                            {user ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 transition-colors ${isScrolled ? 'text-[#E6C7E6]' : 'text-[#2E1A47]'}`}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden bg-white border-t border-slate-100"
                >
                    <div className="px-6 py-8 space-y-4 flex flex-col">
                        <a href="#overview" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-800">Overview</a>
                        <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-800">Features</a>
                        <a href="#modules" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-slate-800">Modules</a>
                        <hr className="border-slate-100 my-2" />
                        <button onClick={() => navigate('/login')} className="text-lg font-medium text-slate-800 text-left">Log in</button>
                        <button onClick={() => navigate('/register')} className="px-5 py-3 bg-[#663399] text-white font-semibold rounded-xl text-center shadow-lg">Get Started</button>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default LandingHeader;
