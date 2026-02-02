# 📊 Accounts Module - Complete Documentation

## Overview
The Accounts Module is a comprehensive financial management system for your HRM application. It allows you to track income and expenses, view financial summaries, and generate reports with advanced filtering capabilities.

## ✨ Features

### 1. **Dashboard Tiles**
- **Total Income**: Displays the total income across all time
- **Total Expense**: Shows total expenses
- **Balance**: Calculates net balance (Income - Expense)
- **This Month Income**: Current month's income
- **This Month Expense**: Current month's expenses

### 2. **Advanced Filters**
- **Date Range Filter**: Filter by custom start and end dates
- **Monthly Filter**: View data for a specific month
- **Yearly Filter**: Filter by year
- **Category Filter**: Filter by income/expense categories

### 3. **Income Management**
- Add new income records
- Edit existing income
- Delete income records
- Categories: Sales, Services, Investment, Refund, Other
- Track payment methods: Cash, Bank Transfer, Credit Card, Debit Card, UPI, Cheque, Other

### 4. **Expense Management**
- Add new expense records
- Edit existing expenses
- Delete expense records
- Categories: Salary, Rent, Utilities, Marketing, Office Supplies, Travel, Equipment, Other
- Track payment methods: Cash, Bank Transfer, Credit Card, Debit Card, UPI, Cheque, Other

### 5. **Data Tables**
- Sortable income and expense tables
- Display: Title, Category, Amount, Date, Payment Type, Created By, Note
- Edit and Delete actions for each record
- Empty state messages

### 6. **Modals**
- Beautiful animated modals for adding/editing records
- Form validation
- Success/Error notifications
- Responsive design

## 🚀 Getting Started

### Backend Setup

1. **Models Created**:
   - `Income.js` - Located at: `backend/src/models/Income/Income.js`
   - `Expense.js` - Located at: `backend/src/models/Expense/Expense.js`

2. **Controller Created**:
   - `accounts.controller.js` - Located at: `backend/src/controllers/accounts/accounts.controller.js`

3. **Routes Created**:
   - `accounts.routes.js` - Located at: `backend/src/routes/accounts/accounts.routes.js`

4. **Routes Integrated**:
   - Added to main routes in `backend/src/routes/index/index.js`

### Frontend Setup

1. **Service Created**:
   - `accountsService.js` - Located at: `frontend/src/services/accountsService.js`

2. **Components Created**:
   - `DashboardTiles.jsx` - Financial summary tiles
   - `IncomeTable.jsx` - Income records table
   - `ExpenseTable.jsx` - Expense records table
   - `AddIncomeModal.jsx` - Add/Edit income modal
   - `AddExpenseModal.jsx` - Add/Edit expense modal
   - `Accounts.jsx` - Main accounts page

3. **Route Added**:
   - Path: `/accounts`
   - Already integrated in `App.jsx`
   - Already added to Sidebar navigation

## 📡 API Endpoints

### Income Endpoints

```
POST   /api/accounts/income          - Create new income
GET    /api/accounts/income          - Get all income (with filters)
GET    /api/accounts/income/:id      - Get single income
PUT    /api/accounts/income/:id      - Update income
DELETE /api/accounts/income/:id      - Delete income
```

### Expense Endpoints

```
POST   /api/accounts/expense         - Create new expense
GET    /api/accounts/expense         - Get all expense (with filters)
GET    /api/accounts/expense/:id     - Get single expense
PUT    /api/accounts/expense/:id     - Update expense
DELETE /api/accounts/expense/:id     - Delete expense
```

### Summary & Reports

```
GET    /api/accounts/summary         - Get financial summary
GET    /api/accounts/monthly-report  - Get monthly report
```

## 🔒 Authentication & Authorization

All endpoints are protected and require:
- Valid JWT token in Authorization header
- User must be authenticated
- CompanyId is automatically extracted from `req.user.companyId`

## 📊 Data Models

