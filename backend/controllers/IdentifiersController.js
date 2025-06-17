const ImeiModel = require('../models/ImeiModel');
const SerialModel = require('../models/SerialModel');

class IdentifiersController {
    async saveIdentifiers(req, res) {
        try {
            const { productId, identifiers, type, purchaseId } = req.body;

            if (!productId || !identifiers || !type || !purchaseId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (type === 'imei') {
                await ImeiModel.create(productId, identifiers, purchaseId);
            } else if (type === 'serial') {
                await SerialModel.create(productId, identifiers, purchaseId);
            } else {
                return res.status(400).json({ error: 'Invalid identifier type' });
            }

            res.status(200).json({ message: 'Identifiers saved successfully' });
        } catch (error) {
            console.error('Error saving identifiers:', error);
            res.status(500).json({ error: 'Failed to save identifiers' });
        }
    }

    async updatePurchaseId(req, res) {
        try {
            const { productId, type, tempPurchaseId, purchaseId } = req.body;

            if (!productId || !type || !tempPurchaseId || !purchaseId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (type === 'imei') {
                await ImeiModel.updatePurchaseId(productId, tempPurchaseId, purchaseId);
            } else if (type === 'serial') {
                await SerialModel.updatePurchaseId(productId, tempPurchaseId, purchaseId);
            } else {
                return res.status(400).json({ error: 'Invalid identifier type' });
            }

            res.status(200).json({ message: 'Purchase ID updated successfully' });
        } catch (error) {
            console.error('Error updating purchase ID:', error);
            res.status(500).json({ error: 'Failed to update purchase ID' });
        }
    }

    async getIdentifiers(req, res) {
        try {
            const { productId, type } = req.params;

            if (!productId || !type) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            let data;
            if (type === 'imei') {
                data = await ImeiModel.getByProductId(productId);
            } else if (type === 'serial') {
                data = await SerialModel.getByProductId(productId);
            } else {
                return res.status(400).json({ error: 'Invalid identifier type' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error getting identifiers:', error);
            res.status(500).json({ error: 'Failed to get identifiers' });
        }
    }

    async markAsSold(req, res) {
        try {
            const { productId, identifier, type } = req.body;

            if (!productId || !identifier || !type) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            let result;
            if (type === 'imei') {
                result = await ImeiModel.markAsSold(productId, identifier);
            } else if (type === 'serial') {
                result = await SerialModel.markAsSold(productId, identifier);
            } else {
                return res.status(400).json({ error: 'Invalid identifier type' });
            }

            if (!result) {
                return res.status(404).json({ error: 'Identifier not found' });
            }

            res.status(200).json({ message: 'Identifier marked as sold' });
        } catch (error) {
            console.error('Error marking identifier as sold:', error);
            res.status(500).json({ error: 'Failed to mark identifier as sold' });
        }
    }

    async deleteIdentifiers(req, res) {
        try {
            const { productId, type } = req.params;

            if (!productId || !type) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            if (type === 'imei') {
                await ImeiModel.delete(productId);
            } else if (type === 'serial') {
                await SerialModel.delete(productId);
            } else {
                return res.status(400).json({ error: 'Invalid identifier type' });
            }

            res.status(200).json({ message: 'Identifiers deleted successfully' });
        } catch (error) {
            console.error('Error deleting identifiers:', error);
            res.status(500).json({ error: 'Failed to delete identifiers' });
        }
    }
}

module.exports = new IdentifiersController();
