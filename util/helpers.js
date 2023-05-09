const ErrorResponse = require('./errorResponse');
const fieldValidation = (field, next) => {
	if (!field) {
		return next(new ErrorResponse(`Missing fields`, 400));
	}
};

module.exports = { fieldValidation };
