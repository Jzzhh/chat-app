const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {addUser, rmUser, getUser, getUserInRoom} = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');
const { get } = require('https');

const app = express();
app.use(router,cors);
const server = http.createServer(app);
const io = socketio(server,{
    cors:{
        origin:'http://localhost:3000',
        method: ['GET','POST']
    }
});

io.on('connection', (socket) => {
    console.log(`We have a new socket: ${socket.id}`);

    socket.on("join_room", (data, callback) => {
        console.log(data);
        const { error, user } = addUser( {id: socket.id, name: data.name, room: data.room} );

        if(error) {
            return callback(error);
        }
        console.log(user);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined.`} )

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room)});

        callback();
    })

    socket.on('sendMessage', (data, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: data});
        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room)});

        callback();
    })

    socket.on('disconnect', () =>{
        const user = rmUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', {user:'admin', text:`${user.name} has left.`});
        }
        console.log(`${socket.id} left.`);
    })

});

server.listen(PORT, () => {
    console.log(`Server running and listening on ${PORT}`);
});
