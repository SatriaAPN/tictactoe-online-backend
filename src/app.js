const {
  app,
  server,
  express
} = require('./config/config');
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(require('./config/middleware/jwtMiddleware')); // jwt authentication

// importing router from the backend
app.use(require('./routers'));

// importing web socket from the backend
require('./webSocket');

// start server listening
server.listen(3001, () => {
  console.log('server running at port 3001');
})