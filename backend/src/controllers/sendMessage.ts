import amqp from 'amqplib';

const QUEUE_NAME = 'notifications';

async function sendTestMessage(payload: String) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });
    const message = `{"message": "${payload}"}`;
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));
    console.log('Sent:', message);

    setTimeout(() => connection.close(), 500);
}

export { sendTestMessage }