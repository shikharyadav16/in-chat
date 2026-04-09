const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:5173", "https://10.76.44.242:5173"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://10.76.44.242:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middlewares/auth.middleware');
const { isSocketAuthenticated } = require('./middlewares/socketAuth.middleware');
const path = require('path');

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.use(isSocketAuthenticated);

const connectDb = require('./config/db');
connectDb();

const socketHandler = require('./sockets/connection');
socketHandler(io);

const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.route');
const chatRoutes = require('./routes/chat.route');
const messageRoutes = require('./routes/message.route');

app.use('/', authRoutes);
app.use('/', isAuthenticated, contactRoutes);
app.use('/', isAuthenticated, chatRoutes);
app.use('/', isAuthenticated, messageRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
