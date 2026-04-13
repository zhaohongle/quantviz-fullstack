-- ========================================
-- QuantViz V2 数据库迁移脚本
-- 创建时间: 2026-04-13
-- 用途: 支持全球指数、实时资讯、板块资金流向、AI推荐
-- ========================================

-- ========================================
-- 模块 1: 全球指数 + 实时资讯
-- ========================================

-- 1.1 指数基础信息表
CREATE TABLE IF NOT EXISTS indices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE COMMENT '指数代码（如 sh000001）',
    name VARCHAR(100) NOT NULL COMMENT '指数名称',
    market VARCHAR(20) NOT NULL COMMENT '市场（CN/US/HK）',
    display_order INT DEFAULT 0 COMMENT '显示顺序',
    is_active BOOLEAN DEFAULT true COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_indices_market ON indices(market);
CREATE INDEX idx_indices_active ON indices(is_active);

-- 1.2 指数实时行情表
CREATE TABLE IF NOT EXISTS index_quotes (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL COMMENT '指数代码',
    current_price DECIMAL(10, 2) COMMENT '当前价格',
    change_amount DECIMAL(10, 2) COMMENT '涨跌额',
    change_percent DECIMAL(6, 2) COMMENT '涨跌幅(%)',
    open_price DECIMAL(10, 2) COMMENT '开盘价',
    high_price DECIMAL(10, 2) COMMENT '最高价',
    low_price DECIMAL(10, 2) COMMENT '最低价',
    close_price DECIMAL(10, 2) COMMENT '收盘价',
    volume BIGINT COMMENT '成交量',
    amount DECIMAL(20, 2) COMMENT '成交额',
    quote_time TIMESTAMP NOT NULL COMMENT '行情时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (symbol) REFERENCES indices(symbol) ON DELETE CASCADE
);

CREATE INDEX idx_quotes_symbol ON index_quotes(symbol);
CREATE INDEX idx_quotes_time ON index_quotes(quote_time DESC);
CREATE INDEX idx_quotes_symbol_time ON index_quotes(symbol, quote_time DESC);

-- 1.3 指数K线数据表
CREATE TABLE IF NOT EXISTS index_kline (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL COMMENT '指数代码',
    period VARCHAR(10) NOT NULL COMMENT '周期（5m/15m/30m/1h/1d/1w/1M）',
    kline_time TIMESTAMP NOT NULL COMMENT 'K线时间',
    open_price DECIMAL(10, 2) NOT NULL COMMENT '开盘价',
    high_price DECIMAL(10, 2) NOT NULL COMMENT '最高价',
    low_price DECIMAL(10, 2) NOT NULL COMMENT '最低价',
    close_price DECIMAL(10, 2) NOT NULL COMMENT '收盘价',
    volume BIGINT COMMENT '成交量',
    amount DECIMAL(20, 2) COMMENT '成交额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (symbol) REFERENCES indices(symbol) ON DELETE CASCADE,
    UNIQUE (symbol, period, kline_time)
);

CREATE INDEX idx_kline_symbol_period ON index_kline(symbol, period);
CREATE INDEX idx_kline_time ON index_kline(kline_time DESC);

