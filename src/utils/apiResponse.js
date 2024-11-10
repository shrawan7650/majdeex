
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
// Centralized Response Handler
exports.handleResponse = (res, data, message, statusCode) => {
  if (statusCode >= 200 && statusCode < 300) {
    return exports.successResponse(res, data, message, statusCode);
  } else {
    return exports.errorResponse(res, message, statusCode);
  }
};

//   return responseHandler.handleResponse(res, data, 'Data retrieved successfully', 200);