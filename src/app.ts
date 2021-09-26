import readline from 'readline';
import dotenvFlow from 'dotenv-flow';
import { TEACHERS } from '@/common/constants';

dotenvFlow.config();

/**
 * Set user's name and preferred channel
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let id: string | null = process.env.ID || null;
let channel: string | null = process.env.CHANNEL || null;

if (!id) rl.question('What is your ID? ', (i: string) => { id = i; });

if (!channel) rl.question('What channel do you want to access? ', (ii: string) => { channel = ii; });

const name: string | undefined = TEACHERS.find(el => el.id === id)?.name;

if (name && channel) console.info(`Welcome back ${name}! Connecting to ${channel} channel.`);
else throw new Error('Unable to access');

rl.close();
