const http = require('http');
const path = require('path');
/**
  express is an HTTP server framework that will do an
  incredible amount of work for us. It's rather overkill,
  but it's a good framework to know. We are using it to
  send the index page and automatically host the entire
  'hosted' folder and contents.
**/
const express = require('express');
const socketio = require('socket.io');
const sockets = require('./sockets.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// Create a new express app
// This will add all of the custom ExpressJS functionality to our
// HTTP requests and responses.
const app = express();

/**
  app.use tells express to run this check on every request
  In this line we are saying to check if the url is going to
  '/assets/someFilePath' and if so, then look for that file
  path inside of our hosted folder. That means clients have
  full access to everything in hosted and NO other folder.
  In hosted, the clients can access anything by the relative path.

  So the URL /assets/style.css would pull the file /hosted/style.css

  The URL /assets/img/favicon.png would pull the file /hosted/img/favicon.png
**/
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

/**
  app.get says on GET request to a certain URL
  In this case, on GET requests to the / (or homepage) URL.
  We get the request and response objects from the normal
  Node HTTP server.
**/
app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../hosted/index.html`));
});

// When using express, create an HTTP server and pass in the express app
// That way express will extend the normal HTTP server with its functions.
const server = http.createServer(app);

// Pass the HTTP server into socketio to get a socketio server
// This will also allow socketio to extend the base HTTP server
const io = socketio(server);

// pass our socket server to our socket function
sockets.setupSockets(io);

// start listening for traffic
server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});

