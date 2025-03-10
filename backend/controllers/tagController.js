const { error } = require('jquery');
const tagModel = require('../models/tagModel');

const createTag = async (req, res) => {
    const { name, category_id } = req.body;
    if (!name || !category_id) {
      return res.status(400).json({ error: 'Tag name and category id are required' });
    }
    try {
      const newTag = await tagModel.createTag(name, category_id);
      res.status(201).json(newTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      res.status(500).json({ error: 'Failed to create tag', details: error.message });
    }
  };

  const deleteTag = async (req, res) =>{
    const tagId = req.params.id;
    if(!tagId){
      res.status(400).json({error: 'Tag id is required'});
    }

    try{
      const deletedTag = await tagModel.deleteTag(tagId);
      res.status(200).json(deletedTag);
    }catch(err){
      res.status(500).json({error: 'Error deleting tag', details: err.message});
    }
  }

  const updateTag = async (req, res) =>{
    const tagId = req.params.id;
    const {name, category_id} = req.body;

    if(!tagId){
      res.status(400).json({error: 'tag id is required'});
    }

    try{
      const updatedTag = await tagModel.updateTag(tagId, name, category_id);
      res.status(200).json(updatedTag);
    }catch(err){
      res.status(500).json({error:'Error updating tag', details: err.message});
    }
  }

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
    deleteTag,
    updateTag,
    getAllTags
};