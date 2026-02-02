# 🚀 Accounts Module - Quick Start Guide

## Step 1: Start the Backend Server

```bash
cd backend
npm start
```

The backend should be running on `http://localhost:5000`

## Step 2: Start the Frontend Server

```bash
cd frontend/frontend
npm run dev
```

The frontend should be running on `http://localhost:5173` or `http://localhost:5174`

## Step 3: Login to the Application

1. Open your browser and navigate to the frontend URL
2. Login with your credentials
3. You should see the HRM dashboard

## Step 4: Navigate to Accounts Module

1. Look for "Accounts" in the sidebar menu (it has a chart pie icon)
2. Click on "Accounts"
3. You should see the Accounts Module page

## Step 5: Test the Features

### Add Your First Income
1. Click the green "Add Income" button
2. Fill in the form:
   - **Title**: "Test Income"
   - **Amount**: 10000
   - **Category**: Select "Sales"
   - **Date**: Today's date
   - **Payment Method**: "Cash"
   - **Note**: "Testing income module"
3. Click "Add Income"
4. You should see a success notification
5. The income should appear in the Income Records table

### Add Your First Expense
1. Click the red "Add Expense" button
2. Fill in the form:
   - **Title**: "Test Expense"
   - **Amount**: 5000
   - **Category**: Select "Office Supplies"
   - **Date**: Today's date
   - **Payment Method**: "Cash"
   - **Note**: "Testing expense module"
3. Click "Add Expense"
4. You should see a success notification
5. The expense should appear in the Expense Records table

### Check the Dashboard Tiles
After adding income and expense, you should see:
- **Total Income**: ₹10,000
- **Total Expense**: ₹5,000
- **Balance**: ₹5,000
- **This Month Income**: ₹10,000
- **This Month Expense**: ₹5,000

### Test Filters
1. Try the **Monthly Filter**:
   - Select current month
   - Select current year
   - Data should update

2. Try the **Date Range Filter**:
   - Set start date to beginning of month
   - Set end date to today
   - Data should update

3. **Clear Filters**:
   - Click "Clear Filters" button
   - All data should show again

### Test Edit Functionality
1. Click the edit icon (pencil) on any income/expense record
2. Modify the data
3. Click "Update Income" or "Update Expense"
4. Changes should be reflected in the table

### Test Delete Functionality
1. Click the delete icon (trash) on any record
2. Confirm the deletion
3. Record should be removed from the table

## ✅ Verification Checklist

- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Can login successfully
- [ ] Can navigate to Accounts page
- [ ] Can add income
- [ ] Can add expense
- [ ] Dashboard tiles show correct data
- [ ] Can filter by date range
- [ ] Can filter by month/year
- [ ] Can edit records
- [ ] Can delete records
- [ ] Notifications appear on actions
- [ ] Tables display data correctly

## 🐛 Troubleshooting

### Issue: Cannot see Accounts in sidebar
**Solution**: Make sure you're logged in and have the correct permissions

### Issue: API errors (500, 404)
**Solution**: 
1. Check if backend server is running
2. Check MongoDB connection
3. Verify API URL in `frontend/src/services/api.js` is correct

### Issue: Data not showing
**Solution**:
1. Check browser console for errors
2. Verify you're logged in
3. Check network tab for API responses

### Issue: Filters not working
**Solution**:
1. Clear all filters first
2. Apply one filter at a time
3. Check if dates are in correct format

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend terminal for errors
3. Verify all dependencies are installed
4. Make sure MongoDB is running

## 🎉 Success!

If all steps work correctly, your Accounts Module is fully functional!

You can now:
- Track all income and expenses
- View financial summaries
- Filter data by various criteria
- Manage financial records efficiently

---

**Happy Accounting! 💰**
