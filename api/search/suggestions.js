// Vercel Serverless Function: Search Suggestions
const mockStocks = [
  { code: "600519", name: "贵州茅台", pinyin: "guizhoumaotai" },
  { code: "000858", name: "五粮液", pinyin: "wuliangy" },
  { code: "601318", name: "中国平安", pinyin: "zhongguopingan" },
  { code: "300750", name: "宁德时代", pinyin: "ningdeshidai" },
  { code: "601398", name: "工商银行", pinyin: "gongshangyinhang" },
  { code: "000001", name: "平安银行", pinyin: "pinganyinhang" },
  { code: "600036", name: "招商银行", pinyin: "zhaoshangyinhang" },
  { code: "002594", name: "比亚迪", pinyin: "biyadi" }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: '缺少查询参数 q'
      });
    }
    
    const query = q.toLowerCase();
    
    // 搜索匹配（支持股票代码、中文名称、拼音）
    const results = mockStocks.filter(stock => 
      stock.code.includes(query) || 
      stock.name.includes(q) || 
      stock.pinyin.includes(query)
    ).slice(0, 10);
    
    res.status(200).json({
      data: results,
      query: q,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      error: '搜索失败',
      message: error.message
    });
  }
};
