/**
 * Utility script to help create required Firestore indexes
 * Run this script to get the URLs for creating the required indexes
 */

const { InvoiceModel } = require('../models/InvoiceModel');

async function showIndexUrls() {
  console.log('\n=== Firestore Index Creation URLs ===\n');
  
  const urls = InvoiceModel.getIndexCreationUrls();
  
  console.log('1. Main Invoices Index (isReturn + createdAt):');
  console.log(urls.mainInvoices);
  console.log('\n2. Return Invoices Index (originalInvoiceId + isReturn + invoiceNumber):');
  console.log(urls.returnInvoices);
  
  console.log('\n=== Instructions ===');
  console.log('1. Click on each URL above');
  console.log('2. Sign in to your Firebase console');
  console.log('3. Click "Create Index" on each page');
  console.log('4. Wait for indexes to build (may take a few minutes)');
  console.log('5. Restart your server after indexes are built');
  
  console.log('\n=== Alternative Solution ===');
  console.log('If you prefer not to create indexes, the system will work with in-memory filtering.');
  console.log('This is slower but doesn\'t require index creation.');
}

// Run if called directly
if (require.main === module) {
  showIndexUrls().catch(console.error);
}

module.exports = { showIndexUrls }; 