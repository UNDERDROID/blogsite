const pool = require('../db/db');


// Create a new post and link it to categories
const createPost = async (title, content, categoryIds, createdBy) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const postResult = await client.query(
      'INSERT INTO posts (title, content, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [title, content, createdBy]
    );
    const newPost = postResult.rows[0];
    // Insert associations
    const promises = categoryIds.map(id =>
      client.query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
        [newPost.id, id]
      )
    );
    await Promise.all(promises);
    await client.query('COMMIT');
    return newPost;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getPostsPrioritized = async (userId) => {
  const query = `
    WITH user_followed AS (
      SELECT category
      FROM followed_categories
      WHERE user_id = $1
    ),
    post_data AS (
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_by,
        p.created_at,
        u.username AS creator_name,
        ARRAY_AGG(DISTINCT c.name) AS categories
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      GROUP BY p.id, u.username, p.created_at
    )
    SELECT 
      pd.*,
      (
        SELECT COUNT(*) 
        FROM user_followed uf 
        WHERE uf.category = ANY(pd.categories)
      ) AS priority
    FROM post_data pd
    ORDER BY priority DESC, pd.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};



// Get a post by id along with its categories
const getPostById = async (id) => {
  const postQuery = `
    SELECT 
      p.id, 
      p.title, 
      p.content, 
      p.created_by, 
      p.created_at,
      u.username AS creatorName
    FROM posts p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1
  `;
  const postResult = await pool.query(postQuery, [id]);
  const post = postResult.rows[0];

  if (post) {
    const catQuery = `
      SELECT c.id, c.name
      FROM categories c
      JOIN post_categories pc ON c.id = pc.category_id
      WHERE pc.post_id = $1
    `;
    const catResult = await pool.query(catQuery, [id]);
    post.categories = catResult.rows;
  }

  return post;
};

// Update a post and its categories
const updatePost = async (id, title, content, categoryIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update the post details
    const postResult = await client.query(
      'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    const updatedPost = postResult.rows[0];

    // Remove existing category associations
    await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);

    // Insert new category associations
    const insertPromises = categoryIds.map((categoryId) =>
      client.query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
        [id, categoryId]
      )
    );
    await Promise.all(insertPromises);

    await client.query('COMMIT');
    return updatedPost;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deletePost = async (id) => {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
};

module.exports = {
  createPost,
  getPostsPrioritized,
  getPostById,
  updatePost,
  deletePost,
};
