const categoryModel = require('../models/categoryModel');

const createCategory = async (req, res) =>{
    try{
        const { name } = req.body;
        if(!name){
            return res.status(400).json({error: 'Category name is required'})
        }
        const category = await categoryModel.createCategory(name);
        res.status(201).json(category);
    }catch(error){
        res.status(500).json({error: 'Failed to create category'});
    }
}

module.exports ={
    createCategory,
}