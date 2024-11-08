// Success Response
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => { 
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

// Error Response
exports.errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    status: false,
    message,
    error,
  });
};
