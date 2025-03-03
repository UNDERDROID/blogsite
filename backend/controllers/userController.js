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

      if(parseInt(requesterId)!==parseInt(userId) && req.user.role!=='admin'){
        return res.status(403).json({error: 'Unauthorized to delete user'})
      }

      const deletedUser = await userModel.deleteUser(userId);
      if(!deletedUser){
        return res.status(404).json({error: 'User not found'})
      }
      return res.status(200).json({message:'User deleted'});
    }catch(error){
      res.status(500).json({error:'Failed to delete user', details: error.message});

    }
  };

  //Update User
  const updateUser = async (req, res) => {
    const {id} = req.params;
    const {username, email, role} = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    try{
      //Check if user exists
      const userToUpdate = await userModel.getUserById(id);
      if(!userToUpdate){
        return res.status(404).json({error:'User not found'});
      }

      //Authorization: Only admins and user themselves can update
      if(parseInt(requesterId)!==parseInt(id) && requesterRole!=='admin'){
        return res.status(403).json({error: 'Unauthorized to update user'});
      }
       // Validate email format (if email is being updated)
       if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if the new email is already registered
        const existingEmail = await userModel.findUserByEmail(email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
    }

     // Validate username (if username is being updated)
     if (username) {
      // Check if the new username is already taken
      const existingUser = await userModel.findUserByUsername(username);
      if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ error: 'Username already exists' });
      }
  }

   // Validate role (if role is being updated)
   if (role) {
    const validRoles = ['admin', 'user', 'editor'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Only admins can change roles
    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to change role' });
    }
}
 // Update the user
 const updatedUser = await userModel.updateUser(id, username, email, role);
 if (!updatedUser) {
     return res.status(500).json({ error: 'Failed to update user' });
 }

 // Return the updated user (excluding sensitive data like password)
 const { password, ...userWithoutPassword } = updatedUser;
 res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });
} catch (error) {
 res.status(500).json({ error: 'Failed to update user', details: error.message });
}
    }


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
  
      res.json({ token,
          user: { username: user.username, role: user.role}
       });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login' });
    }
  };


  //Get all users
  const getUsers = async (req, res) => {
    try {
      const users = await userModel.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  const getUserById = async (req, res) => {
    try{
      const user = await userModel.getUserById(req.params.id);
      res.json(user);
    }catch(error){
      res.status(500).json({error: 'Failed to fetch user'});
    }
  }

  const followCategory = async (req, res) => {
    const { category } = req.body; // Expect a single category name (e.g., "Health")
    const userId = req.user.id;
  
    try {
      // Define valid categories (or fetch from a categories table)
      const validCategories = ['Technology', 'Health', 'Gaming', 'Music', 'Art'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
  
      // Check if the user already follows the category
      const checkQuery = 'SELECT * FROM followed_categories WHERE user_id = $1 AND category = $2';
      const checkResult = await pool.query(checkQuery, [userId, category]);
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'You are already following this category' });
      }
  
      // Insert the followed category (each row represents one followed category)
      const insertQuery = 'INSERT INTO followed_categories (user_id, category) VALUES ($1, $2)';
      await pool.query(insertQuery, [userId, category]);
      res.status(201).json({ message: 'Category followed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to follow category', details: error.message });
    }
  };
  
  
  module.exports = {
    registerUser,
    deleteUser,
    updateUser,
    loginUser,
    getUsers,
    getUserById,
    followCategory,
  };
