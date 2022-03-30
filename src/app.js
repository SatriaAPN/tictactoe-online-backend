const {
  app,
  server,
  express
} = require('./config/config');

// import the middleware
require('./config/middleware');

// importing router from the backend
app.use(require('./routers'));

// importing web socket from the backend
require('./webSocket');

// start server listening
server.listen(3001, () => {
  console.log('server running at port 3001');
})