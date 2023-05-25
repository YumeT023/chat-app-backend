const express = require('express');
const router = express.Router();
const {
	createUser,
	loginUser,
	getUsersByChannelId,
	getCurrentUser,
	updateUser,
	getAllUsers,
} = require('../controllers/users');
const { protect } = require('../middlewares/auth');

router.route('/users').post(createUser).get(protect, getAllUsers);
router.route('/channels/:channelId/users').get(protect, getUsersByChannelId);
router.post('/users/login', loginUser);

router.route('/user').get(protect, getCurrentUser).put(protect, updateUser);

module.exports = router;
