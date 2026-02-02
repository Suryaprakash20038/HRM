import React from 'react';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard = ({ employees = [] }) => {
    // Stats Calculation
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active' || e.isActive).length; // Handle both flag conventions if needed
    const inactiveEmployees = employees.filter(e => e.status === 'Inactive' || e.isActive === false).length;
    const departments = new Set(employees.map(e => e.department).filter(Boolean)).size;

    const stats = [
        {
            title: "Total Employees",
            value: totalEmployees,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "Active Employees",
            value: activeEmployees,
            icon: UserCheck,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "Inactive Employees",
            value: inactiveEmployees,
            icon: UserX,
            color: "text-purple-400",
            bg: "bg-purple-50",
            border: "border-purple-50"
        },
        {
            title: "Departments",
            value: departments,
            icon: Building2,
            color: "text-purple-700",
            bg: "bg-purple-50",
            border: "border-purple-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={24} />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-1 tracking-tight" style={{ color: '#2E1A47' }}>{stat.value}</h3>
                        <p className="text-sm font-medium" style={{ color: '#A3779D' }}>{stat.title}</p>
                    </div>

                    {/* Decorative Background Element */}
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out z-0`} />
                </motion.div>
            ))}
        </div>
    );
};

export default EmployeeDashboard;
