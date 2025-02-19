const pool = require('../db/db');

//Get all posts
const getAllPosts = async ()=>{
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    return result.rows;
};

//Get post by priority(posts of followed admins first)
const getPostsPrioritized = async (userId) => {
    const query = `
    (
      SELECT p.*
      FROM posts p
      JOIN followers f ON p.created_by = f.followed_admin_id
      WHERE f.follower_id = $1
    )
    UNION
    (
      SELECT p.*
      FROM posts p
      WHERE p.created_by NOT IN (
        SELECT followed_admin_id FROM followers WHERE follower_id = $1
      )
    )
    ORDER BY created_at DESC;
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
}

//Get a single post by ID
const getPostById = async (id) => {
const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
return result.rows[0];
};

//Create a new post
const createPost = async (title, content, categories, createdBy) => {
    const result = await pool.query(
        'INSERT INTO posts (title, content, category, created_by, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *', 
        [title, content, JSON.stringify(categories), createdBy]
    );
    return result.rows[0];
};

//Update a post
const updatePost = async (id, title, content, category) => {
    const result = await pool.query(
        'UPDATE posts SET title = $1, content = $2, category = $3 WHERE id = $4 RETURNING *',
        [title, content, category, id]
    );
    return result.rows[0];
}

// Delete a post
const deletePost = async (id) => {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  };
  
  module.exports = {
    getAllPosts,
    getPostsPrioritized,
    getPostById,
    createPost,
    updatePost,
    deletePost,
  };