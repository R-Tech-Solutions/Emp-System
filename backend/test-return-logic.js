const InvoiceModel = require('./models/InvoiceModel');

// Test the new return invoice creation logic
async function testReturnInvoiceCreation() {
  console.log('Testing Return Invoice Creation with Negative Amounts...\n');

  // Mock original invoice data
  const originalInvoice = {
    invoiceNumber: 'Inv-01',
    customer: [{ customerName: 'Test Customer', customerPhone: '1234567890' }],
    customerId: 'cust-001',
    customerName: 'Test Customer',
    customerPhone: '1234567890',
    customerEmail: 'test@example.com',
    items: [
      {
        id: 'prod-001',
        name: 'Test Product 1',
        price: 100,
        discountedPrice: 90,
        quantity: 2
      },
      {
        id: 'prod-002',
        name: 'Test Product 2',
        price: 50,
        discountedPrice: 45,
        quantity: 1
      }
    ],
    subtotal: 225, // (90 * 2) + (45 * 1)
    discountAmount: 25,
    taxAmount: 15,
    total: 215,
    paymentMethod: 'Cash'
  };

  // Mock returned items (returning one item from each product)
  const returnedItems = [
    {
      id: 'prod-001',
      name: 'Test Product 1',
      price: 100,
      discountedPrice: 90,
      quantity: 1,
      returnType: 'Good'
    },
    {
      id: 'prod-002',
      name: 'Test Product 2',
      price: 50,
      discountedPrice: 45,
      quantity: 1,
      returnType: 'Damaged'
    }
  ];

  const returnReason = 'Customer request';

  try {
    // Test the return invoice creation
    const returnInvoice = await InvoiceModel.createReturnInvoice(
      originalInvoice,
      returnedItems,
      returnReason
    );

    console.log('✅ Return Invoice Created Successfully!');
    console.log('Return Invoice Number:', returnInvoice.invoiceNumber);
    console.log('Original Invoice ID:', returnInvoice.originalInvoiceId);
    console.log('Return Amount (for display):', returnInvoice.returnAmount);
    console.log('Return Subtotal (negative):', returnInvoice.subtotal);
    console.log('Return Discount (negative):', returnInvoice.discountAmount);
    console.log('Return Tax (negative):', returnInvoice.taxAmount);
    console.log('Return Total (negative):', returnInvoice.total);
    console.log('Is Return:', returnInvoice.isReturn);
    console.log('Payment Status:', returnInvoice.paymentStatus);
    console.log('Return Reason:', returnInvoice.returnReason);

    // Verify calculations
    const expectedSubtotal = 90 + 45; // 135
    const expectedRatio = expectedSubtotal / originalInvoice.subtotal; // 135 / 225 = 0.6
    const expectedDiscount = originalInvoice.discountAmount * expectedRatio; // 25 * 0.6 = 15
    const expectedTax = originalInvoice.taxAmount * expectedRatio; // 15 * 0.6 = 9
    const expectedTotal = expectedSubtotal - expectedDiscount + expectedTax; // 135 - 15 + 9 = 129

    // For returns, amounts should be negative
    const expectedNegativeSubtotal = -expectedSubtotal; // -135
    const expectedNegativeDiscount = -expectedDiscount; // -15
    const expectedNegativeTax = -expectedTax; // -9
    const expectedNegativeTotal = -expectedTotal; // -129

    console.log('\n📊 Calculation Verification (Negative Amounts):');
    console.log('Expected Negative Subtotal:', expectedNegativeSubtotal, '| Actual:', returnInvoice.subtotal);
    console.log('Expected Negative Discount:', expectedNegativeDiscount, '| Actual:', returnInvoice.discountAmount);
    console.log('Expected Negative Tax:', expectedNegativeTax, '| Actual:', returnInvoice.taxAmount);
    console.log('Expected Negative Total:', expectedNegativeTotal, '| Actual:', returnInvoice.total);
    console.log('Return Amount (Positive):', returnInvoice.returnAmount, '| Expected:', Math.abs(expectedNegativeTotal));

    // Check if calculations are correct (with small tolerance for floating point)
    const tolerance = 0.01;
    const isCorrect = 
      Math.abs(returnInvoice.subtotal - expectedNegativeSubtotal) < tolerance &&
      Math.abs(returnInvoice.discountAmount - expectedNegativeDiscount) < tolerance &&
      Math.abs(returnInvoice.taxAmount - expectedNegativeTax) < tolerance &&
      Math.abs(returnInvoice.total - expectedNegativeTotal) < tolerance &&
      Math.abs(returnInvoice.returnAmount - Math.abs(expectedNegativeTotal)) < tolerance;

    if (isCorrect) {
      console.log('\n✅ All calculations are correct!');
      console.log('✅ Return invoice will properly reduce income in cashbook system');
    } else {
      console.log('\n❌ Calculation mismatch detected!');
    }

    // Verify that amounts are negative
    const isNegative = 
      returnInvoice.subtotal < 0 &&
      returnInvoice.discountAmount < 0 &&
      returnInvoice.taxAmount < 0 &&
      returnInvoice.total < 0;

    if (isNegative) {
      console.log('✅ All monetary amounts are negative (correct for returns)');
    } else {
      console.log('❌ Some amounts are not negative (incorrect for returns)');
    }

  } catch (error) {
    console.error('❌ Error testing return invoice creation:', error);
  }
}

// Run the test
testReturnInvoiceCreation().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 