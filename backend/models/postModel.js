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
  -- Posts from followed admins (priority 1)
  SELECT p.id, p.title, p.content, p.created_by, p.created_at, p.category, 1 AS priority
  FROM posts p
  JOIN followers f ON p.created_by = f.followed_admin_id
  WHERE f.follower_id = $1
)
UNION
(
  -- Posts from followed categories (priority 2), excluding posts already fetched for followed admins
  SELECT p.id, p.title, p.content, p.created_by, p.created_at, p.category, 2 AS priority
  FROM posts p
  JOIN followed_categories fc ON p.category @> fc.category
  WHERE fc.user_id = $1
  AND p.id NOT IN (
    SELECT p.id
    FROM posts p
    JOIN followers f ON p.created_by = f.followed_admin_id
    WHERE f.follower_id = $1
  )
)
UNION
(
  -- All other posts (priority 3), excluding both followed admins and followed categories
  SELECT p.id, p.title, p.content, p.created_by, p.created_at, p.category, 3 AS priority
  FROM posts p
  WHERE p.created_by NOT IN (
    SELECT followed_admin_id FROM followers WHERE follower_id = $1
  )
  AND NOT EXISTS (
    SELECT 1
    FROM followed_categories fc
    WHERE p.category @> fc.category AND fc.user_id = $1
  )
)
ORDER BY priority ASC, created_at DESC;
`

  
    const result = await pool.query(query, [userId]);
    return result.rows;
  };  

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