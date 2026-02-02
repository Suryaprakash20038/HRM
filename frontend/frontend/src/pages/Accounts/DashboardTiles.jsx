import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    DollarSign,
    CreditCard
} from 'lucide-react';

const DashboardTiles = ({ summary }) => {
    const thisMonthBalance = (summary?.thisMonthIncome || 0) - (summary?.thisMonthExpense || 0);

    const tiles = [
        {
            title: 'Total Income',
            value: `₹${summary?.totalIncome?.toLocaleString() || 0}`,
            icon: TrendingUp,
            iconBg: '#E6C7E6',
            iconColor: '#663399'
        },
        {
            title: 'Total Expense',
            value: `₹${summary?.totalExpense?.toLocaleString() || 0}`,
            icon: TrendingDown,
            iconBg: '#FEE2E2',
            iconColor: '#DC2626'
        },
        {
            title: 'Total Balance',
            value: `₹${summary?.balance?.toLocaleString() || 0}`,
            icon: Wallet,
            iconBg: '#FEF3C7',
            iconColor: '#D97706'
        },
        {
            title: 'Monthly Income',
            value: `₹${summary?.thisMonthIncome?.toLocaleString() || 0}`,
            icon: DollarSign,
            iconBg: '#E6C7E6',
            iconColor: '#663399'
        },
        {
            title: 'Monthly Expense',
            value: `₹${summary?.thisMonthExpense?.toLocaleString() || 0}`,
            icon: CreditCard,
            iconBg: '#FEE2E2',
            iconColor: '#DC2626'
        },
        {
            title: 'Current Surplus',
            value: `₹${thisMonthBalance.toLocaleString()}`,
            icon: TrendingUp,
            iconBg: '#D1FAE5',
            iconColor: '#059669'
        }
    ];

    return (
        <div className="row g-4 mb-8">
            {tiles.map((tile, index) => (
                <div key={tile.title} className="col-md-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm h-100"
                        style={{ border: '1px solid #E6C7E6', boxShadow: '0 4px 20px -10px rgba(102, 51, 153, 0.1)' }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-3 shadow-inner" style={{ backgroundColor: tile.iconBg, borderRadius: '14px', color: tile.iconColor }}>
                                <tile.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h6 className="text-uppercase m-0 fw-bold small opacity-75" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>
                            {tile.title}
                        </h6>
                        <p className="h3 fw-bold m-0 mt-1" style={{ color: '#2E1A47' }}>
                            {tile.value}
                        </p>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};

export default DashboardTiles;
