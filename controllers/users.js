const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../util/errorResponse');
const { sign } = require('../util/jwt');
const bcrypt = require('bcryptjs');
const { fieldValidation } = require('../util/helpers');
const { Op } = require('sequelize');

module.exports.createUser = asyncHandler(async (req, res, next) => {
	const { email, password, name, bio } = req.body;

	fieldValidation(email, next);
	fieldValidation(password, next);
	fieldValidation(name, next);

	const user = await User.create({
		email,
		password,
		name,
		bio,
	});

	if (user.dataValues.password) {
		delete user.dataValues.password;
	}

	user.dataValues.token = await sign(user);

	user.dataValues.bio = null;
	user.dataValues.image = null;

	res.status(201).json({ status: true, user });
});

module.exports.loginUser = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	fieldValidation(email, next);
	fieldValidation(password, next);

	const user = await User.findOne({
		where: {
			email: email,
		},
	});

	if (!user) {
		return next(new ErrorResponse(`User not found`, 404));
	}

	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('Wrong password', 401));
	}

	delete user.dataValues.password;

	user.dataValues.token = await sign(user);

	user.dataValues.bio = null;

	res.status(200).json({ status: true, user });
});

module.exports.getCurrentUser = asyncHandler(async (req, res, next) => {
	const { loggedUser } = req;
	const user = await User.findByPk(loggedUser.id);

	if (!user) {
		return next(new ErrorResponse(`User not found`, 404));
	}
	delete user.dataValues.password;
	user.dataValues.token = req.headers.authorization.split(' ')[1];

	res.status(200).json({ status: true, user });
});

module.exports.updateUser = asyncHandler(async (req, res, next) => {
	const { loggedUser } = req;
	let isOldPasswordMatch = true;
	const { name, oldPassword, password, bio } = req.body;
	let newUserData = {
		name: name ?? loggedUser.name,
		bio: bio ?? loggedUser.bio,
	};
	const currentUserData = await User.findByPk(loggedUser.id);

	// return res.json({ loggedUser });

	if (oldPassword) {
		isOldPasswordMatch = await bcrypt.compare(
			oldPassword,
			currentUserData.password,
		);
		if (!isOldPasswordMatch) {
			return next(new ErrorResponse('Wrong password', 401));
		}

		fieldValidation(password, next);
		if (!password) return next(new ErrorResponse(`Missing fields`, 400));
		newUserData = { ...newUserData, password };
	}
	// return res.json(newUserData);

	const newUser = await currentUserData.update(newUserData, {
		returning: true,
	});

	// const user = await User.findByPk(loggedUser.id);
	delete newUser.dataValues.password;

	newUser.dataValues.token = req.headers.authorization.split(' ')[1];

	res.status(200).json({ status: true, user: newUser });
});

module.exports.getAllUsers = asyncHandler(async (req, res) => {
	const { loggedUser } = req;
	const users = await User.findAll({
		where: { id: { [Op.not]: loggedUser.id } },
		attributes: ['id', 'name', 'email', 'bio'],
	});

	return res.status(200).json({ status: true, users });
});
