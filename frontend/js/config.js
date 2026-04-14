// API 配置文件
// 根据环境自动切换 API 地址

const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  
  // 生产环境（Vercel）
  if (hostname.includes('vercel.app')) {
    return '';  // Vercel 使用相对路径，自动路由到 /api
  }
  
  // 本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // 其他环境默认使用相对路径
  return '';
})();

// 导出配置
window.API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    health: '/api/health',
    homeData: '/api/home/data',
    indices: '/api/indices',
    recommendations: '/api/recommendations',
    filterStrategies: '/api/filter/strategies',
    searchSuggestions: '/api/search/suggestions',
    news: '/api/news'
  },
  TIMEOUT: 10000,  // 请求超时时间（毫秒）
  RETRY_TIMES: 3   // 失败重试次数
};

console.log('🔧 API 配置已加载:', window.API_CONFIG);
