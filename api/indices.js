// Vercel Serverless Function: Indices List
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Mock 数据
  const indices = [
    {
      id: 1,
      symbol: "sh000001",
      name: "上证指数",
      market: "CN",
      display_order: 1,
      current_price: 3280.52,
      change_amount: -12.35,
      change_percent: -0.38,
      open_price: 3290,
      high_price: 3295.80,
      low_price: 3275.20,
      close_price: 3292.87,
      volume: 285000000,
      amount: 32100000000,
      quote_time: new Date().toISOString()
    },
    {
      id: 2,
      symbol: "sz399001",
      name: "深证成指",
      market: "CN",
      display_order: 2,
      current_price: 11250.68,
      change_amount: 25.30,
      change_percent: 0.23,
      open_price: 11220,
      high_price: 11275.50,
      low_price: 11210.30,
      close_price: 11225.38,
      volume: 195000000,
      amount: 23500000000,
      quote_time: new Date().toISOString()
    }
  ];
  
  res.status(200).json({
    success: true,
    data: indices,
    timestamp: Date.now()
  });
};
