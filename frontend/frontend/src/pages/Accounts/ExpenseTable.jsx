import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, User, CreditCard } from 'lucide-react';

const ExpenseTable = ({ expenses, onEdit, onDelete }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="mb-8" style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)', overflow: 'hidden' }}>
            <div className="p-4 border-bottom bg-light/30" style={{ borderBottom: '1px solid #E6C7E6' }}>
                <h5 className="fw-bold m-0" style={{ color: '#663399' }}>Expense Disbursement Log</h5>
            </div>

            <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr className="small text-uppercase">
                            <th className="py-3 ps-4 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Title</th>
                            <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Category</th>
                            <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Amount</th>
                            <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Details</th>
                            <th className="py-3 border-bottom" style={{ color: '#663399', letterSpacing: '0.5px' }}>Recorded By</th>
                            <th className="py-3 border-bottom text-end pe-4" style={{ color: '#663399', letterSpacing: '0.5px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-5 text-center text-muted">
                                    <div className="flex flex-col items-center">
                                        <CreditCard className="w-12 h-12 mb-3 opacity-20" style={{ color: '#663399' }} />
                                        <p className="fw-bold mb-1" style={{ color: '#2E1A47' }}>Registry Empty</p>
                                        <p className="small opacity-75">All company expenditures will be cataloged here.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense, index) => (
                                <motion.tr
                                    key={expense._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-bottom-hover"
                                >
                                    <td className="ps-4 py-3">
                                        <div className="fw-bold" style={{ color: '#2E1A47' }}>{expense.title}</div>
                                        <div className="small opacity-75" style={{ color: '#A3779D' }}>{formatDate(expense.date)}</div>
                                    </td>
                                    <td>
                                        <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="fw-bold" style={{ color: '#EF4444', fontSize: '1.1rem' }}>
                                            -₹{expense.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="small" style={{ color: '#2E1A47' }}>{expense.paymentMethod}</div>
                                        <div className="x-small opacity-75 truncate max-w-200" style={{ color: '#A3779D', fontSize: '0.7rem' }}>{expense.note || '-'}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="avatar-mini" style={{ width: 24, height: 24, borderRadius: '6px', backgroundColor: '#E6C7E6', color: '#663399', fontSize: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                                                {expense.createdBy?.firstName?.charAt(0)}
                                            </div>
                                            <div className="small" style={{ color: '#2E1A47' }}>{expense.createdBy?.firstName}</div>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => onEdit(expense)}
                                                className="btn btn-sm btn-link text-decoration-none"
                                                style={{ color: '#663399' }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(expense._id)}
                                                className="btn btn-sm btn-link text-decoration-none"
                                                style={{ color: '#EF4444' }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .max-w-200 { max-width: 200px; }
                .border-bottom-hover:hover { background-color: #fdfbff; }
            `}</style>
        </div>
    );
};

export default ExpenseTable;
