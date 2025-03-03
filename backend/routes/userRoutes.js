const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');

// Register a new user
router.post('/register', userController.registerUser);

//Delete a user
router.delete('/:id', authorizeRole('user', 'admin'), userController.deleteUser);

//Update a user
router.patch('/:id', authorizeRole('user', 'admin'), userController.updateUser);

// Login a user
router.post('/login', userController.loginUser);

//Get users
router.get('/', userController.getUsers);

//Get a user by id
router.get('/:id', userController.getUserById);

//follow admin
router.post('/follow-category', authenticateToken, userController.followCategory);

module.exports = router;
