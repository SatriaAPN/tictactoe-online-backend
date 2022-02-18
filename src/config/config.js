const development = require("./env/development")

const NODE_ENV = process.env.NODE_ENV 

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const config = {
  ...development,
  app,
  server,
  express
};

module.exports = config;
