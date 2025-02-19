const express = require('express');
const postController = require('../controllers/postController');
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

router.get('/:id', postController.getPostById);

module.exports = router;
