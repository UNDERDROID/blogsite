const pool = require('../db/db');

//Create a new category
const createCategory = async (name) => {
    const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]
    );
    return result.rows[0];
}

const deleteCategory = async (id) => {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *;',[id]);
    return result.rows[0];
}

const updateCategory = async (id, catName) => {
    const result = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',[catName, id]);
    return result.rows[0];
}

const getAllCategories = async () => {
    const result = await pool.query('SELECT id, name FROM categories');
    return result.rows;
  };

module.exports={
    createCategory,
    deleteCategory,
    updateCategory,
    getAllCategories,
}