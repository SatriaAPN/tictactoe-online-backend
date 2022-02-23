const jwt = require('jsonwebtoken');
const {
  jwtSecretKey
} = require('../config');

const verifJwtToken = async(token) => {
  const jwtToken = token.split(' ')[2]; // Header jwt {token}

  const userData = await jwt.verify(jwtToken, jwtSecretKey);
  userData.token = jwtToken;
  
  return userData;
}

const signJwtToken = async(username, uuid) => {
  return await jwt.sign({ username, uuid }, jwtSecretKey);
}

module.exports = {verifJwtToken, signJwtToken};