-- 1.4 实时资讯表
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL COMMENT '标题',
    summary TEXT COMMENT '摘要',
    content TEXT COMMENT '正文',
    source VARCHAR(100) COMMENT '来源',
    source_url TEXT COMMENT '原文链接',
    author VARCHAR(100) COMMENT '作者',
    publish_time TIMESTAMP NOT NULL COMMENT '发布时间',
    category VARCHAR(50) COMMENT '分类（股市/债市/外汇/商品）',
    tags TEXT[] COMMENT '标签',
    related_symbols TEXT[] COMMENT '相关股票代码',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    is_important BOOLEAN DEFAULT false COMMENT '是否重要资讯',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_publish_time ON news(publish_time DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_important ON news(is_important);

-- ========================================
-- 模块 2: 板块资金流向
-- ========================================

-- 2.1 板块基础信息表
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '板块代码',
    name VARCHAR(100) NOT NULL COMMENT '板块名称',
    type VARCHAR(20) NOT NULL COMMENT '板块类型（industry/concept/region）',
    parent_code VARCHAR(20) COMMENT '父板块代码',
    description TEXT COMMENT '板块描述',
    stock_count INT DEFAULT 0 COMMENT '成分股数量',
    is_active BOOLEAN DEFAULT true COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sectors_type ON sectors(type);
CREATE INDEX idx_sectors_active ON sectors(is_active);

-- 2.2 板块资金流向表
CREATE TABLE IF NOT EXISTS sector_flow (
    id SERIAL PRIMARY KEY,
    sector_code VARCHAR(20) NOT NULL COMMENT '板块代码',
    flow_date DATE NOT NULL COMMENT '日期',
    flow_time TIME NOT NULL COMMENT '时间',
    main_inflow DECIMAL(20, 2) COMMENT '主力净流入（万元）',
    super_inflow DECIMAL(20, 2) COMMENT '超大单净流入（万元）',
    large_inflow DECIMAL(20, 2) COMMENT '大单净流入（万元）',
    medium_inflow DECIMAL(20, 2) COMMENT '中单净流入（万元）',
    small_inflow DECIMAL(20, 2) COMMENT '小单净流入（万元）',
    total_amount DECIMAL(20, 2) COMMENT '总成交额（万元）',
    change_percent DECIMAL(6, 2) COMMENT '涨跌幅（%）',
    leading_stock VARCHAR(20) COMMENT '领涨股代码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sector_code) REFERENCES sectors(code) ON DELETE CASCADE,
    UNIQUE (sector_code, flow_date, flow_time)
);

CREATE INDEX idx_sector_flow_code ON sector_flow(sector_code);
CREATE INDEX idx_sector_flow_date ON sector_flow(flow_date DESC, flow_time DESC);
CREATE INDEX idx_sector_flow_inflow ON sector_flow(main_inflow DESC);

-- 2.3 板块成分股表
CREATE TABLE IF NOT EXISTS sector_stocks (
    id SERIAL PRIMARY KEY,
    sector_code VARCHAR(20) NOT NULL COMMENT '板块代码',
    stock_code VARCHAR(20) NOT NULL COMMENT '股票代码',
    stock_name VARCHAR(100) NOT NULL COMMENT '股票名称',
    weight DECIMAL(6, 2) COMMENT '权重（%）',
    is_leading BOOLEAN DEFAULT false COMMENT '是否龙头',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sector_code) REFERENCES sectors(code) ON DELETE CASCADE,
    UNIQUE (sector_code, stock_code)
);

CREATE INDEX idx_sector_stocks_sector ON sector_stocks(sector_code);
CREATE INDEX idx_sector_stocks_stock ON sector_stocks(stock_code);
CREATE INDEX idx_sector_stocks_leading ON sector_stocks(is_leading);

-- 2.4 个股资金流向表
CREATE TABLE IF NOT EXISTS stock_flow (
    id SERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL COMMENT '股票代码',
    stock_name VARCHAR(100) NOT NULL COMMENT '股票名称',
    flow_date DATE NOT NULL COMMENT '日期',
    flow_time TIME NOT NULL COMMENT '时间',
    current_price DECIMAL(10, 2) COMMENT '最新价',
    change_percent DECIMAL(6, 2) COMMENT '涨跌幅（%）',
    main_inflow DECIMAL(20, 2) COMMENT '主力净流入（万元）',
    super_inflow DECIMAL(20, 2) COMMENT '超大单净流入（万元）',
    large_inflow DECIMAL(20, 2) COMMENT '大单净流入（万元）',
    medium_inflow DECIMAL(20, 2) COMMENT '中单净流入（万元）',
    small_inflow DECIMAL(20, 2) COMMENT '小单净流入（万元）',
    total_amount DECIMAL(20, 2) COMMENT '总成交额（万元）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (stock_code, flow_date, flow_time)
);

CREATE INDEX idx_stock_flow_code ON stock_flow(stock_code);
CREATE INDEX idx_stock_flow_date ON stock_flow(flow_date DESC, flow_time DESC);
CREATE INDEX idx_stock_flow_inflow ON stock_flow(main_inflow DESC);

-- ========================================
-- 模块 3: AI精选推荐 + 准确率追踪
-- ========================================

-- 3.1 AI推荐记录表
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    recommend_date DATE NOT NULL COMMENT '推荐日期',
    stock_code VARCHAR(20) NOT NULL COMMENT '股票代码',
    stock_name VARCHAR(100) NOT NULL COMMENT '股票名称',
    recommend_price DECIMAL(10, 2) NOT NULL COMMENT '推荐价格',
    target_price DECIMAL(10, 2) COMMENT '目标价格',
    stop_loss_price DECIMAL(10, 2) COMMENT '止损价格',
    recommend_reason TEXT COMMENT '推荐理由（简短）',
    confidence_score DECIMAL(4, 2) COMMENT '置信度评分（0-100）',
    risk_level VARCHAR(20) COMMENT '风险等级（低/中/高）',
    holding_period VARCHAR(20) COMMENT '持有周期（短线/中线/长线）',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态（active/expired/achieved）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_recommend_date ON ai_recommendations(recommend_date DESC);
