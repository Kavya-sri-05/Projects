import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Container, Paper, TextField, Button, Box, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './App.css';

const socket = io.connect("http://localhost:3001");

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [isJoined, setIsJoined] = useState(false);

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
      setIsJoined(true);
      setMessageReceived([{
        message: `Welcome to room: ${room}`,
        time: new Date().toLocaleTimeString(),
        system: true,
        id: Date.now()
      }]);
    }
  };

  const sendMessage = () => {
    if (message !== "" && isJoined) {
      const messageData = {
        room: room,
        message: message,
        time: new Date().toLocaleTimeString(),
        sent: true,
        id: Date.now()
      };
      socket.emit("send_message", messageData);
      setMessageReceived((list) => [...list, messageData]);
      setMessage("");
    }
  };

  useEffect(() => {
    const messageHandler = (data) => {
      setMessageReceived((list) => {
        if (!list.some(msg => msg.id === data.id)) {
          return [...list, { ...data, sent: false }];
        }
        return list;
      });
    };

    socket.on("receive_message", messageHandler);

    return () => {
      socket.off("receive_message", messageHandler);
    };
  }, []);

  return (
    <div className="chat-container">
      <Container maxWidth="sm">
        <Paper elevation={3} className="chat-paper" sx={{ p: 3 }}>
          <Typography variant="h4" className="chat-header">
            Real-Time Chat
          </Typography>
          
          {!isJoined ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Enter Room ID"
                variant="outlined"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                sx={{ mb: 2 }}
                className="chat-input"
              />
              <Button 
                fullWidth
                variant="contained" 
                onClick={joinRoom}
                disabled={!room}
                className="join-button"
              >
                Join Chat Room
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Room: {room}
              </Typography>
              
              <Box className="messages-box" sx={{ height: 400, overflow: 'auto' }}>
                {messageReceived.map((msg, index) => (
                  <Paper 
                    key={index} 
                    className={`message-bubble ${msg.sent ? 'sent-message' : 'received-message'}`}
                  >
                    <Typography>{msg.message}</Typography>
                    <Typography className="message-time">
                      {msg.time}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                  fullWidth
                  label="Type a message"
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="chat-input"
                />
                <Button 
                  variant="contained" 
                  onClick={sendMessage}
                  className="send-button"
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default App;