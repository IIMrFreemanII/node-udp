import udp from 'dgram';
import { serverPort } from "./constants.js";

const actions = {
    'connect': (data, info) => {
        const result = JSON.parse(data.toString());

        connections.push({
            info,
            username: result.data.username,
        });
        console.log(connections);
    },
    'message': (data, info) => {
        connections.forEach((connection) => {
            server.send(data, connection.info.port, connection.info.address, function (error) {
                if (error) {
                    console.error(error);
                }
            });
        });
    }
}

const connections = [];

// creating a udp server
const server = udp.createSocket('udp4');

// emits when any error occurs
server.on('error', function (error) {
    console.log('Error: ' + error);
    server.close();
});

server.on('message', function (msg, info) {
    console.log(`Data received from server: ${msg.toString()}`);
    console.log(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
    const response = JSON.parse(msg.toString());

    const action = actions[response.action];
    if (action) {
        action(msg, info);
    } else {
        console.log(`Unavailable action: ${response.action}`);
    }
});

//emits when socket is ready and listening for datagram msgs
server.on('listening', function () {
    const address = server.address();
    const port = address.port;
    const family = address.family;
    const ipaddr = address.address;
    console.log('Server is listening at port ' + port);
    console.log('Server ip: ' + ipaddr);
    console.log('Server is IP4/IP6: ' + family);
});

//emits after the socket is closed using socket.close();
server.on('close', function () {
    console.log('Socket is closed !');
});

server.bind(serverPort);

// setTimeout(function(){
//     server.close();
// },8000);