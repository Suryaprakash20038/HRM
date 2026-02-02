# 💳 Accounts Module - Payment Details Feature

## 📝 Overview
We have enhanced the Accounts Module to support detailed payment information based on the selected payment method. This allows for better tracking of transactions, including UPI IDs, bank details, cheque numbers, and card information.

---

## 🚀 New Features

### 1. Conditional Payment Fields
The "Add Income" and "Add Expense" forms now dynamically show relevant fields based on the selected **Payment Method**:

| Payment Method | Additional Fields Shown |
|----------------|-------------------------|
| **UPI** | • UPI ID (Required)<br>• Transaction ID (Optional) |
| **Bank Transfer** | • Bank Name (Required)<br>• Account Number (Required)<br>• IFSC Code (Required)<br>• Transaction ID (Optional) |
| **Cheque** | • Cheque Number (Required)<br>• Bank Name (Optional) |
| **Credit/Debit Card** | • Last 4 Digits (Required)<br>• Transaction ID (Optional) |
| **Cash** | *No additional fields* |
| **Other** | *No additional fields* |

### 2. Backend Updates
- **Income Model**: Added fields for `upiId`, `bankName`, `accountNumber`, `ifscCode`, `chequeNumber`, `cardLastFourDigits`, `transactionId`.
- **Expense Model**: Added same fields as Income model.
- **Controller**: Updated `create` and `update` functions to handle these new fields.

---

## 💻 Technical Details

### Updated Data Model (Income & Expense)
```javascript
{
    // ... existing fields ...
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cheque', 'Other'],
        default: 'Cash'
    },
    // New Conditional Fields
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    chequeNumber: String,
    cardLastFourDigits: String, // Max 4 chars
    transactionId: String
}
```

### API Endpoints
The API endpoints remain the same, but now accept these additional fields in the request body.

- `POST /api/accounts/income`
- `PUT /api/accounts/income/:id`
- `POST /api/accounts/expense`
- `PUT /api/accounts/expense/:id`

---

## 🧪 How to Test

1. **Navigate to Accounts Page**: Go to `/accounts`.
2. **Click "Add Income"**: Open the modal.
3. **Select Payment Method**:
   - Choose **UPI**: Verify "UPI ID" field appears.
   - Choose **Bank Transfer**: Verify Bank details fields appear.
   - Choose **Cheque**: Verify Cheque number field appears.
4. **Submit Form**: Fill in the details and submit.
5. **Verify**: Check if the record is created successfully.

---

## 🎨 UI/UX Improvements
- **Dynamic Forms**: Fields appear/disappear smoothly using conditional rendering.
- **Color Coding**:
  - **UPI**: Blue theme
  - **Bank Transfer**: Purple theme
  - **Cheque**: Yellow theme
  - **Cards**: Indigo theme
- **Validation**: Specific validation rules for each payment method (e.g., UPI ID is required if UPI is selected).

---

**Status**: ✅ Implemented & Ready
**Date**: December 5, 2024
