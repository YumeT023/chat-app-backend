const { verify } = require('../util/jwt');
const User = require('../models/User');
const ErrorResponse = require('../util/errorResponse');
const { errorHandler } = require('./errorHandler');
const { JWT_TOKEN_INVALID } = require('../util/responseMessage');

exports.protect = async (req, res, next) => {
	try {
		const { headers } = req;
		if (!headers.authorization) throw new ErrorResponse(JWT_TOKEN_INVALID, 401);

		const token = headers.authorization.split(' ')[1];
		if (!token) new ErrorResponse(JWT_TOKEN_INVALID, 401);

		const userVerified = await verify(token);
		if (!userVerified) throw new ErrorResponse(JWT_TOKEN_INVALID, 401);

		req.loggedUser = await User.findOne({
			attributes: { exclude: ['email', 'password'] },
			where: { email: userVerified.email },
		});

		if (!req.loggedUser) throw new ErrorResponse(JWT_TOKEN_INVALID, 401);

		headers.email = userVerified.email;
		req.loggedUser.dataValues.token = token;

		next();
	} catch (error) {
		return errorHandler(error, req, res, next);
	}
};
