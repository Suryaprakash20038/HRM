# 📁 Accounts Module - File Structure

```
HRM/
│
├── backend/
│   └── src/
│       ├── models/
│       │   ├── Income/
│       │   │   └── Income.js ✅ NEW
│       │   └── Expense/
│       │       └── Expense.js ✅ NEW
│       │
│       ├── controllers/
│       │   └── accounts/
│       │       └── accounts.controller.js ✅ NEW
│       │
│       └── routes/
│           ├── accounts/
│           │   └── accounts.routes.js ✅ NEW
│           └── index/
│               └── index.js ✏️ UPDATED
│
├── frontend/
│   └── frontend/
│       └── src/
│           ├── services/
│           │   └── accountsService.js ✅ NEW
│           │
│           ├── pages/
│           │   └── Accounts/
│           │       ├── Accounts.jsx ✅ NEW (Main Page)
│           │       ├── DashboardTiles.jsx ✅ NEW
│           │       ├── IncomeTable.jsx ✅ NEW
│           │       ├── ExpenseTable.jsx ✅ NEW
│           │       ├── AddIncomeModal.jsx ✅ NEW
│           │       └── AddExpenseModal.jsx ✅ NEW
│           │
│           └── App.jsx ✏️ UPDATED
│
└── Documentation/
    ├── ACCOUNTS_MODULE_DOCUMENTATION.md ✅ NEW
    ├── ACCOUNTS_QUICK_START.md ✅ NEW
    ├── ACCOUNTS_IMPLEMENTATION_SUMMARY.md ✅ NEW
    ├── ACCOUNTS_FINAL_CHECKLIST.md ✅ NEW
    └── ACCOUNTS_FILE_STRUCTURE.md ✅ NEW (This file)
```

## 📊 File Count Summary

### Backend Files
- **Models**: 2 files (Income.js, Expense.js)
- **Controllers**: 1 file (accounts.controller.js)
- **Routes**: 1 file (accounts.routes.js)
- **Updated**: 1 file (index.js)
- **Total Backend**: 5 files

### Frontend Files
- **Services**: 1 file (accountsService.js)
- **Components**: 6 files (Accounts.jsx, DashboardTiles.jsx, IncomeTable.jsx, ExpenseTable.jsx, AddIncomeModal.jsx, AddExpenseModal.jsx)
- **Updated**: 1 file (App.jsx)
- **Total Frontend**: 8 files

### Documentation Files
- **Docs**: 5 files (Documentation, Quick Start, Summary, Checklist, File Structure)
- **Total Docs**: 5 files

### Grand Total
**18 files** (5 backend + 8 frontend + 5 documentation)

## 🔍 File Details

### Backend Models

#### Income.js
```
Location: backend/src/models/Income/Income.js
Purpose: Mongoose schema for income records
Fields: title, amount, category, date, note, paymentMethod, companyId, createdBy
Lines: ~50
```

#### Expense.js
```
Location: backend/src/models/Expense/Expense.js
Purpose: Mongoose schema for expense records
Fields: title, amount, category, date, note, paymentMethod, companyId, createdBy
Lines: ~50
```

### Backend Controllers

#### accounts.controller.js
```
Location: backend/src/controllers/accounts/accounts.controller.js
Purpose: Business logic for all accounts operations
Functions: 
  - createIncome, getAllIncome, getIncomeById, updateIncome, deleteIncome
  - createExpense, getAllExpense, getExpenseById, updateExpense, deleteExpense
  - getSummary, getMonthlyReport
Lines: ~580
```

### Backend Routes

#### accounts.routes.js
```
Location: backend/src/routes/accounts/accounts.routes.js
Purpose: API route definitions
Endpoints: 11 endpoints (5 income + 5 expense + 1 summary + 1 report)
Lines: ~30
```

### Frontend Services

#### accountsService.js
```
Location: frontend/src/services/accountsService.js
Purpose: API integration layer
Functions: 
  - createIncome, getAllIncome, getIncomeById, updateIncome, deleteIncome
  - createExpense, getAllExpense, getExpenseById, updateExpense, deleteExpense
  - getSummary, getMonthlyReport
Lines: ~140
```

### Frontend Components

#### Accounts.jsx (Main Page)
```
Location: frontend/src/pages/Accounts/Accounts.jsx
Purpose: Main accounts page with all functionality
Features: Filters, tables, modals, notifications
Lines: ~400
```

#### DashboardTiles.jsx
```
Location: frontend/src/pages/Accounts/DashboardTiles.jsx
Purpose: Display financial summary tiles
Tiles: 5 (Total Income, Total Expense, Balance, This Month Income, This Month Expense)
Lines: ~80
```

#### IncomeTable.jsx
```
Location: frontend/src/pages/Accounts/IncomeTable.jsx
Purpose: Display income records in table format
Features: Edit, Delete, Empty state
Lines: ~150
```

#### ExpenseTable.jsx
```
Location: frontend/src/pages/Accounts/ExpenseTable.jsx
Purpose: Display expense records in table format
Features: Edit, Delete, Empty state
Lines: ~150
```

#### AddIncomeModal.jsx
```
Location: frontend/src/pages/Accounts/AddIncomeModal.jsx
Purpose: Modal for adding/editing income
Features: Form validation, animations
Lines: ~250
```

#### AddExpenseModal.jsx
```
Location: frontend/src/pages/Accounts/AddExpenseModal.jsx
Purpose: Modal for adding/editing expense
Features: Form validation, animations
Lines: ~250
```

## 🎨 Component Hierarchy

```
Accounts.jsx (Main Page)
│
├── DashboardTiles.jsx
│   ├── Tile: Total Income
│   ├── Tile: Total Expense
│   ├── Tile: Balance
│   ├── Tile: This Month Income
│   └── Tile: This Month Expense
│
├── IncomeTable.jsx
│   ├── Table Header
│   ├── Table Rows (Income Records)
│   └── Empty State
│
├── ExpenseTable.jsx
│   ├── Table Header
│   ├── Table Rows (Expense Records)
│   └── Empty State
│
├── AddIncomeModal.jsx
│   ├── Modal Header
│   ├── Form Fields
│   └── Action Buttons
│
└── AddExpenseModal.jsx
    ├── Modal Header
    ├── Form Fields
    └── Action Buttons
```

## 🔄 Data Flow

```
User Action
    ↓
Accounts.jsx (Main Page)
    ↓
accountsService.js (API Call)
    ↓
accounts.routes.js (Backend Route)
    ↓
accounts.controller.js (Business Logic)
    ↓
Income/Expense Model (Database)
    ↓
Response Back to Frontend
    ↓
Update UI Components
```

## 📦 Dependencies

### Backend Dependencies
- mongoose (for models)
- express (for routes)
- JWT middleware (for authentication)

### Frontend Dependencies
- react (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- framer-motion (animations)
- lucide-react (icons)
- tailwindcss (styling)

## 🎯 Integration Points

### Backend Integration
1. **Main Router**: `backend/src/routes/index/index.js`
   - Added: `const accountsRoutes = require('../accounts/accounts.routes');`
   - Added: `router.use('/accounts', accountsRoutes);`

### Frontend Integration
1. **App.jsx**: `frontend/src/App.jsx`
   - Added: `import Accounts from "./pages/Accounts/Accounts";`
   - Added: Route for `/accounts`

2. **Sidebar**: Already has Accounts menu item (no changes needed)

## ✅ Status

All files are created and integrated successfully!

**Next Step**: Restart servers and test the module.

---

**File Structure Complete! 📁**
