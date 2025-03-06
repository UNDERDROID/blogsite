const pool = require('../db/db');

const createPost = async (title, content, categoryIds, tags, createdBy) => {
  const client = await pool.connect();
  try {
    // Step 1: Check if all tags exist
    const tagCheckResult = await client.query(
      'SELECT name, id FROM tags WHERE name = ANY($1)',
      [tags]
    );
    
    const existingTags = tagCheckResult.rows.map(row => row.name);
    const missingTags = tags.filter(tag => !existingTags.includes(tag));
    
    if (missingTags.length > 0) {
      throw new Error(`The following tags do not exist: ${missingTags.join(', ')}`);
    }

    // Step 2: Create the post
    await client.query('BEGIN');
    const postResult = await client.query(
      'INSERT INTO posts (title, content, created_by, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [title, content, createdBy]
    );
    const newPost = postResult.rows[0];

    // Step 3: Insert associations for categories
    const categoryPromises = categoryIds.map(id =>
      client.query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
        [newPost.id, id]
      )
    );
    await Promise.all(categoryPromises);

    // Step 4: Insert associations for tags
    const tagPromises = tags.map(async (tagName) => {
      const tagResult = await client.query(
        'SELECT id FROM tags WHERE name = $1',
        [tagName]
      );
      const tagId = tagResult.rows[0].id;

      // Insert the post-tag association
      await client.query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
        [newPost.id, tagId]
      );
    });
    await Promise.all(tagPromises);

    // Step 5: Commit the transaction
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
        p.created_by,
        p.created_at,
        u.username AS creator_name,
        ARRAY_AGG(DISTINCT c.name) AS categories,
        ARRAY_AGG(DISTINCT t.name) AS tags
      FROM posts p
      LEFT JOIN post_categories pc ON p.id = pc.post_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t on pt.tag_id = t.id
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



const getPostById = async (id) => {
  const postQuery = `
    SELECT 
      p.id, 
      p.title, 
      p.content, 
      p.created_by, 
      p.created_at,
      u.username AS creator_name,
      ARRAY_AGG(DISTINCT c.name) AS categories,
      ARRAY_AGG(DISTINCT t.name) AS tags
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1
    GROUP BY p.id, u.username
  `;
  
  const postResult = await pool.query(postQuery, [id]);
  const post = postResult.rows[0];

  // Filter out null values from the arrays
  if (post) {
    post.categories = post.categories ? 
      post.categories.filter(cat => cat !== null) : 
      [];
    
    post.tags = post.tags ? 
      post.tags.filter(tag => tag !== null) : 
      [];
  }

  return post;
};

// Update a post and its categories
const updatePost = async (id, title, content, categoryIds, tagIds) => {
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

    //Remove existing tag associations
    await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);

    // Insert new category associations
    const insertPromises = categoryIds.map((categoryId) =>
      client.query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ($1, $2)',
        [id, categoryId]
      )
    );

    
      //Insert new tag associations
      const insertTags = tagIds.map((tagId)=>
       client.query(
        'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)', [id, tagId]
       ) 
      )
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
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query('DELETE FROM post_categories WHERE post_id = $1', [id]);
    await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
    await client.query('DELETE FROM posts WHERE id = $1', [id]);
    
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  createPost,
  getPostsPrioritized,
  getPostById,
  updatePost,
  deletePost,
};