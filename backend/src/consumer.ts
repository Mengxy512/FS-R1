import { consumer } from './kafka';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = 3101;
const alerts: Set<number> = new Set();  // 存储需要提醒的用户ID

const consumeMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'price-check', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if(!message || !message.value) return;
      const userId = parseInt(message.value.toString(), 10);
      alerts.add(userId);
      console.log(`Alert for user ${userId}`);
    }
  });
};

// 启动 Kafka 消费者
consumeMessages().catch(console.error);

// 创建一个端点，前端可以查询是否需要提醒
app.get('/api/alerts', (req, res) => {
  const { user_id } = req.query;
  if (alerts.has(Number(user_id))) {
    res.json({ alert: true });
    alerts.delete(Number(user_id));  // 提醒后删除该用户的提醒
  } else {
    res.json({ alert: false });
  }
});

app.listen(PORT, () => {
  console.log(`Notification service listening on port ${PORT}`);
});