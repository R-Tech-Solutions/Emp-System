# Return System Documentation

## Overview

The return system has been updated to create return invoices instead of deleting original invoices. This provides better audit trails and financial tracking. **Return invoices use negative amounts to properly reduce income in the cashbook system.**

## Key Changes

### 1. Return Invoice Creation
- **Format**: `rtn-[original_invoice_number]` (e.g., `rtn-Inv-01`)
- **Storage**: Same collection as regular invoices with `isReturn: true` flag
- **Linking**: Return invoices are linked to original invoices via `originalInvoiceId`
- **Negative Amounts**: All monetary amounts are negative to reduce income

### 2. Original Invoice Handling
- **No Deletion**: Original invoices are never deleted
- **Status Updates**: 
  - `isFullyReturned: true` when all items are returned
  - `isPartiallyReturned: true` when some items are returned
  - `returnInvoiceId` links to the created return invoice

### 3. Monetary Calculations
- **Negative Return Amount**: Calculated based on returned items (negative values)
- **Proportional Logic**: Discount and tax are proportionally calculated and made negative
- **Refund Tracking**: Return amount is stored as positive value for display purposes
- **Cashbook Impact**: Negative amounts reduce income instead of adding to it

## Database Schema

### Return Invoice Fields
```javascript
{
  invoiceNumber: "rtn-Inv-01",
  originalInvoiceId: "Inv-01",
  originalInvoiceRef: "Inv-01",
  customer: [...], // Same as original invoice
  items: [...], // Returned items only
  subtotal: -135.00, // NEGATIVE for returns
  discountAmount: -15.00, // NEGATIVE for returns
  taxAmount: -9.00, // NEGATIVE for returns
  total: -129.00, // NEGATIVE total for returns
  returnAmount: 129.00, // POSITIVE amount for display
  returnReason: "Customer request",
  isReturn: true,
  returnType: "refund",
  paymentMethod: "Cash",
  paymentStatus: "Refunded", // Mark as refunded
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

### Original Invoice Updates
```javascript
{
  // ... existing fields
  isFullyReturned: true, // or isPartiallyReturned: true
  returnInvoiceId: "rtn-Inv-01",
  // Updated totals for remaining items
}
```

## API Endpoints

### Return Processing
- `POST /api/returns` - Process return and create return invoice

### Return Invoice Queries
- `GET /api/invoices?type=return` - Get all return invoices
- `GET /api/invoices?type=regular` - Get regular invoices only
- `GET /api/invoices/returns/all` - Get all return invoices
- `GET /api/invoices/returns/original/:originalInvoiceId` - Get return invoices for specific original invoice

## Business Logic

### Return Amount Calculation (Negative Values)
1. Calculate subtotal of returned items
2. Calculate proportional discount: `(returnSubtotal / originalSubtotal) * originalDiscount`
3. Calculate proportional tax: `(returnSubtotal / originalSubtotal) * originalTax`
4. **Make all amounts negative**: `-returnSubtotal`, `-returnDiscount`, `-returnTax`
5. Return total = `-(returnSubtotal - returnDiscount + returnTax)`
6. Store positive `returnAmount` for display purposes

### Cashbook/Income Impact
- **Regular Invoice**: `+total` (adds to income)
- **Return Invoice**: `-total` (reduces income)
- **Net Effect**: Proper accounting for returns

### Example Calculation
```
Original Invoice: Inv-01
- Subtotal: 225.00
- Discount: 25.00
- Tax: 15.00
- Total: 215.00

Returned Items: 135.00 worth
- Return Ratio: 135/225 = 0.6
- Return Subtotal: -135.00 (negative)
- Return Discount: -15.00 (negative)
- Return Tax: -9.00 (negative)
- Return Total: -129.00 (negative)
- Display Amount: 129.00 (positive)
```

### Inventory Updates
- Returned quantities are added back to inventory
- Product identifiers (IMEI/Serial) are updated based on return type
- Damaged/Opened items are tracked separately

### Return Types
- **Good**: Items returned in original condition
- **Damaged**: Items returned in damaged condition
- **Opened**: Items returned after being opened/used

## Frontend Integration

The frontend now displays:
- Return invoice number after successful return
- Return amount in success messages (positive value for display)
- Enhanced return tracking information

## Benefits

1. **Audit Trail**: Complete history of all transactions
2. **Financial Accuracy**: Proper refund tracking with negative amounts
3. **Cashbook Integration**: Returns properly reduce income
4. **Customer Service**: Better return processing
5. **Reporting**: Enhanced reporting capabilities
6. **Compliance**: Better record keeping for tax purposes

## Accounting Impact

- **Income Reduction**: Return invoices reduce total income
- **Proper Balancing**: Negative amounts ensure correct financial statements
- **Refund Tracking**: Clear separation between sales and returns
- **Tax Implications**: Proper handling of tax on returned items 