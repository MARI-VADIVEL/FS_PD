const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'mining_platform_jwt_secret_key_2026_super_secure_enterprise';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'mining_platform_jwt_secret_key_2026_super_secure_enterprise';
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
