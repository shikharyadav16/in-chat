const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectDb = require('./config/db');
connectDb();

const socketHandler = require('./sockets/connection');
socketHandler(io);

const authRoutes = require('./routes/auth.routes');

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

app.use('/api/', authRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
