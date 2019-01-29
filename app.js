const app = require('express')();
const http = require ('http').Server(app);
const io = require('socket.io')(http);

/**
 * Serve static content
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});


io.on('connection', (socket) => {

    /**
     * Create chat room
     * @type event
     */
    socket.on('create_room', (room) => {
        room = room || socket.id;

        // Create and Join room
        socket.join(room);

        socket.emit('response', {
            type: 'create_room',
            status: 'success',
            msg: 'Room created successfully.',
            data: {
                room_id: room,
            }
        });
    });


    /**
     * Join an existing chat room
     * @type event
     */
    // data = {room_id, username}
    socket.on('join_room', (data) => {

        // Check room if exists
        let room = io.sockets.adapter.rooms[data.room_id];

        if (room == null && room == undefined) {
            return socket.emit('response', {
                type: 'join_room',
                status: 'failed',
                msg: 'Room not found.',
            });
        }


        // Join room
        socket.join(data.room_id);

        // Get room participant cound
        let room_participants = room.length

        // Respond to client
        socket.emit('response', {
            type: 'join_room',
            status: 'success',
            msg: 'Joined room successfully.',
            data: {
                room_id: data.room_id,
                room_participants: room_participants,
            }
        });

        // Notify room clients
        socket.in(data.room_id).emit('room_event', {
            type: 'joined',
            data: {
                msg: data.username + ' has joined chat!',
                username: data.username,
                room_participants: room_participants,
            }
        });

    });


    /**
     * Join an existing chat room
     * @type event
     */
    // data = {room_id, username}
    socket.on('leave_room', (data) => {

        // Check room if exists
        let room = io.sockets.adapter.rooms[data.room_id];

        if (room == null && room == undefined) {
            return socket.emit('response', {
                type: 'leave_room',
                status: 'failed',
                msg: 'Room not found.',
            });
        }


        // Join room
        socket.leave(data.room_id);

        // Get room participant cound
        let room_participants = room.length

        // Respond to client
        socket.emit('response', {
            type: 'leave_room',
            status: 'success',
            msg: 'Left room successfully.',
            data: {
                //
            }
        });

        // Notify room clients
        socket.in(data.room_id).emit('room_event', {
            type: 'left',
            data: {
                msg: data.username + ' has left chat!',
                username: data.username,
                room_participants: room_participants,
            }
        });


    });


    /**
     * Send chat message
     * @type event
     */
    // data = {room_id, username, msg}
    socket.on('chat_message', (data) => {

        // Check room if exists
        let room = io.sockets.adapter.rooms[data.room_id];
        if (room == null && room == undefined) {
            return socket.emit('response', {
                type: 'chat_message',
                status: 'failed',
                msg: 'Room not found.',
            });
        }

        // Send chat message to clients in room
        io.in(data.room_id).emit('chat_message', {
            username: data.username,
            msg: data.msg
        });
    })


    /**
     * Socket has disconnected
     * @type event
     */
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });

});


/**
 * Listen on port
 */
http.listen('3000', () => {
    console.log('App is running at 3000');
});
