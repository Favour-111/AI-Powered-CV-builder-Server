const crypto = require("crypto");

const AUTH_SECRET = process.env.AUTH_SECRET || "cv-builder-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding
    ? normalized.padEnd(normalized.length + (4 - padding), "=")
    : normalized;

  return Buffer.from(padded, "base64").toString("utf8");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (!storedPassword.includes(":")) {
    return storedPassword === password;
  }

  const [salt, originalDigest] = storedPassword.split(":");
  if (!salt || !originalDigest) {
    return false;
  }

  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest, "hex"),
    Buffer.from(originalDigest, "hex"),
  );
}

function signToken(user) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + TOKEN_TTL_MS,
    }),
  );
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) {
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload));
    if (!decoded.exp || decoded.exp < Date.now()) {
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
}

module.exports = {
  getTokenFromRequest,
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
};
