const pool = require('../db/db');

//Create a new category
const createCategory = async (name) => {
    const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]
    );
    return result.rows[0];
}

const getAllCategories = async () => {
    const result = await pool.query('SELECT id, name FROM categories');
    return result.rows;
  };

module.exports={
    createCategory,
    getAllCategories,
}