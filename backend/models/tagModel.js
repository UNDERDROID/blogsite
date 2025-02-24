const pool = require('../db/db');

//Create a new tag asociated with category
const createTag = async (name, categoryId) => {
const result = await pool.query(
    'INSERT INTO tags(name, category_id) VALUES ($1, $2) RETURNING *', [name, categoryId]
)
return result.rows[0];
}

const getCategoriesByTags = async (tags) => {
    if (tags.length === 0) return [];
  
    const query = `
      SELECT DISTINCT c.name
      FROM categories c
      JOIN tags t ON c.id = t.category_id
      WHERE t.name = ANY($1)
    `;
  
    const result = await pool.query(query, [tags]);
    return result.rows.map((row) => row.name);
  };

  const getAllTags = async () => {
    const result = await pool.query('SELECT id, name, category_id FROM tags');
    return result.rows;
  }

module.exports = {
    createTag,
    getCategoriesByTags,
    getAllTags
}