const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const pool = require('../db/db');

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

     // Email and password validation
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; 

     if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!passwordRegex.test(password)) {
      return res.status(400).json({
          error: 'Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character'
      });
  }

  //Check if username already exist
  const existingUser = await userModel.findUserByUsername(username);
  if (existingUser){
    return res.status(400).json({error: 'Username already exists'});
  }

  //Check if email already exist
  const existingEmail = await userModel.findUserByEmail(email);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const validRoles = ['admin', 'user', 'editor'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }



    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      await userModel.createUser(username, email, hashedPassword, role);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
  };

  const deleteUser = async (req, res) => {
    try{
      const userId = req.params.id;
      const requesterId = req.user.id;

      if(requesterId!==userId && req.user.role!=='admin'){
        return res.status(403).json({error: 'Unauthorized to delete user'})
      }

      const deletedUser = await userModel.deleteUser(userId);
      if(!deleteUser){
        return res.status(404).json({error: 'User not found'})
      }
      return res.status(200).json({message:'User deleted'});
    }catch(error){
      res.status(500).json({error:'Failed to delete user'});
    }
  };

  // Login user and return JWT
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await userModel.findUserByUsername(username);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
  
      // Generate JWT
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login' });
    }
  };

  const getUsers = async (req, res) => {
    try {
      const users = await userModel.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  const followCategory = async (req, res) => {
    const { category } = req.body;
    const userId = req.user.id;
  
    try {
      // Ensure the category is valid
      const validCategories = ['Technology', 'Health', 'Gaming', 'Music', 'Art'];
      if (!validCategories.includes(category[0])) {
        return res.status(400).json({ error: 'Invalid category' });
      }
  
      // Check if the user already follows the category
      const checkQuery = 'SELECT * FROM followed_categories WHERE user_id = $1 AND category @> $2::jsonb';
      const checkResult = await pool.query(checkQuery, [userId, JSON.stringify(category)]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'You are already following this category' });
      }
  
      // Insert the followed category
      const insertQuery = 'INSERT INTO followed_categories (user_id, category) VALUES ($1, $2::jsonb)';
      await pool.query(insertQuery, [userId, JSON.stringify(category)]);
      res.status(201).json({ message: 'Category followed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to follow category', details: error.message });
    }
  };
  
  
  module.exports = {
    registerUser,
    deleteUser,
    loginUser,
    getUsers,
    followCategory,
  };
