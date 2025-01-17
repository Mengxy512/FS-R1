import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });


const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

export const sendMessage = async (topic: string, message: string) => {
  await producer.connect();

  await producer.send({
    topic,
    messages: [{ value: message }],
  });

  await producer.disconnect();
};

export const consumer = kafka.consumer({ groupId: 'notification-group' });