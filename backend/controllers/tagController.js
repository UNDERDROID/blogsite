const tagModel = require('../models/tagModel');

const createTag = async (req, res) => {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Tag name and category id are required' });
    }
    try {
      const newTag = await tagModel.createTag(name, categoryId);
      res.status(201).json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: 'Failed to create tag', details: error.message });
    }
  };

const getAllTags = async (req, res) => {
  try{
    const tags = await tagModel.getAllTags();
    res.json(tags);
  }catch(error){
    res.status(500).json({error: 'Failed to fetch tags'})
  }
}

module.exports = {
    createTag,
    getAllTags
};