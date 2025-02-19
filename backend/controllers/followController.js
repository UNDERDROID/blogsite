// controllers/followController.js
const followModel = require('../models/followModel');
const userModel = require('../models/userModel'); // You'll need to create this

const followAdmin = async (req, res) => {
  try {
    const followerId = req.user.id;
    const adminId = req.params.adminId;

    // Verify that the target user is an admin
    const admin = await userModel.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({ error: 'Can only follow admin users' });
    }

    await followModel.followAdmin(followerId, adminId);
    res.status(201).json({ message: 'Successfully followed admin' });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique violation error
      res.status(400).json({ error: 'Already following this admin' });
    } else {
      res.status(500).json({ error: 'Failed to follow admin' });
    }
  }
};

const unfollowAdmin = async (req, res) => {
  try {
    const followerId = req.user.id;
    const adminId = req.params.adminId;
    
    await followModel.unfollowAdmin(followerId, adminId);
    res.status(200).json({ message: 'Successfully unfollowed admin' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfollow admin' });
  }
};

const getFollowedAdmins = async (req, res) => {
    try {
      const followerId = req.user.id;
      const followedAdmins = await followModel.getFollowedAdmins(followerId);
      res.json(followedAdmins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch followed admins' });
    }
  };
  
  module.exports = {
    followAdmin,
    unfollowAdmin,
    getFollowedAdmins
  };