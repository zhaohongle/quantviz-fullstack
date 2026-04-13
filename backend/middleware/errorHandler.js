// ========================================
// 错误处理中间件
// ========================================

/**
 * 统一错误响应格式
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * 404 Not Found 处理
 */
function notFound(req, res, next) {
  const error = new ApiError(404, `接口不存在: ${req.method} ${req.path}`);
  next(error);
}

/**
 * 全局错误处理
 */
function errorHandler(err, req, res, next) {
  // 日志记录
  console.error('❌ 接口错误:', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // 默认状态码
  const statusCode = err.statusCode || 500;
  
  // 响应格式
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      code: statusCode,
      details: err.details || null,
      // 开发环境返回堆栈信息
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

/**
 * 异步路由错误捕获
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  asyncHandler
};
