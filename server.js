const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dbConfig = require('./configs/dbConfig');

// socket.io server
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
//

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Header',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(
  dbConfig.url,
  { useNewUrlParser: true }
);

// socket.io !!
require('./sockets/streams')(io);
// routes
const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoute');

app.use('/api/chatapp', auth);
app.use('/api/chatApp', posts);
app.use('/api/chatApp', users);
app.use('/api/chatApp', friends);

server.listen(3000, () => {
  console.log('running on port 3000');
});
