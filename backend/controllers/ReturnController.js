const { ReturnModel, DamagedReturnModel, OpenedReturnModel } = require('../models/ReturnModel');
const InvoiceModel = require('../models/InvoiceModel');
const SerialModel = require('../models/SerialModel');
const ImeiModel = require('../models/ImeiModel');
const { db } = require('../firebaseConfig');
const InventoryModel = require('../models/InventoryModel');

// Helper to mark serial/imei as unsold and clear damaged/opened
async function markIdentifierUnsold(productId, identifierType, identifierValue) {
  if (identifierType === 'serial') {
    const doc = await SerialModel.collection.doc(productId).get();
    if (!doc.exists) return;
    const data = doc.data();
    const updatedIdentifiers = data.identifiers.map(item => {
      if (item.serial === identifierValue) {
        return { ...item, sold: false, soldAt: null, invoiceId: null, damaged: false, opened: false };
      }
      return item;
    });
    await SerialModel.collection.doc(productId).update({ identifiers: updatedIdentifiers });
  } else if (identifierType === 'imei') {
    const doc = await ImeiModel.collection.doc(productId).get();
    if (!doc.exists) return;
    const data = doc.data();
    const updatedIdentifiers = data.identifiers.map(item => {
      if (item.imei === identifierValue) {
        return { ...item, sold: false, soldAt: null, invoiceId: null, damaged: false, opened: false };
      }
      return item;
    });
    await ImeiModel.collection.doc(productId).update({ identifiers: updatedIdentifiers });
  }
}

// Helper to mark serial/imei as unsold and set damaged/opened, and set productStatus and quantity
async function markIdentifierDamagedOrOpened(productId, identifierType, identifierValue, type) {
  const flag = type === 'Damaged' ? { damaged: true, opened: false, productStatus: 'Damaged' } : { damaged: false, opened: true, productStatus: 'Opened' };
  if (identifierType === 'serial') {
    const doc = await SerialModel.collection.doc(productId).get();
    if (!doc.exists) return;
    const data = doc.data();
    const updatedIdentifiers = data.identifiers.map(item => {
      if (item.serial === identifierValue) {
        // Increment quantity if present, else set to 1
        const newQuantity = (item.quantity || 0) + 1;
        return { ...item, sold: false, soldAt: null, invoiceId: null, ...flag, quantity: newQuantity };
      }
      return item;
    });
    await SerialModel.collection.doc(productId).update({ identifiers: updatedIdentifiers });
  } else if (identifierType === 'imei') {
    const doc = await ImeiModel.collection.doc(productId).get();
    if (!doc.exists) return;
    const data = doc.data();
    const updatedIdentifiers = data.identifiers.map(item => {
      if (item.imei === identifierValue) {
        // Increment quantity if present, else set to 1
        const newQuantity = (item.quantity || 0) + 1;
        return { ...item, sold: false, soldAt: null, invoiceId: null, ...flag, quantity: newQuantity };
      }
      return item;
    });
    await ImeiModel.collection.doc(productId).update({ identifiers: updatedIdentifiers });
  }
}

// Helper to add identifier to damaged/opened db, with productStatus and quantity
async function addDamagedOrOpenedIdentifier(type, productId, identifierType, identifierValue, returnNumber) {
  const collectionName = type === 'Damaged' ? 'damaged_identifiers' : 'opened_identifiers';
  // Try to find existing doc for this identifier
  const query = await db.collection(collectionName)
    .where('productId', '==', productId)
    .where('identifierType', '==', identifierType)
    .where('identifierValue', '==', identifierValue)
    .limit(1)
    .get();
  let quantity = 1;
  if (!query.empty) {
    // If exists, increment quantity
    const docRef = query.docs[0].ref;
    const docData = query.docs[0].data();
    quantity = (docData.quantity || 1) + 1;
    await docRef.update({ quantity, productStatus: type });
  } else {
    // If not exists, create new
    await db.collection(collectionName).add({
      productId,
      identifierType,
      identifierValue,
      returnNumber,
      createdAt: new Date(),
      productStatus: type,
      quantity: 1
    });
  }
}

