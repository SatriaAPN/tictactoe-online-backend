const {
  jwtSecretKey
} = require('../config/config');
const jwt = require('jsonwebtoken');


const jwtVerifying = async (req, res, next) => {
  if(req.path === '/api/users/auth') return next();
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  const jwtToken = req.headers.authorization.split(' ')[2]; // Header jwt {token}

  req.user = await jwt.verify(jwtToken, jwtSecretKey);
  next();
}

module.exports = jwtVerifying;