### Income Schema
```javascript
{
  title: String (required),
  amount: Number (required, min: 0),
  category: String (required, enum: ['Sales', 'Services', 'Investment', 'Refund', 'Other']),
  date: Date (required),
  note: String (max: 500 chars),
  paymentMethod: String (required, enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Other']),
  companyId: ObjectId (required, auto-filled),
  createdBy: ObjectId (required, auto-filled),
  timestamps: true
}
```

### Expense Schema
```javascript
{
  title: String (required),
  amount: Number (required, min: 0),
  category: String (required, enum: ['Salary', 'Rent', 'Utilities', 'Marketing', 'Office Supplies', 'Travel', 'Equipment', 'Other']),
  date: Date (required),
  note: String (max: 500 chars),
  paymentMethod: String (required, enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Other']),
  companyId: ObjectId (required, auto-filled),
  createdBy: ObjectId (required, auto-filled),
  timestamps: true
}
```

## 🎨 UI/UX Features

### Design Elements
- **Premium Card UI**: Modern glassmorphism design
- **Gradient Colors**: Beautiful color schemes for income (green) and expense (red)
- **Smooth Animations**: Framer Motion animations for all interactions
- **Responsive Layout**: Works on all screen sizes
- **Icons**: Lucide React icons for better visual appeal
- **Light Theme**: Clean and professional light theme

### User Interactions
- **Add Records**: Click "Add Income" or "Add Expense" buttons
- **Edit Records**: Click edit icon in table rows
- **Delete Records**: Click delete icon (with confirmation)
- **Filter Data**: Use filter section to narrow down results
- **View Summary**: Dashboard tiles show real-time financial summary

## 🔍 Filter Examples

### Date Range Filter
```javascript
// Filter income/expense between two dates
startDate: '2024-01-01'
endDate: '2024-12-31'
```

### Monthly Filter
```javascript
// Filter for a specific month
month: '12'  // December
year: '2024'
```

### Yearly Filter
```javascript
// Filter for entire year
year: '2024'
```

## 💡 Usage Examples

### Adding Income
1. Click "Add Income" button
2. Fill in the form:
   - Title: "Client Payment"
   - Amount: 50000
   - Category: "Sales"
   - Date: Select date
   - Payment Method: "Bank Transfer"
   - Note: "Payment from ABC Corp"
3. Click "Add Income"
4. Success notification appears

### Filtering Data
1. Select filters in the filter section
2. Data automatically updates
3. Click "Clear Filters" to reset

### Viewing Summary
- Dashboard tiles update automatically based on filters
- Shows total income, expense, balance, and current month data

## 🛠️ Technical Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation

## 🔐 Multi-Company Support

The module automatically handles multi-company scenarios:
- All queries are filtered by `companyId`
- CompanyId is automatically extracted from authenticated user
- Each company sees only their own financial data

## 📱 Responsive Design

The module is fully responsive:
- **Desktop**: Full layout with all features
- **Tablet**: Optimized grid layout
- **Mobile**: Stacked layout with touch-friendly controls

## 🎯 Best Practices

1. **Always validate input** - Both frontend and backend validation
2. **Use filters wisely** - Combine filters for precise data
3. **Regular backups** - Keep financial data backed up
4. **Audit trail** - CreatedBy field tracks who added records
5. **Date accuracy** - Ensure correct dates for accurate reports

## 🚨 Error Handling

The module includes comprehensive error handling:
- Form validation errors
- API error messages
- Network error handling
- User-friendly notifications

## 📈 Future Enhancements

Potential features to add:
- Export to Excel/PDF
- Charts and graphs
- Budget planning
- Recurring transactions
- Multi-currency support
- Tax calculations
- Invoice generation

## 🎉 Success!

Your Accounts Module is now fully integrated and ready to use!

Navigate to `/accounts` in your application to start managing your finances.

---

**Created with ❤️ for HRM Project**
