import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import hrmLogo from "../../assets/hrmlogo-removebg-preview.png";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getDashboardPath = () => {
        const role = user?.role?.toLowerCase();
        if (['employee', 'teamlead', 'manager'].includes(role)) {
            return '/employee/dashboard';
        }
        return '/dashboard';
    };

    const navLinks = [
        { name: "Home", path: "/home" },
        { name: "Dashboard", path: getDashboardPath() },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-slate-900/80 backdrop-blur-md py-4 shadow-lg"
                : "bg-transparent py-6"
                } text-white`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <Link to="/home" className="flex items-center gap-2 group">
                        <img
                            src={hrmLogo}
                            alt="HRM Logo"
                            className="h-12 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        {/* Optional: Add text if logo is hard to read in monochrome, but user asked for logo visible */}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative text-lg tracking-wide font-medium transition-all duration-300 hover:text-blue-300 ${isActive ? "text-blue-400" : "text-gray-100"}`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}

                        {/* User Profile - Minimal */}
                        <div className="flex items-center gap-3 pl-8 text-gray-200">
                            <FaUserCircle size={22} className="text-gray-300" />
                            <span className="text-sm font-medium tracking-wide opacity-90">
                                {user?.firstName}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-white hover:text-blue-300 transition-colors"
                        >
                            {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute w-full bg-white shadow-xl transition-all duration-300 ease-in-out origin-top ${isOpen ? "opacity-100 scale-y-100 py-4" : "opacity-0 scale-y-0 h-0 overflow-hidden"
                    }`}
            >
                <div className="px-4 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
