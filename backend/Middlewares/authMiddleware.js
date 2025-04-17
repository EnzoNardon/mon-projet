const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(' ')[1]; // format "Bearer TOKEN"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Injecte l'utilisateur dans la requête
    next();
  } catch (e) {
    res.status(403).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = verifyToken;
