const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
	getMessagesByChannel,
	getMessagesByUser,
	sendMessage,
} = require('../controllers/message');

router.route('/message').post(protect, sendMessage);
router.route('/messages/channel/:channelId').get(protect, getMessagesByChannel);
router.route('/messages/:userId').get(protect, getMessagesByUser);

module.exports = router;
