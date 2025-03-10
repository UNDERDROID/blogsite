const express = require('express');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();


//create new category
router.post('/category', authorizeRole('admin'), categoryController.createCategory);

router.post('/category', categoryController.createCategory);

//Delete category
router.delete('/category/:id', categoryController.deleteCategory);

//Update category
router.put('/category/:id', categoryController.updateCategory);

//Get All categories
router.get('/category', categoryController.getAllCategories);

router.post('/tag', authorizeRole('admin'), tagController.createTag);
router.delete('/tag/:id', tagController.deleteTag);
router.put('/tag/:id', tagController.updateTag);
router.get('/tag', tagController.getAllTags);
module.exports = router;
