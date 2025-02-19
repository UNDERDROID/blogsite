const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authorizeRole } = require('../middlewares/roleMiddleware');

router.post('/:adminId', 
  authorizeRole('user'),
  followController.followAdmin
);

router.delete('/:adminId', 
  authorizeRole('user'),
  followController.unfollowAdmin
);

router.get('/following', 
  authorizeRole('user'),
  followController.getFollowedAdmins
);

module.exports = router;