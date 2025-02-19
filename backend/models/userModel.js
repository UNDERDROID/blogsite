const pool = require('../db/db');

//Create a new user
const createUser = async (username, password, role = 'user') => {
    await pool.query('INSERT INTO users(username, password, role) VALUES ($1, $2, $3)',
        [username, password, role]
    )
}

//Delete a user
const deleteUser = async (userId) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    return result.rows[0];
};

//Find user by username
const findUserByUsername = async (username) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
}

//Get all users
const getUsers = async ()=>{
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
}

//Get user by id
const getUserById = async (id)=>{
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

module.exports = {
    createUser,
    deleteUser,
    findUserByUsername,
    getUsers,
    getUserById
}

