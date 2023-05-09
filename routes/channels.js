const express = require('express');
const router = express.Router();
const {
	createChannel,
	getChannels,
	addMembers,
	getChannelById,
} = require('../controllers/channels');
const { protect } = require('../middlewares/auth');

router.route('/channel').post(protect, createChannel);
router.route('/channel/:channelId').get(protect, getChannelById);
router.route('/channels/:channelId/members').post(protect, addMembers);
router.route('/channels').get(protect, getChannels);

module.exports = router;
