const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const tagModel = require('../models/tagModel');
const pool = require('../db/db');

const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

const getPostsPrioritized = async (req, res) => {
  try{                  
    const userId = req.user.id;
    const posts = await postModel.getPostsPrioritized(userId);
    res.status(200).json(posts);
  }catch(error){
    console.error('Error fetching posts:', error);
    res.status(500).json({error: 'Failed to fetch posts', details: error.message,});
  }
}

const getPostById = async (req, res) => {
  try {
    const post = await postModel.getPostById(req.params.id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post by id' });
  }
};

//Get posts by tags
const getPostsbyTags = async(req, res) => {
  const { tags } = req.query;

  try{
    if(!tags){
      return res.status(400).json({message: 'tags are required'});
    }

    const tagIds = tags.split(',').map(id => parseInt(id.trim()));

    const result=await pool.query(
      `SELECT DISTINCT p.*
      FROM posts p
      JOIN post_tags pt ON p.id = pt.post_id
      WHERE pt.tag_id = ANY($1::int[])
  `, [tagIds]
);
    if(result.rows.length === 0){
      return res.status(404).json({message: "No posts found for this tag"});
    }

    res.status(200).json(result.rows);
  }catch(error){
    console.error('Error fetching posts by tag:', error);
  }
}

//Get posts by categories
const getPostsbyCategories = async(req, res) => {
  const { categories } = req.query;
  
  try{

    if(!categories){
      res.status(400).json({message: 'categories are required'});
    }

    const categoryIds = categories.split(',').map(id=>parseInt(id.trim())).filter(id=>!isNaN(id));

    if (categoryIds===0){
      return res.status(400).json({message: 'Invalid category IDs provided'});
    }

    const result = await pool.query(
      `SELECT DISTINCT p.*
      FROM posts p
      JOIN post_categories pc ON p.id =pc.post_id
      WHERE pc.category_id = ANY($1::int[])`, [categoryIds]
    );
    if(result.rows.length === 0){
      return res.status(404).json({message: 'No posts found for this category'});
    }
    res.status(200).json(result.rows);
  }catch(error){
    console.error('Error fetchin posts by category', error);
  }
}

const predefinedCategories = {
  Technology: 1,
  Health: 2,
  Gaming: 3,
  Music: 4,
  Art: 5
};

const createPost = async (req, res) => {
  const { title, content, categories = [], tags = [] } = req.body;
  try {
    // Ensure arrays
    if (!Array.isArray(categories) || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Categories and tags must be arrays' });
    }
    
    // Fetch all categories to build a mapping { name: id }
    const allCategories = await categoryModel.getAllCategories();
    const categoryMap = allCategories.reduce((map, cat) => {
      map[cat.name] = cat.id;
      return map;
    }, {});

    // Validate user-provided categories exist in DB
    const invalidUserCats = categories.filter(cat => !categoryMap.hasOwnProperty(cat));
    if (invalidUserCats.length) {
      return res.status(400).json({ error: `Invalid categories: ${invalidUserCats.join(', ')}` });
    }

    // Get categories from provided tags
    const tagCategoryNames = await tagModel.getCategoriesByTags(tags);
    // Combine: user provided + from tags, then remove duplicates
    const combinedCategoryNames = Array.from(new Set([...categories, ...tagCategoryNames]));

    // Convert combined names to their IDs
    const categoryIds = combinedCategoryNames.map(name => categoryMap[name]);

    // createdBy should come from auth middleware (e.g., req.user.id)
    const createdBy = req.user?.id || 1; // fallback for testing

    const newPost = await postModel.createPost(title, content, categoryIds, tags, createdBy);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
};


const updatePost = async (req, res) => {
  const { title, content, categories } = req.body;
  try {
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'categories must be an array' });
    }

    const invalidCategories = categories.filter(category => !predefinedCategories.hasOwnProperty(category));
    if (invalidCategories.length > 0) {
      return res.status(400).json({
        error: `Invalid categories: ${invalidCategories.join(', ')}. Allowed categories: ${Object.keys(predefinedCategories).join(', ')}`
      });
    }

    const categoryIds = categories.map(category => predefinedCategories[category]);
    const updatedPost = await postModel.updatePost(req.params.id, title, content, categoryIds);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

const deletePost = async (req, res) => {
  try {
    await postModel.deletePost(req.params.id);
    res.status(200).json({success: 'post deleted'}); // No content

  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

module.exports = {
  getAllPosts,
  getPostsPrioritized,
  getPostById,
  getPostsbyTags,
  getPostsbyCategories,
  createPost,
  updatePost,
  deletePost,
};
