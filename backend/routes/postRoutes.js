const express = require('express');
const postController = require('../controllers/postController');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

// Normal users can view all posts
router.get('/', postController.getAllPosts);
router.get('/fyp', authenticateToken, postController.getPostsPrioritized);

// Admin can create and delete posts
router.post('/', authorizeRole('admin'), postController.createPost);
router.delete('/:id', authorizeRole('admin'), postController.deletePost);

// Editors can only edit posts created by admins
router.put('/:id', authorizeRole(['editor', 'admin']), postController.updatePost);

//Get post by tags
router.get('/by-tags', postController.getPostsbyTags);

//Get post by categories
router.get('/by-categories', postController.getPostsbyCategories);

router.get('/:id', postController.getPostById);





//create new category
router.post('')

module.exports = router;
