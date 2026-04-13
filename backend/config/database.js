// ========================================
// 数据库配置
// ========================================

const { Pool } = require('pg');

// 数据库连接配置
const dbConfig = {
  // Render PostgreSQL 免费方案（从环境变量读取）
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quantviz',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  
  // 连接池配置
  max: 20,                    // 最大连接数
  idleTimeoutMillis: 30000,   // 空闲连接超时
  connectionTimeoutMillis: 2000, // 连接超时
  
  // SSL配置（生产环境需要）
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

// 创建连接池
const pool = new Pool(dbConfig);

// 连接池错误处理
pool.on('error', (err, client) => {
  console.error('❌ 数据库连接池错误:', err);
});

// 测试数据库连接
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ 数据库连接成功:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询（带错误处理）
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // 慢查询日志（超过1秒）
    if (duration > 1000) {
      console.warn(`⚠️  慢查询 (${duration}ms):`, text);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 查询错误:', error.message);
    console.error('   SQL:', text);
    console.error('   参数:', params);
    throw error;
  }
}

// 事务支持
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
