import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import amqp from 'amqplib';

const QUEUE_NAME = 'notifications';

export async function setupNotificationServer(server: Server) {
    const wss = new WebSocketServer({ server, path: '/notifications' });
    const clients = new Set<WebSocket>();

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: false });

    channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
            const content = msg.content.toString();
            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(content);
                }
            }
            channel.ack(msg);
        }
    });

    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log('🔌 WebSocket client connected');
        ws.send(JSON.stringify({ message: '✅ Welcome to the Notification Channel!' }));

        ws.on('close', () => {
            clients.delete(ws);
            console.log('❌ WebSocket client disconnected');
        });
    });

    console.log('✅ WebSocket + RabbitMQ notification server ready.');
}