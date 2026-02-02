import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Download, Calendar, CheckCircle, XCircle } from 'lucide-react';
import DashboardTiles from './DashboardTiles';
import IncomeTable from './IncomeTable';
import ExpenseTable from './ExpenseTable';
import AddIncomeModal from './AddIncomeModal';
import AddExpenseModal from './AddExpenseModal';
import {
    getAllIncome,
    getAllExpense,
    createIncome,
    createExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    getSummary
} from '../../services/accountsService';

const Accounts = () => {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editIncomeData, setEditIncomeData] = useState(null);
    const [editExpenseData, setEditExpenseData] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        month: '',
        year: new Date().getFullYear().toString(),
        category: ''
    });

    // Notification state
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [incomeRes, expenseRes, summaryRes] = await Promise.all([
                getAllIncome(filters),
                getAllExpense(filters),
                getSummary(filters)
            ]);

            setIncomes(incomeRes.data || []);
            setExpenses(expenseRes.data || []);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Income handlers
    const handleAddIncome = async (formData) => {
        try {
            await createIncome(formData);
            showNotification('Income added successfully!', 'success');
            setShowIncomeModal(false);
            fetchData();
        } catch (error) {
            console.error('Error adding income:', error);
            showNotification(error.message || 'Failed to add income', 'error');
        }
    };

    const handleEditIncome = (income) => {
        setEditIncomeData(income);
        setShowIncomeModal(true);
    };

    const handleUpdateIncome = async (formData) => {
        try {
            await updateIncome(editIncomeData._id, formData);
            showNotification('Income updated successfully!', 'success');
            setShowIncomeModal(false);
            setEditIncomeData(null);
            fetchData();
        } catch (error) {
            console.error('Error updating income:', error);
            showNotification(error.message || 'Failed to update income', 'error');
        }
    };

    const handleDeleteIncome = async (id) => {
        if (window.confirm('Are you sure you want to delete this income record?')) {
            try {
                await deleteIncome(id);
                showNotification('Income deleted successfully!', 'success');
                fetchData();
            } catch (error) {
                console.error('Error deleting income:', error);
                showNotification(error.message || 'Failed to delete income', 'error');
            }
        }
    };

    // Expense handlers
    const handleAddExpense = async (formData) => {
        try {
            await createExpense(formData);
            showNotification('Expense added successfully!', 'success');
            setShowExpenseModal(false);
            fetchData();
        } catch (error) {
            console.error('Error adding expense:', error);
            showNotification(error.message || 'Failed to add expense', 'error');
        }
    };

    const handleEditExpense = (expense) => {
        setEditExpenseData(expense);
        setShowExpenseModal(true);
    };

    const handleUpdateExpense = async (formData) => {
        try {
            await updateExpense(editExpenseData._id, formData);
            showNotification('Expense updated successfully!', 'success');
            setShowExpenseModal(false);
            setEditExpenseData(null);
            fetchData();
        } catch (error) {
            console.error('Error updating expense:', error);
            showNotification(error.message || 'Failed to update expense', 'error');
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            try {
                await deleteExpense(id);
                showNotification('Expense deleted successfully!', 'success');
                fetchData();
            } catch (error) {
                console.error('Error deleting expense:', error);
                showNotification(error.message || 'Failed to delete expense', 'error');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            month: '',
            year: new Date().getFullYear().toString(),
            category: ''
        });
    };

    const handleCloseIncomeModal = () => {
        setShowIncomeModal(false);
        setEditIncomeData(null);
    };

    const handleCloseExpenseModal = () => {
        setShowExpenseModal(false);
        setEditExpenseData(null);
    };

    return (
        <div className="accounts-page" style={{ padding: '30px', paddingBottom: 80 }}>
            <style>{`
                .accounts-page {
                    background-color: #ffffff;
                    background-image:
                        radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
                    min-height: 100vh;
                }
            `}</style>
            {/* Notification */}
            {notification.show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={`fixed bottom-10 right-10 z-[10000] flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl ${notification.type === 'success'
                        ? 'bg-success text-white'
                        : 'bg-danger text-white'
                        }`}
                    style={{ backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444' }}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle className="w-6 h-6" />
                    ) : (
                        <XCircle className="w-6 h-6" />
                    )}
                    <p className="font-semibold m-0">{notification.message}</p>
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
            >
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#2E1A47' }}>Financial Center</h1>
                <p style={{ color: '#A3779D' }}>Unified overview of company income, assets, and expenditure</p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center justify-center gap-4 mb-8"
            >
                <button
                    onClick={() => setShowIncomeModal(true)}
                    className="btn btn-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
                    style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, border: 'none', borderRadius: '14px', padding: '12px 30px' }}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Income Record</span>
                </button>

                <button
                    onClick={() => setShowExpenseModal(true)}
                    className="btn btn-lg shadow flex items-center gap-2"
                    style={{ backgroundColor: '#ffffff', color: '#663399', fontWeight: 600, border: '1px solid #E6C7E6', borderRadius: '14px', padding: '12px 30px' }}
                >
                    <Plus className="w-5 h-5" />
                    <span>Log New Expense</span>
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6 mb-8"
                style={{ border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <Filter className="w-5 h-5" style={{ color: '#663399' }} />
                    <h5 className="font-bold m-0" style={{ color: '#2E1A47' }}>Transaction Filters</h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month
                        </label>
                        <select
                            name="month"
                            value={filters.month}
                            onChange={handleFilterChange}
                            className="form-select border shadow-sm"
                            style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px' }}
                        >
                            <option value="">All Months</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2" style={{ color: '#A3779D' }}>
                            Year
                        </label>
                        <select
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="form-select border shadow-sm"
                            style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px' }}
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="btn w-full"
                            style={{ border: '1px solid #E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px' }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Dashboard Tiles */}
            {!loading && summary && <DashboardTiles summary={summary} />}

            {/* Tables */}
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <IncomeTable
                        incomes={incomes}
                        onEdit={handleEditIncome}
                        onDelete={handleDeleteIncome}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <ExpenseTable
                        expenses={expenses}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                    />
                </motion.div>
            </div>

            {/* Modals */}
            <AddIncomeModal
                isOpen={showIncomeModal}
                onClose={handleCloseIncomeModal}
                onSubmit={editIncomeData ? handleUpdateIncome : handleAddIncome}
                editData={editIncomeData}
            />

            <AddExpenseModal
                isOpen={showExpenseModal}
                onClose={handleCloseExpenseModal}
                onSubmit={editExpenseData ? handleUpdateExpense : handleAddExpense}
                editData={editExpenseData}
            />
        </div>
    );
};

export default Accounts;
