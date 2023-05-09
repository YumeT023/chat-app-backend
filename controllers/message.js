const asyncHandler = require('../middlewares/asyncHandler');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');
const ErrorResponse = require('../util/errorResponse');
const { Op } = require('sequelize');

module.exports.getMessagesByChannel = asyncHandler(async (req, res, next) => {
	// TODO: make sure that connected user is part of the channel if it is Private
	const { channelId } = req.params;
	const channel = await Channel.findByPk(channelId);
	if (!channel) {
		return next(new ErrorResponse(`Channel not found`, 404));
	}
	const messages = await Message.findAll({
		where: {
			channelId,
		},
		include: [
			{
				model: User,
				as: 'sender',
				attributes: ['id', 'name', 'email'],
			},
		],
		order: [['createdAt', 'DESC']],
	});
	return res.status(200).json({ status: true, messages });
});

module.exports.getMessagesByUser = asyncHandler(async (req, res) => {
	const { loggedUser } = req;

	const { userId } = req.params;
	const messages = await Message.findAll({
		where: {
			recipientId: {
				[Op.in]: [userId, loggedUser.id],
			},
			senderId: {
				[Op.in]: [loggedUser.id, userId],
			},
		},
		include: [
			{
				model: User,
				as: 'sender',
				attributes: ['id', 'name', 'email'],
			},
		],
		order: [['createdAt', 'DESC']],
	});
	return res.status(200).json({ status: true, messages });
});

module.exports.sendMessage = asyncHandler(async (req, res) => {
	const { loggedUser } = req;
	const { channelId, recipientId, content } = req.body;
	const message = await Message.create({
		senderId: loggedUser.id,
		channelId: channelId ?? null,
		recipientId: !channelId && recipientId ? recipientId : null,
		content,
	});
	return res.status(201).json({ status: true, message });
});
