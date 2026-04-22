const { getTokenFromRequest, verifyToken } = require("../auth");

function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  req.user = token ? verifyToken(token) : null;
  next();
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.user = user;
  next();
}

module.exports = {
  optionalAuth,
  requireAuth,
};
