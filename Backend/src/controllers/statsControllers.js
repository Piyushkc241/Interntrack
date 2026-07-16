const statsService = require("../services/stats.service");

const getOverview = async (req, res) => {
  try {
    const stats = await statsService.getOverview(req.userId);
    res.status(200).json(stats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { getOverview };
