import readline from 'readline';
import dotenvFlow from 'dotenv-flow';
import amqp, { Message } from 'amqplib/callback_api';
import { TEACHERS } from '@/common/constants';

dotenvFlow.config();

/**
 * Set user's name and preferred chat
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let id: string | null = process.env.ID || null;
let chat: string | null = process.env.CHAT || null;

if (!id) {
  rl.question('What is your ID? ', (i: string) => { id = i; });
}

if (!chat) {
  rl.question('What chat do you want to access? ', (ii: string) => { chat = ii; });
}

const name: string | undefined = TEACHERS.find(el => el.id === id)?.name;

if (name && chat) console.info(`Welcome back ${name}! Connecting to ${chat} channel.`);
else throw new Error('Unable to access');

rl.close();

/**
 * Subscribe to chanel selected by teacher
 */
amqp.connect('amqp://guest:guest@rabbitmq:5672', (error0, connection) => {
  console.log('>>> Connecting to RabbitMQ...');

  if (error0) {
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = 'hello-world';

    channel.assertQueue(queue, { durable: false });

    channel.consume(queue, (msg: Message | null) => {
      const { message } = msg && JSON.parse(msg.content.toString());
      console.log(message);
    });
  });
});
