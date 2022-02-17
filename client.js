import udp from 'dgram';
import prompt from 'prompt';
import { clientPort, serverPort } from "./constants.js";

const user = {
    username: 'None', connection: true,
};

const createAction = (type, data) => {
    return JSON.stringify({
        action: type, data
    })
};

const getUserName = () => {
    prompt.get([ 'username' ], (err, result) => {
        if (err) {
            console.log(err);
        }

        user.username = result.username;
        const action = createAction('connect', user);
        client.send(action, serverPort, 'localhost', function (error) {
            if (error) {
                console.error(error);
            }
        });

        sendMessage();
    });
};

const sendMessage = () => {
    prompt.get([ 'message' ], (err, result) => {
        if (err) {
            console.log(err);
        }

        if (result.message === 'end') {
            process.exit(0);
        }

        const action = createAction('message', {
            username: user.username, ...result, time: Date.now(),
        });

        client.send(action, serverPort, 'localhost', function (error) {
            if (error) {
                console.error(error);
            }
        });

        setTimeout(sendMessage, 500);
    });
};

// creating a client socket
const client = udp.createSocket('udp4');

client.on('message', function (msg, info) {
    const response = msg.toString();
    const obj = JSON.parse(response);
    console.log(`Data received from server: ${response}`);
    console.log(`Received ${msg.length} bytes from ${info.address}:${info.port}`);
    console.log(`Delay ${Date.now() - obj.data.time}`)
});

prompt.start();

getUserName();