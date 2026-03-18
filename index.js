const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middlewares/auth.middleware');
const { isSocketAuthenticated } = require('./middlewares/socketAuth.middleware');
const path = require('path');

app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.use(isSocketAuthenticated);

const connectDb = require('./config/db');
connectDb();

const socketHandler = require('./sockets/connection');
socketHandler(io);

const authRoutes = require('./routes/auth.routes');
const mainRoutes = require('./routes/main.routes');

app.use('/', authRoutes);
app.use('/', isAuthenticated, mainRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
