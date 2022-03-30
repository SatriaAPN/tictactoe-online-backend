const cors = require('cors');

const {
 app,
 express
} = require('../config');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(require('./jwtMiddleware')); // jwt authentication

module.exports = app;