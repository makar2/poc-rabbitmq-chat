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

/**
 * Connect to RabbitMQ
 */
amqp.connect('amqp://guest:guest@rabbitmq:5672', (error0, connection) => {
  console.info('>>> Connecting to RabbitMQ...');

  if (error0) {
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    if (error1) throw error1;

    let id: string | undefined = process.env.ID;
    let name: string | undefined;
    let chat: string | undefined = process.env.CHAT;

    if (!id) {
      rl.question('What is your ID? ', (i: string) => {
        id = i;
        if (!chat) {
          rl.question('What chat do you want to access -- general or house? ', (ii: string) => {
            const obj = TEACHERS.find(el => el.id === id);
            if (obj) {
              name = obj.name;
              if (ii === 'house') chat = obj.house;
              else if (ii === 'general') chat = 'general';
              if (chat) console.info(`Welcome back ${name}! Connecting to ${chat} channel...`);

              else throw new Error('Unable to log in: Chat not found');
            }
            else throw new Error('Unable to log in: User ID not found');

            /**
             * Subscribe to chanel selected by teacher
             */
            channel.assertExchange(chat, 'fanout', { durable: false });

            channel.assertQueue('', {
              exclusive: true,
            }, (error2, q) => {
              if (error2) {
                throw error2;
              }
              channel.bindQueue(q.queue, chat || 'general', '');

              channel.consume(q.queue, (msg: Message | null) => {
                const { author, exchange, message } = msg && JSON.parse(msg.content.toString());
                console.info(`\n<<< [${exchange}] ${author === name ? 'You' : author}: ${message}`);
              }, {
                noAck: true,
              });
            });

            /**
             * Send a message
             */
            const looper = () => {
              rl.question('>>>', (messageOut: string) => {
                if (messageOut) {
                  const output = {
                    author: name,
                    exchange: chat,
                    message: messageOut,
                  };
                  channel.publish(chat || 'general', '', Buffer.from(JSON.stringify(output)));
                  looper();
                }
              });
            };

            looper();
          });
        }
      });
    }
  });
});
