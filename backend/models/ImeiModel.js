const { db } = require('../firebaseConfig');
const { Timestamp } = require('firebase-admin').firestore;

class ImeiModel {
    constructor() {
        this.collection = db.collection('imei');
    }

    async create(productId, imeiData, purchaseId) {
        try {
            // Check if document exists
            const doc = await this.collection.doc(productId).get();
            
            if (doc.exists) {
                // Get existing identifiers
                const existingData = doc.data();
                const existingIdentifiers = existingData.identifiers || [];
                
                // Append new identifiers
                const newIdentifiers = imeiData.map(imeiObj => {
                    if (typeof imeiObj === 'string') {
                        return {
                            imei: imeiObj,
                            sold: false,
                            createdAt: new Date(),
                            soldAt: null,
                            purchaseId: purchaseId,
                            damaged: false,
                            opened: false
                        };
                    } else {
                        return {
                            imei: imeiObj.value || imeiObj.imei,
                            warranty: imeiObj.warranty,
                    sold: false,
                    createdAt: new Date(),
                    soldAt: null,
                    purchaseId: purchaseId,
                    damaged: false,
                    opened: false
                        };
                    }
                });
                
                // Combine existing and new identifiers
                const updatedIdentifiers = [...existingIdentifiers, ...newIdentifiers];
                
                // Update the document
                await this.collection.doc(productId).update({
                    identifiers: updatedIdentifiers
                });
                
                return { message: 'Identifiers appended successfully' };
            } else {
                // Create new document
                const docRef = await this.collection.doc(productId).set({
                    productId,
                    identifiers: imeiData.map(imeiObj => {
                        if (typeof imeiObj === 'string') {
                            return {
                                imei: imeiObj,
                                sold: false,
                                createdAt: new Date(),
                                soldAt: null,
                                purchaseId: purchaseId,
                                damaged: false,
                                opened: false
                            };
                        } else {
                            return {
                                imei: imeiObj.value || imeiObj.imei,
                                warranty: imeiObj.warranty,
                        sold: false,
                        createdAt: new Date(),
                        soldAt: null,
                        purchaseId: purchaseId,
                        damaged: false,
                        opened: false
                            };
                        }
                    })
                });
                return docRef;
            }
        } catch (error) {
            throw error;
        }
    }

    async getByProductId(productId) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;
            const data = doc.data();
            // Format createdAt for each identifier
            const formattedIdentifiers = (data.identifiers || []).map(item => ({
                ...item,
                createdAtFormatted: item.createdAt && item.createdAt.toDate ?
                  formatDate(item.createdAt.toDate()) :
                  (typeof item.createdAt === 'string' ? formatDate(new Date(item.createdAt)) : null)
            }));
            return { ...data, identifiers: formattedIdentifiers };
        } catch (error) {
            throw error;
        }
    }

    async update(productId, imeiData) {
        try {
            const docRef = await this.collection.doc(productId).update({
                identifiers: imeiData.map(imeiObj => {
                    if (typeof imeiObj === 'string') {
                        return {
                            imei: imeiObj,
                            sold: false,
                            createdAt: new Date(),
                            soldAt: null
                        };
                    } else {
                        return {
                            imei: imeiObj.value || imeiObj.imei,
                            warranty: imeiObj.warranty,
                    sold: false,
                    createdAt: new Date(),
                    soldAt: null
                        };
                    }
                })
            });
            return docRef;
        } catch (error) {
            throw error;
        }
    }

    async delete(productId) {
        try {
            await this.collection.doc(productId).delete();
            return true;
        } catch (error) {
            throw error;
        }
    }

    async markAsSold(productId, imei, invoiceId = null) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;

            const data = doc.data();
            const updatedIdentifiers = data.identifiers.map(item => {
                if (item.imei === imei) {
                    return { 
                        ...item, 
                        sold: true,
                        soldAt: new Date(),
                        invoiceId: invoiceId
                    };
                }
                return item;
            });

            await this.collection.doc(productId).update({
                identifiers: updatedIdentifiers
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async updatePurchaseId(productId, tempPurchaseId, purchaseId) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;

            const data = doc.data();
            const updatedIdentifiers = data.identifiers.map(item => {
                if (item.purchaseId === tempPurchaseId) {
                    return { ...item, purchaseId };
                }
                return item;
            });

            await this.collection.doc(productId).update({
                identifiers: updatedIdentifiers
            });

            return true;
        } catch (error) {
            throw error;
        }
    }

    async markAsDamaged(productId, imei) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;
            const data = doc.data();
            const updatedIdentifiers = data.identifiers.map(item => {
                if (item.imei === imei) {
                    return { ...item, damaged: true };
                }
                return item;
            });
            await this.collection.doc(productId).update({
                identifiers: updatedIdentifiers
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    async markAsOpened(productId, imei) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;
            const data = doc.data();
            const updatedIdentifiers = data.identifiers.map(item => {
                if (item.imei === imei) {
                    return { ...item, opened: true };
                }
                return item;
            });
            await this.collection.doc(productId).update({
                identifiers: updatedIdentifiers
            });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

// Helper to format date as '1 July 2025 at 14:49:38 UTC+5:30'
function formatDate(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    const time = dateObj.toLocaleTimeString('en-GB', { hour12: false });
    const tz = dateObj.toTimeString().replace(/^.*GMT/, 'UTC');
    return `${day} ${month} ${year} at ${time} ${tz}`;
}

module.exports = new ImeiModel(); 