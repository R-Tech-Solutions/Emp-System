# Inventory Transaction Tracking

This document describes the transaction tracking feature implemented in the inventory management system.

## Overview

The inventory system now includes comprehensive transaction tracking that records all quantity changes (purchases and sales) with detailed information about each transaction.

## Features

### 1. Transaction Array Structure

Each inventory record now includes a `transactions` array that contains:

```javascript
{
  type: 'purchase' | 'sale',
  quantity: number,
  date: string (ISO date),
  reference: string (purchase ID or invoice ID),
  description: string,
  supplierEmail: string (for purchases),
  invoiceId: string (for sales)
}
```

### 2. Automatic Transaction Recording

Transactions are automatically recorded when:

- **Creating inventory**: Initial purchase transaction
- **Adding stock**: Purchase transaction with supplier details
- **Deducting stock**: Sale transaction with invoice details

### 3. API Endpoints

#### Get Transaction History
```
GET /api/inventory/:productId/transactions?limit=50&offset=0
```

**Response:**
```javascript
{
  productId: string,
  totalTransactions: number,
  transactions: Array,
  pagination: {
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

#### Deduct Stock (with transaction tracking)
```
POST /api/inventory/deduct
```

**Body:**
```javascript
{
  productId: string,
  quantity: number,
  invoiceId: string
}
```

#### Add Stock (with transaction tracking)
```
POST /api/inventory/update
```

**Body:**
```javascript
{
  productId: string,
  quantity: number,
  supplierEmail: string,
  invoiceId: string
}
```

## Frontend Integration

### Inventory Management Page

The Inventory Management page now includes:

1. **Transaction History Button**: View detailed transaction history for each product
2. **Transaction History Modal**: Displays all transactions with:
   - Date and time
   - Transaction type (Purchase/Sale)
   - Quantity changes
   - Description
   - Reference (Purchase ID or Invoice ID)
   - Supplier email (for purchases)

### Usage

1. Navigate to Inventory Management
2. Click the "Eye" icon to view product details
3. Click "📊 View Transaction History" button
4. View detailed transaction history in the modal

## Database Schema

### Inventory Collection Structure

```javascript
{
  productId: string,
  totalQuantity: number,
  supplierEmail: string,
  lastUpdated: string,
  purchases: Array, // Legacy field for backward compatibility
  transactions: Array // New transaction tracking field
}
```

### Transaction Object Structure

```javascript
{
  type: 'purchase' | 'sale',
  quantity: number,
  date: string,
  reference: string,
  description: string,
  supplierEmail: string, // Only for purchases
  invoiceId: string      // Only for sales
}
```

## Testing

Run the test script to verify transaction tracking:

```bash
cd backend/Test
node testTransactionTracking.js
```

This will test:
- Inventory creation with initial transaction
- Adding inventory (purchase transactions)
- Deducting inventory (sale transactions)
- Transaction history retrieval
- Error handling

## Benefits

1. **Complete Audit Trail**: Track every inventory movement
2. **Invoice Integration**: Link sales to specific invoices
3. **Purchase Tracking**: Link purchases to suppliers and purchase orders
4. **Historical Analysis**: Analyze inventory patterns over time
5. **Compliance**: Maintain detailed records for accounting and compliance

## Migration Notes

- Existing inventory records will work without the transactions array
- New transactions will be automatically added to existing records
- The system maintains backward compatibility with the existing purchases array

## Error Handling

- Insufficient stock errors are properly handled
- Invalid product IDs return appropriate error messages
- Transaction failures are logged for debugging

## Performance Considerations

- Transaction history is cached for 5 minutes
- Pagination is supported for large transaction histories
- Database queries are optimized for performance 