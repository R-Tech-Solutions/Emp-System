const { db } = require('../firebaseConfig');

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
                const newIdentifiers = imeiData.map(imei => ({
                    imei,
                    sold: false,
                    createdAt: new Date(),
                    soldAt: null,
                    purchaseId: purchaseId
                }));
                
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
                    identifiers: imeiData.map(imei => ({
                        imei,
                        sold: false,
                        createdAt: new Date(),
                        soldAt: null,
                        purchaseId: purchaseId
                    }))
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
            return doc.exists ? doc.data() : null;
        } catch (error) {
            throw error;
        }
    }

    async update(productId, imeiData) {
        try {
            const docRef = await this.collection.doc(productId).update({
                identifiers: imeiData.map(imei => ({
                    imei,
                    sold: false,
                    createdAt: new Date(),
                    soldAt: null
                }))
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
}

module.exports = new ImeiModel(); 