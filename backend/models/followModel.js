// models/followModel.js
const pool = require('../db/db');

const followAdmin = async (followerId, adminId) => {
  const result = await pool.query(
    'INSERT INTO followers (follower_id, followed_admin_id) VALUES ($1, $2) RETURNING *',
    [followerId, adminId]
  );
  return result.rows[0];
};

const unfollowAdmin = async (followerId, adminId) => {
  await pool.query(
    'DELETE FROM followers WHERE follower_id = $1 AND followed_admin_id = $2',
    [followerId, adminId]
  );
};

const getFollowedAdmins = async (followerId) => {
  const result = await pool.query(
    'SELECT u.id, u.username FROM users u JOIN followers f ON u.id = f.followed_admin_id WHERE f.follower_id = $1',
    [followerId]
  );
  return result.rows;
};

module.exports = {
  followAdmin,
  unfollowAdmin,
  getFollowedAdmins
};