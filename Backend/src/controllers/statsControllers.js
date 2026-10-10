const statsService = require("../services/stats.service");
const asyncHandler = require("../utils/asyncHandler");

const getOverview = asyncHandler(async (req, res) => {
  const stats = await statsService.getOverview(req.userId);
  res.status(200).json(stats);
});

module.exports = { getOverview };
