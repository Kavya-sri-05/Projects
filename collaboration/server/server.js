const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));

let documentContent = "";

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.emit('init-document', documentContent);

    socket.on('content-change', (newContent) => {
        documentContent = newContent;
        socket.broadcast.emit('content-update', newContent);
    });

    // Add the draw-line handler inside the connection scope
    socket.on('draw-line', (data) => {
        socket.broadcast.emit('draw-line', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('doc-change', (newContent) => {
        socket.broadcast.emit('doc-update', newContent);
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});