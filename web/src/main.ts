import express from 'express';
import { Server, WebSocket } from 'ws';
import crypto from 'crypto';
import { initPinecone, queryPineconeVectorStoreAndQueryLLM } from './utils';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const port = 3000;

const server = express()
    .use('/', (req, res) => res.sendFile('/index.html', { root: __dirname }))
    .post('/query', async (req, res) => {
        const { message } = req.body;
        const response = await queryPineconeVectorStoreAndQueryLLM(message);
        if (response) {
            return res.json({ response });
        }

        return res.json({ response: null });
    })
    .listen(port, () => `Listening on port ${port}`)
    .on('listening', async () => {
        await initPinecone();
    });

const wsServer = new Server({ server });
type Event = {
    type: string;
    message?: string;
    payload?: any;
};

type Message = {
    type: string;
    payload?: any;
};

class Client {
    constructor(public ws: WebSocket, public id = crypto.randomUUID().toString()) {}
}

class Room {
    private clients: Client[] = [];
    constructor(public id = crypto.randomUUID().toString()) {}

    register(client: Client) {
        this.clients.push(client);

        client.ws.on('close', () => {
            console.log('Client disconnected');
        });
    }

    leave(client: Client) {
        if (this.clients.includes(client)) {
            this.clients.splice(this.clients.indexOf(client));
            send(client, { type: 'message', message: 'Left room' });
            if (this.clients.length === 1) {
                rooms.delete(this.id);
            }
            return;
        } else {
            send(client, { type: 'message', message: 'Not in room' });
        }
    }

    join(client: Client) {
        if (this.clients.includes(client)) {
            send(client, { type: 'message', message: 'Already in room' });
            return;
        }

        this.clients.push(client);
        send(client, { type: 'joined', payload: { roomId: this.id, rooms: Array.from(rooms.keys()) } });
    }

    async message(client: Client, message: string) {
        send(client, { type: 'message', message });
        const res = await fetch('http://localhost:3000/query', {
            method: 'post',
            body: JSON.stringify({ message }),
        });
        const data = await res.json();
        console.log({ data });
        if (data.response) {
            send(client, { type: 'response', message: data.response });
        }
        return;
    }
}

const rooms = new Map<string, Room>();

const send = (client: Client, event: Event) => client.ws.send(JSON.stringify(event));

wsServer.on('connection', async (ws) => {
    console.log('Client connected');

    const client = new Client(ws);

    send(client, { type: 'rooms', payload: { rooms: Array.from(rooms.keys()) } });

    ws.on('message', async (data) => {
        console.log(JSON.parse(data.toString()));

        const { type, payload } = JSON.parse(data.toString()) as Message;

        switch (type) {
            case 'join': {
                let room = rooms.get(payload.roomId ?? '');
                if (!room) {
                    send(client, { type: 'message', message: "Can't find room" });
                } else {
                    room.join(client);
                }
                break;
            }
            case 'leave': {
                let room = rooms.get(payload.roomId ?? '');
                if (!room) {
                    send(client, { type: 'message', message: "Can't find room" });
                } else {
                    room.leave(client);
                }
                break;
            }
            case 'message': {
                let room = rooms.get(payload.roomId ?? '');
                if (!room) {
                    send(client, { type: 'message', message: "Can't find room" });
                } else {
                    await room.message(client, payload.message);
                }
                break;
            }
            case 'create-room': {
                const room = new Room();
                rooms.set(room.id, room);
                send(client, { type: 'created', payload: { roomId: room.id } });
                send(client, { type: 'rooms', payload: { rooms: Array.from(rooms.keys()) } });
                break;
            }
            case 'rooms': {
                send(client, { type: 'rooms', payload: { rooms: Array.from(rooms.keys()) } });
                break;
            }
        }
    });

    // ws.on('close', () => {
    //     console.log('Client disconnected');
    // });
});

wsServer.on('close', () => {
    console.log('Connection closed');
});

wsServer.on('error', (error) => {
    console.log(error);
});
