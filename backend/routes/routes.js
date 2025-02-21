const express = require('express');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();


//create new category
router.post('/category', authorizeRole('admin'), categoryController.createCategory);

router.post('/tag', authorizeRole('admin'), tagController.createTag);
module.exports = router;
