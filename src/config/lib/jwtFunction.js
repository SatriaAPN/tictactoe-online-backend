const jwt = require('jsonwebtoken');
const {
  jwtSecretKey
} = require('../config');

const verifJwtToken = async(token) => {
  const jwtToken = token.split(' ')[2]; // Header jwt {token}

  const userData = await jwt.verify(jwtToken, jwtSecretKey);
  userData.token = jwtToken;
  
  return userData; // return the user data
}

const signJwtToken = async(username, uuid) => {
  return await jwt.sign({ username, uuid }, jwtSecretKey); // return the signed jwt key
}

module.exports = {verifJwtToken, signJwtToken};