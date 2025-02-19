const postModel = require('../models/postModel');
const userModel = require('../models/userModel');

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
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

const predefinedCategories =['Technology', 'Health', 'Gaming', 'Music', 'Art']

const createPost = async (req, res) => {
  const { title, content, categories } = req.body;
  try {
    //Validate categories is an array
    if(!Array.isArray(categories)){
      return res.status(400).json({error: 'categories must be an array'});
    }

    //check if all categories are valid
    const invalidCategories = categories.filter((category)=>!predefinedCategories.includes(category));
    if(invalidCategories.length>0){
      return res.status(400).json({
        error: `Invalid categories: ${invalidCategories.join(', ')}. Allowed categories: ${predefinedCategories.join(', ')}`,
      });
    }
    const createdBy = req.user.id;
    const newPost = await postModel.createPost(title, content, categories, createdBy);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

const updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const updatedPost = await postModel.updatePost(req.params.id, title, content, categories);
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
  createPost,
  updatePost,
  deletePost,
};