CREATE INDEX idx_ai_recommend_code ON ai_recommendations(stock_code);
CREATE INDEX idx_ai_recommend_status ON ai_recommendations(status);

-- 3.2 AI推荐详细分析表
CREATE TABLE IF NOT EXISTS ai_recommendation_analysis (
    id SERIAL PRIMARY KEY,
    recommendation_id INT NOT NULL COMMENT '推荐记录ID',
    
    -- 基本面分析
    fundamental_score DECIMAL(4, 2) COMMENT '基本面评分（0-100）',
    pe_ratio DECIMAL(10, 2) COMMENT 'PE市盈率',
    pb_ratio DECIMAL(10, 2) COMMENT 'PB市净率',
    roe DECIMAL(6, 2) COMMENT 'ROE净资产收益率（%）',
    revenue_growth DECIMAL(6, 2) COMMENT '营收增长率（%）',
    profit_growth DECIMAL(6, 2) COMMENT '利润增长率（%）',
    
    -- 技术面分析
    technical_score DECIMAL(4, 2) COMMENT '技术面评分（0-100）',
    macd_signal VARCHAR(20) COMMENT 'MACD信号',
    rsi_value DECIMAL(6, 2) COMMENT 'RSI值',
    kdj_signal VARCHAR(20) COMMENT 'KDJ信号',
    boll_position VARCHAR(20) COMMENT '布林带位置',
    ma_trend VARCHAR(20) COMMENT '均线趋势',
    
    -- 情绪面分析
    sentiment_score DECIMAL(4, 2) COMMENT '情绪面评分（0-100）',
    news_sentiment VARCHAR(20) COMMENT '新闻情绪（正面/中性/负面）',
    news_count INT COMMENT '相关新闻数量',
    social_sentiment VARCHAR(20) COMMENT '社交媒体情绪',
    analyst_rating DECIMAL(4, 2) COMMENT '分析师评级平均分',
    
    -- AI综合分析
    ai_summary TEXT COMMENT 'AI综合分析（Claude生成）',
    key_factors TEXT[] COMMENT '关键因素列表',
    risk_warnings TEXT[] COMMENT '风险提示列表',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_analysis_recommend ON ai_recommendation_analysis(recommendation_id);

-- 3.3 AI推荐追踪表
CREATE TABLE IF NOT EXISTS ai_recommendation_tracking (
    id SERIAL PRIMARY KEY,
    recommendation_id INT NOT NULL COMMENT '推荐记录ID',
    tracking_date DATE NOT NULL COMMENT '追踪日期',
    current_price DECIMAL(10, 2) NOT NULL COMMENT '当前价格',
    max_price DECIMAL(10, 2) COMMENT '期间最高价',
    min_price DECIMAL(10, 2) COMMENT '期间最低价',
    return_rate DECIMAL(6, 2) COMMENT '收益率（%）',
    max_return_rate DECIMAL(6, 2) COMMENT '最大收益率（%）',
    max_drawdown DECIMAL(6, 2) COMMENT '最大回撤（%）',
    days_held INT COMMENT '持有天数',
    is_target_achieved BOOLEAN DEFAULT false COMMENT '是否达到目标价',
    is_stop_loss_triggered BOOLEAN DEFAULT false COMMENT '是否触发止损',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    UNIQUE (recommendation_id, tracking_date)
);

CREATE INDEX idx_ai_tracking_recommend ON ai_recommendation_tracking(recommendation_id);
CREATE INDEX idx_ai_tracking_date ON ai_recommendation_tracking(tracking_date DESC);

-- 3.4 AI准确率统计表
CREATE TABLE IF NOT EXISTS ai_accuracy_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL COMMENT '统计日期',
    period VARCHAR(20) NOT NULL COMMENT '统计周期（7d/30d/90d/all）',
    
    -- 基础统计
    total_recommendations INT DEFAULT 0 COMMENT '总推荐数',
    active_recommendations INT DEFAULT 0 COMMENT '进行中推荐数',
    expired_recommendations INT DEFAULT 0 COMMENT '已过期推荐数',
    achieved_recommendations INT DEFAULT 0 COMMENT '达标推荐数',
    
    -- 准确率统计
    accuracy_rate DECIMAL(6, 2) COMMENT '准确率（%）',
    avg_return_rate DECIMAL(6, 2) COMMENT '平均收益率（%）',
    max_return_rate DECIMAL(6, 2) COMMENT '最高收益率（%）',
    min_return_rate DECIMAL(6, 2) COMMENT '最低收益率（%）',
    win_rate DECIMAL(6, 2) COMMENT '胜率（%）',
    
    -- 风险控制
    avg_max_drawdown DECIMAL(6, 2) COMMENT '平均最大回撤（%）',
    stop_loss_trigger_rate DECIMAL(6, 2) COMMENT '止损触发率（%）',
    
    -- 分类统计
    short_term_accuracy DECIMAL(6, 2) COMMENT '短线准确率（%）',
    medium_term_accuracy DECIMAL(6, 2) COMMENT '中线准确率（%）',
    long_term_accuracy DECIMAL(6, 2) COMMENT '长线准确率（%）',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (stat_date, period)
);

