const { db } = require('../firebaseConfig');

class SerialModel {
    constructor() {
        this.collection = db.collection('serial');
    }

    async create(productId, serialData, purchaseId) {
        try {
            // Check if document exists
            const doc = await this.collection.doc(productId).get();
            
            if (doc.exists) {
                // Get existing identifiers
                const existingData = doc.data();
                const existingIdentifiers = existingData.identifiers || [];
                
                // Append new identifiers
                const newIdentifiers = serialData.map(serial => ({
                    serial,
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
                    identifiers: serialData.map(serial => ({
                        serial,
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

    async update(productId, serialData) {
        try {
            const docRef = await this.collection.doc(productId).update({
                identifiers: serialData.map(serial => ({
                    serial,
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

    async markAsSold(productId, serial, invoiceId = null) {
        try {
            const doc = await this.collection.doc(productId).get();
            if (!doc.exists) return null;

            const data = doc.data();
            const updatedIdentifiers = data.identifiers.map(item => {
                if (item.serial === serial) {
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

module.exports = new SerialModel(); 