const express = require("express");
const bodyParser = require("body-parser");
const {Server} = require("socket.io");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

const io = new Server(server,{
    cors: true,
    origin: ["http://localhost:5173", "https://socirra.onrender.com"],
    methods: ["GET", "POST"],
});
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
}));

app.get("/", (req, res) => {
  res.send("Socket.IO backend running");
});

const PORT = process.env.PORT || 8000;
// const HOST = process.env.HOST || "http://localhost";

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
    console.log(`New connection established with socket ID: ${socket.id}`);
    socket.on("join-room", (data) => {
        const {roomId, emailId} = data;

        console.log(`User with email ${emailId} joined room ${roomId}`);

        //storing some info in temp db
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);

        socket.join(roomId);
        socket.emit("joined-room", { roomId }); //sent after the request made from client to join the room via socket.
        socket.broadcast.to(roomId).emit("user-joined", {emailId})
    });

    //after joining room, creating an offer
    socket.on('call-user', data => {
        const {emailId, offer} = data;

        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);

        socket.to(socketId).emit('incoming-call', {from: fromEmail, offer})
    })

    //accepting offer and creating an answer
    socket.on('call-accepted', data => {
        const {emailId, answer} = data;
        const socketId = emailToSocketMapping.get(emailId);

        socket.to(socketId).emit('call-accepted', {answer});
    })
});

server.listen(PORT,'0.0.0.0', () => {console.log(`Server listening on port ${PORT}`)});
// io.listen(8001);