CREATE INDEX idx_accuracy_date ON ai_accuracy_stats(stat_date DESC);
CREATE INDEX idx_accuracy_period ON ai_accuracy_stats(period);

-- ========================================
-- 初始化数据
-- ========================================

-- 插入初始指数列表
INSERT INTO indices (symbol, name, market, display_order) VALUES
    ('sh000001', '上证指数', 'CN', 1),
    ('sz399001', '深证成指', 'CN', 2),
    ('sz399006', '创业板指', 'CN', 3),
    ('sh000300', '沪深300', 'CN', 4),
    ('sh000016', '上证50', 'CN', 5),
    ('sz399005', '中小100', 'CN', 6),
    ('sh000688', '科创50', 'CN', 7),
    ('hsi', '恒生指数', 'HK', 8),
    ('dji', '道琼斯', 'US', 9),
    ('nasdaq', '纳斯达克', 'US', 10),
    ('spx', '标普500', 'US', 11)
ON CONFLICT (symbol) DO NOTHING;

-- 插入初始板块分类
INSERT INTO sectors (code, name, type, description) VALUES
    ('BK0001', '银行', 'industry', '银行业板块'),
    ('BK0002', '证券', 'industry', '证券业板块'),
    ('BK0003', '保险', 'industry', '保险业板块'),
    ('BK0004', '房地产', 'industry', '房地产板块'),
    ('BK0005', '医药生物', 'industry', '医药生物板块'),
    ('BK0006', '电子', 'industry', '电子板块'),
    ('BK0007', '计算机', 'industry', '计算机板块'),
    ('BK0008', '通信', 'industry', '通信板块'),
    ('BK0009', '汽车', 'industry', '汽车板块'),
    ('BK0010', '新能源', 'concept', '新能源概念'),
    ('BK0011', '人工智能', 'concept', '人工智能概念'),
    ('BK0012', '芯片半导体', 'concept', '芯片半导体概念')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- 视图定义
-- ========================================

-- 最新指数行情视图
CREATE OR REPLACE VIEW v_latest_index_quotes AS
SELECT DISTINCT ON (symbol)
    i.symbol,
    i.name,
    i.market,
    q.current_price,
    q.change_amount,
    q.change_percent,
    q.volume,
    q.amount,
    q.quote_time
FROM indices i
LEFT JOIN index_quotes q ON i.symbol = q.symbol
ORDER BY symbol, quote_time DESC;

-- 板块资金流向排行视图
CREATE OR REPLACE VIEW v_sector_flow_ranking AS
SELECT 
    s.code,
    s.name,
    s.type,
    sf.main_inflow,
    sf.change_percent,
    sf.flow_date,
    sf.flow_time,
    RANK() OVER (PARTITION BY sf.flow_date ORDER BY sf.main_inflow DESC) as rank_inflow,
    RANK() OVER (PARTITION BY sf.flow_date ORDER BY sf.change_percent DESC) as rank_change
FROM sectors s
INNER JOIN sector_flow sf ON s.code = sf.sector_code
WHERE sf.flow_date = CURRENT_DATE;

-- AI推荐表现视图
CREATE OR REPLACE VIEW v_ai_recommendation_performance AS
SELECT 
    ar.id,
    ar.recommend_date,
    ar.stock_code,
    ar.stock_name,
    ar.recommend_price,
    ar.target_price,
    ar.confidence_score,
    art.current_price,
    art.return_rate,
    art.max_return_rate,
    art.max_drawdown,
    art.days_held,
    art.is_target_achieved,
    ar.status
FROM ai_recommendations ar
LEFT JOIN LATERAL (
    SELECT * FROM ai_recommendation_tracking
    WHERE recommendation_id = ar.id
    ORDER BY tracking_date DESC
    LIMIT 1
) art ON true;

-- ========================================
-- 完成
-- ========================================

COMMENT ON DATABASE quantviz IS 'QuantViz 股票分析平台数据库 V2';
