const express = require('express');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();


//create new category
router.post('/category', authorizeRole('admin'), categoryController.createCategory);
router.get('/category', categoryController.getAllCategories);

router.post('/tag', authorizeRole('admin'), tagController.createTag);
router.get('/tag', tagController.getAllTags);
module.exports = router;
