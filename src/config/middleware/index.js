const cors = require('cors');

const {
 app,
 express
} = require('../config');

app.use(cors());
// parse application/json, basically parse incoming Request Object as a JSON Object 
app.use(express.json());
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded());
app.use(require('./jwtMiddleware')); // jwt authentication

module.exports = app;