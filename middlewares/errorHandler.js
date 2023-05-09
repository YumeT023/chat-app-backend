const ErrorResponse = require('../util/errorResponse');
const {
	JWT_TOKEN_INVALID,
	UNIQUE_CONSTRAINS_ERROR,
} = require('../util/responseMessage');

//REQUESTED PAGE IS NOT FOUND
module.exports.notFound = (req, res, next) => {
	const error = new ErrorResponse(`Not Found - ${req.originalUrl}`);
	res.status(404);
	next(error);
};

/**
 * @param {*} err
 * @param {*} req
 * @param {NextFunction|Response<*, Record<string, *>>} res
 * @param {NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
module.exports.errorHandler = (err, req, res, next) => {
	// Log to console for dev
	console.log(err.message?.red);
	console.log(err.stack?.red);
	const statusCode = err.statusCode ?? 500;

	if (err.name === 'SequelizeUniqueConstraintError') {
		return res.status(409).json({
			status: false,
			code: err.name,
			statusCode: 409,
			message: UNIQUE_CONSTRAINS_ERROR,
		});
	}

	if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({
			status: false,
			code: err.name,
			statusCode: 401,
			message: JWT_TOKEN_INVALID,
		});
	}

	return res.status(statusCode).json({
		status: false,
		code: err.name,
		statusCode: statusCode,
		message: err.message,
	});
};
