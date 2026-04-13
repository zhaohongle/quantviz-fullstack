// ========================================
// 日志中间件
// ========================================

/**
 * 请求日志
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? '❌' : '✅';
    
    console.log(`${logLevel} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}

/**
 * 性能监控
 */
function performanceMonitor(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // 慢接口告警（超过3秒）
    if (duration > 3000) {
      console.warn(`⚠️  慢接口: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
}

module.exports = {
  requestLogger,
  performanceMonitor
};
