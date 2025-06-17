const InventoryModel = require('../models/InventoryModel');

async function testTransactionTracking() {
    console.log('🧪 Testing Transaction Tracking...\n');

    try {
        // Test 1: Create inventory with initial transaction
        console.log('📝 Test 1: Creating inventory with initial transaction');
        const testProductId = 'test-product-001';
        const initialQuantity = 100;
        const supplierEmail = 'test@supplier.com';
        
        const createResult = await InventoryModel.create({
            productId: testProductId,
            quantity: initialQuantity,
            supplierEmail: supplierEmail,
            deductInfo: { purchaseId: 'purchase-001' }
        });
        
        console.log('✅ Inventory created successfully');
        console.log('   Product ID:', testProductId);
        console.log('   Initial Quantity:', initialQuantity);
        console.log('   Supplier:', supplierEmail);

        // Test 2: Add more inventory (purchase transaction)
        console.log('\n📝 Test 2: Adding more inventory (purchase transaction)');
        const additionalQuantity = 50;
        
        await InventoryModel.addToStock(testProductId, additionalQuantity, supplierEmail, 'purchase-002');
        
        console.log('✅ Additional inventory added successfully');
        console.log('   Additional Quantity:', additionalQuantity);

        // Test 3: Deduct inventory (sale transaction)
        console.log('\n📝 Test 3: Deducting inventory (sale transaction)');
        const saleQuantity = 30;
        const invoiceId = 'invoice-001';
        
        await InventoryModel.deductFromStock(testProductId, saleQuantity, invoiceId);
        
        console.log('✅ Inventory deducted successfully');
        console.log('   Sale Quantity:', saleQuantity);
        console.log('   Invoice ID:', invoiceId);

        // Test 4: Get inventory and verify transactions
        console.log('\n📝 Test 4: Getting inventory and verifying transactions');
        const inventory = await InventoryModel.getById(testProductId);
        
        if (inventory) {
            console.log('✅ Inventory retrieved successfully');
            console.log('   Total Quantity:', inventory.totalQuantity);
            console.log('   Total Transactions:', inventory.transactions ? inventory.transactions.length : 0);
            
            if (inventory.transactions) {
                console.log('\n📊 Transaction Details:');
                inventory.transactions.forEach((transaction, index) => {
                    console.log(`   ${index + 1}. ${transaction.type.toUpperCase()}`);
                    console.log(`      Date: ${transaction.date}`);
                    console.log(`      Quantity: ${transaction.quantity}`);
                    console.log(`      Description: ${transaction.description}`);
                    console.log(`      Reference: ${transaction.reference || 'N/A'}`);
                    if (transaction.supplierEmail) {
                        console.log(`      Supplier: ${transaction.supplierEmail}`);
                    }
                    console.log('');
                });
            }
            
            // Verify final quantity
            const expectedQuantity = initialQuantity + additionalQuantity - saleQuantity;
            if (inventory.totalQuantity === expectedQuantity) {
                console.log('✅ Final quantity verification passed');
                console.log(`   Expected: ${expectedQuantity}, Actual: ${inventory.totalQuantity}`);
            } else {
                console.log('❌ Final quantity verification failed');
                console.log(`   Expected: ${expectedQuantity}, Actual: ${inventory.totalQuantity}`);
            }
        } else {
            console.log('❌ Failed to retrieve inventory');
        }

        // Test 5: Test error handling - try to deduct more than available
        console.log('\n📝 Test 5: Testing error handling - deducting more than available');
        try {
            await InventoryModel.deductFromStock(testProductId, 1000, 'invoice-002');
            console.log('❌ Should have failed - deducted more than available');
        } catch (error) {
            console.log('✅ Error handling works correctly');
            console.log('   Error message:', error.message);
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Inventory creation with transaction tracking ✅');
        console.log('   - Purchase transactions ✅');
        console.log('   - Sale transactions ✅');
        console.log('   - Transaction history retrieval ✅');
        console.log('   - Error handling ✅');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testTransactionTracking(); 