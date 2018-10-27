const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const _ = require('lodash');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dbConfig = require('./configs/dbConfig');

// class
const { User } = require('./helpers/UserClass');

// socket.io server
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
//

app.use(cors());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header(
//     'Access-Control-Allow-Methods',
//     'GET',
//     'POST',
//     'DELETE',
//     'PUT',
//     'OPTIONS'
//   );
//   res.header(
//     'Access-Control-Allow-Header',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   next();
// });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(
  dbConfig.url,
  { useNewUrlParser: true }
);

// socket.io !!
require('./sockets/streams')(io, User, _);
require('./sockets/private')(io);

// routes
const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoute');
const message = require('./routes/messageRoute');
const image = require('./routes/imageRoutes');

app.use('/api/chatapp', auth);
app.use('/api/chatapp', posts);
app.use('/api/chatapp', users);
app.use('/api/chatapp', friends);
app.use('/api/chatapp', message);
app.use('/api/chatapp', image);

server.listen(3000, () => {
  console.log('running on port 3000');
});
