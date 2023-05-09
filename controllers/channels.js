const Channel = require('../models/Channel');
const User = require('../models/User');
const ChannelMember = require('../models/ChannelMember');
const asyncHandler = require('../middlewares/asyncHandler');
const { fieldValidation } = require('../util/helpers');
const sequelize = require('../util/database');
const ErrorResponse = require('../util/errorResponse');
const { SERVEUR_ERROR, NOT_FOUND_ERR } = require('../util/responseMessage');
const { Sequelize, Op } = require('sequelize');

module.exports.createChannel = asyncHandler(async (req, res, next) => {
	const { loggedUser } = req;
	const { name, type, members } = req.body;

	fieldValidation(name, next);
	if (type !== 'private' && type !== 'public') fieldValidation('', next);

	let transaction;
	try {
		transaction = await sequelize.transaction();
		const channel = await Channel.create(
			{
				name,
				type,
				ownerId: loggedUser.id,
			},
			{
				transaction,
			},
		);
		await ChannelMember.create(
			{
				memberId: loggedUser.id,
				channelId: channel.id,
			},
			{
				transaction,
			},
		);
		for (const member of members) {
			await ChannelMember.create(
				{
					memberId: member,
					channelId: channel.id,
				},
				{
					transaction,
				},
			);
		}
		await transaction.commit();
		return res.status(201).json({ status: true, channel });
	} catch (e) {
		if (!transaction) next(new ErrorResponse(SERVEUR_ERROR));
		await transaction.rollback();
		next(new ErrorResponse(e.message));
	}
});

module.exports.getChannelById = asyncHandler(async (req, res, next) => {
	const { channelId } = req.params;

	const channel = await Channel.findOne({
		where: {
			id: channelId,
		},
		include: [
			{
				model: User,
				as: 'owner',
				attributes: ['id', 'name', 'email'],
			},
		],
	});
	if (!channel) return next(new ErrorResponse(NOT_FOUND_ERR, 404));
	return res.status(200).json({ status: true, channel });
});

module.exports.getChannels = asyncHandler(async (req, res) => {
	const { loggedUser } = req;
	const channels = await Channel.findAll({
		where: {
			[Op.or]: [
				{
					id: {
						[Op.in]: Sequelize.literal(
							`(SELECT "channelId" FROM "ChannelMembers" WHERE "memberId" = ${loggedUser.id})`,
						),
					},
				},
				{
					type: 'public',
				},
			],
		},
		include: [
			{
				model: User,
				as: 'owner',
				attributes: ['id', 'name', 'email'],
			},
		],
	});
	return res.status(200).json({ status: true, channels });
});

module.exports.addMembers = asyncHandler(async (req, res) => {
	// TODO validate inputs with Zod
	const { channelId } = req.params;
	const { members } = req.body;
	let userAdded = [];
	for (const member of members) {
		const [channelMember, created] = await ChannelMember.findOrCreate({
			where: { channelId, memberId: member },
			defaults: { channelId, memberId: member },
		});
		if (created) userAdded = [...userAdded, channelMember.memberId];
	}

	return res.status(201).json({ status: true, userAdded });
});
