import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ResignationApprovals from '../pages/Resignation/ResignationApprovals';
import LeaveApprovals from './LeaveApprovals';

const EmployeeApprovals = () => {
    const [activeTab, setActiveTab] = useState('leave'); // Default to leave as per latest request

    const tabs = [
        { id: 'leave', label: 'Leave Authorization' },
        { id: 'resignation', label: 'Service Separation' }
    ];

    return (
        <div className="p-8 bg-[#fdfbff] min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: 4, height: 28, backgroundColor: '#663399', borderRadius: 4 }}></div>
                    <h1 className="text-3xl font-black text-[#2E1A47] tracking-tight">
                        Approval Command Center
                    </h1>
                </div>
                <p className="text-[#A3779D] font-semibold">authorize pending requests and directives.</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-[#E6C7E6] pb-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-black uppercase text-xs tracking-widest transition-all rounded-t-xl relative ${activeTab === tab.id
                                ? 'text-[#663399] bg-white border-x border-t border-[#E6C7E6]'
                                : 'text-[#A3779D] hover:text-[#663399] hover:bg-[#f3e8ff]'
                            }`}
                        style={{ bottom: -1 }} // overlap border
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-[#fdfbff]">
                {activeTab === 'leave' && <LeaveApprovals />}
                {activeTab === 'resignation' && (
                    <div className="-mt-8 -ml-8 -mr-8">
                        {/* ResignationApprovals comes with its own padding/container, so we trick it slightly or we just render it. 
                             ResignationApprovals has 'p-8 min-h-screen'. 
                             We might want to refactor ResignationApprovals later to remove its container, 
                             but for now let's just render it. A nested padding isn't the end of the world.
                         */}
                        <ResignationApprovals />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeApprovals;
