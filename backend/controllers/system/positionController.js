const positionModel = require('../../models/system/positionModel');

const positionController = {
  getAll: async (req, res) => {
    try {
      const positions = await positionModel.getAll();
      res.status(200).json(positions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const position = await positionModel.getById(req.params.id);
      res.status(200).json(position);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.body.title) {
        return res.status(400).json({ error: 'Title is required' }); // Validate input
      }
      const newPosition = await positionModel.create(req.body);
      res.status(201).json(newPosition);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const updatedPosition = await positionModel.update(req.params.id, req.body);
      res.status(200).json(updatedPosition);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const deletedPosition = await positionModel.delete(req.params.id);
      res.status(200).json(deletedPosition);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = positionController;