exports.createReturn = async (req, res) => {
  try {
    const returnData = req.body;
    const { invoiceId, items, reason } = returnData;
    if (!invoiceId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'invoiceId and items are required.' });
    }

    // Fetch the invoice
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) return res.status(404).json({ error: 'Invoice not found.' });
    const invoiceData = invoiceDoc.data();
    const invoiceItems = invoiceData.items || [];

    // Build a set of returned item unique keys (id + identifierValue if present)
    const returnedKeys = new Set(items.map(item =>
      item.identifierValue ? `${item.id}__${item.identifierValue}` : `${item.id}`
    ));

    // Filter out returned items from invoice
    const remainingItems = invoiceItems.filter(item => {
      if (item.identifierType && item.identifierValue) {
        return !returnedKeys.has(`${item.id}__${item.identifierValue}`);
      }
      return !returnedKeys.has(`${item.id}`);
    });

    // Create return invoice for the returned items
    const returnInvoice = await InvoiceModel.createReturnInvoice(invoiceData, items, reason);

    // Update the original invoice with return status and return invoice number
    await InvoiceModel.updateInvoiceReturnStatus(invoiceId, returnInvoice.invoiceNumber);

    // Group items by returnType
    const itemsByType = { Good: [], Damaged: [], Opened: [] };
    for (const item of items) {
      if (!item.returnType) continue;
      if (!itemsByType[item.returnType]) itemsByType[item.returnType] = [];
      itemsByType[item.returnType].push(item);
    }

    const results = [];
    // Process Good returns
    if (itemsByType.Good && itemsByType.Good.length) {
      // Group returned items by productId and sum quantity
      const productQtyMap = {};
      for (const item of itemsByType.Good) {
        const pid = item.mainProductId || item.id;
        if (!productQtyMap[pid]) productQtyMap[pid] = 0;
        productQtyMap[pid] += item.quantity || 1;
      }
      // Save in returns collection (get returnNumber)
      const result = await ReturnModel.create({ 
        ...returnData, 
        returnType: 'Good', 
        items: itemsByType.Good, 
        invoiceRef: invoiceId,
        returnInvoiceId: returnInvoice.invoiceNumber,
        returnAmount: returnInvoice.returnAmount
      });
      const returnNumber = result.returnNumber;
      // Add returned quantity back to inventory (once per product)
      for (const pid in productQtyMap) {
        await InventoryModel.addToStock(pid, productQtyMap[pid]);
        InventoryModel.clearCache(pid);
      }
      // For each item, if serial/imei, mark as unsold and clear damaged/opened
      for (const item of itemsByType.Good) {
        if (item.identifierType && item.identifierValue) {
          await markIdentifierUnsold(item.mainProductId || item.id, item.identifierType, item.identifierValue);
        }
      }
      results.push({ type: 'Good', ...result });
    }
    // Process Damaged returns
    if (itemsByType.Damaged && itemsByType.Damaged.length) {
      const result = await DamagedReturnModel.create({ 
        ...returnData, 
        returnType: 'Damaged', 
        items: itemsByType.Damaged, 
        invoiceRef: invoiceId,
        returnInvoiceId: returnInvoice.invoiceNumber,
        returnAmount: returnInvoice.returnAmount
      });
      const returnNumber = result.returnNumber;
      // Group returned items by productId and sum quantity
      const productQtyMap = {};
      for (const item of itemsByType.Damaged) {
        const pid = item.mainProductId || item.id;
        if (!productQtyMap[pid]) productQtyMap[pid] = 0;
        productQtyMap[pid] += item.quantity || 1;
      }
      // Add returned quantity back to inventory (once per product)
      for (const pid in productQtyMap) {
        await InventoryModel.addToStock(pid, productQtyMap[pid]);
        InventoryModel.clearCache(pid);
      }
      // For each item, if serial/imei, add to damaged identifiers db and update identifier flags
      for (const item of itemsByType.Damaged) {
        if (item.identifierType && item.identifierValue) {
          await addDamagedOrOpenedIdentifier('Damaged', item.mainProductId || item.id, item.identifierType, item.identifierValue, returnNumber);
          await markIdentifierDamagedOrOpened(item.mainProductId || item.id, item.identifierType, item.identifierValue, 'Damaged');
        }
      }
      results.push({ type: 'Damaged', ...result });
    }
    // Process Opened returns
    if (itemsByType.Opened && itemsByType.Opened.length) {
      const result = await OpenedReturnModel.create({ 
        ...returnData, 
        returnType: 'Opened', 
        items: itemsByType.Opened, 
        invoiceRef: invoiceId,
        returnInvoiceId: returnInvoice.invoiceNumber,
        returnAmount: returnInvoice.returnAmount
      });
      const returnNumber = result.returnNumber;
      // Group returned items by productId and sum quantity
      const productQtyMap = {};
      for (const item of itemsByType.Opened) {
        const pid = item.mainProductId || item.id;
        if (!productQtyMap[pid]) productQtyMap[pid] = 0;
        productQtyMap[pid] += item.quantity || 1;
      }
      // Add returned quantity back to inventory (once per product)
      for (const pid in productQtyMap) {
        await InventoryModel.addToStock(pid, productQtyMap[pid]);
        InventoryModel.clearCache(pid);
      }
      // For each item, if serial/imei, add to opened identifiers db and update identifier flags
      for (const item of itemsByType.Opened) {
        if (item.identifierType && item.identifierValue) {
          await addDamagedOrOpenedIdentifier('Opened', item.mainProductId || item.id, item.identifierType, item.identifierValue, returnNumber);
          await markIdentifierDamagedOrOpened(item.mainProductId || item.id, item.identifierType, item.identifierValue, 'Opened');
        }
      }
      results.push({ type: 'Opened', ...result });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: 'No valid items to process.' });
    }
    
    // --- Add returned property to invoice items ---
    try {
      const invoiceRef = db.collection('invoices').doc(invoiceId);
      const invoiceSnapshot = await invoiceRef.get();
      if (invoiceSnapshot.exists) {
        const invoiceData = invoiceSnapshot.data();
        const invoiceItems = invoiceData.items || [];
        // Build a map of total returned quantities for each item (by id and identifierValue if present)
        const returnedQtyMap = {};
        for (const item of items) {
          const key = item.identifierValue ? `${item.id}__${item.identifierValue}` : `${item.id}`;
          returnedQtyMap[key] = (returnedQtyMap[key] || 0) + (item.quantity || 1);
        }
        // Update the returned property for each item
        const updatedItems = invoiceItems.map(item => {
          const key = item.identifierValue ? `${item.id}__${item.identifierValue}` : `${item.id}`;
          const returnedQty = returnedQtyMap[key] || 0;
          const isFullyReturned = returnedQty >= (item.quantity || 1);
          return {
            ...item,
            returned: isFullyReturned
          };
        });
        await invoiceRef.update({ items: updatedItems, updatedAt: new Date() });
      }
    } catch (err) {
      console.error('Error updating returned property on invoice items:', err);
    }
    // --- End add returned property ---
    // Return success with return invoice details
    return res.status(201).json({ 
      success: true, 
      results,
      returnInvoice: {
        invoiceNumber: returnInvoice.invoiceNumber,
        returnAmount: returnInvoice.returnAmount,
        originalInvoiceId: invoiceId
      }
    });
  } catch (err) {
    console.error('Error processing return:', err);
    res.status(500).json({ error: 'Failed to process return.' });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const { type } = req.query;
    let returns;
    if (type === 'Damaged') {
      returns = await DamagedReturnModel.getAll();
    } else if (type === 'Opened') {
      returns = await OpenedReturnModel.getAll();
    } else {
      returns = await ReturnModel.getAll();
    }
    res.status(200).json(returns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch returns.' });
  }
};

exports.getReturnById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    let ret;
    if (type === 'Damaged') {
      ret = await DamagedReturnModel.getById(id);
    } else if (type === 'Opened') {
      ret = await OpenedReturnModel.getById(id);
    } else {
      ret = await ReturnModel.getById(id);
    }
    if (!ret) return res.status(404).json({ error: 'Return not found.' });
    res.status(200).json(ret);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch return.' });
  }
};
