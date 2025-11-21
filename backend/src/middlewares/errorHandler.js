const ApiError = require('../utils/ApiError');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  console.error('Unhandled error:', err);

  return errorResponse(res, 'Internal Server Error', 500);
};

module.exports = errorHandler;
