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
const deleteCategory = async (req, res) => {
    try{
        const categoryId = req.params.id

        if(!categoryId){
            return res.status(400).json({ error: 'Category ID is required' });
        }
            const deletedCategory = await categoryModel.deleteCategory(categoryId);

            if(!deletedCategory){
                return res.status(404).json('Category not found');
            }
            return res.status(200).json('Category deleted');
        
    }catch(err){
        console.error('Error deleting category:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });    }
}

const updateCategory = async (req, res) => {
    const id = req.params.id;
    const {name} = req.body;

    try{
        const updatedCategory = await categoryModel.updateCategory(id, name);
        if(updatedCategory){
            return res.status(200).json( updatedCategory);
        }else{
            console.error('Failed to update');
            return res.status(404).json({message: 'Category not found or update failed'});
        }
    }catch(err){
        return res.status(500).json({message:'Failed to update category', data: err});
    }
}

const getAllCategories = async (req, res) => {
    try{
        const categories = await categoryModel.getAllCategories();
        res.json(categories);
    }catch(error){
        res.status(500).json({error: 'Failed to fetch categories'});
    }
}
module.exports ={
    createCategory,
    deleteCategory,
    updateCategory,
    getAllCategories
}