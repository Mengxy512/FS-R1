import axios from 'axios';
import pool from './db';

// SSE 端点
const sseUrl = 'http://localhost:3000/stocks/prices';

// 缓存最近插入的数据
const cache = new Map<number, { timestamp: number; price: number }>();

// 处理 SSE 数据
async function handleSSE() {
  const response = await axios.get(sseUrl, {
    responseType: 'stream',
  });

  // 监听数据流
  response.data.on('data', async (chunk: any) => {
    const dataString = chunk.toString();
    if (dataString.startsWith('id: ')) {
      const idMatch = dataString.match(/id: (\d+)/);
      const dataMatch = dataString.match(/data: \[(\d+),([\d.]+)\]/);

      if (idMatch && dataMatch) {
        const id = parseInt(idMatch[1], 10);
        const timestamp = parseInt(dataMatch[1], 10);
        const price = parseFloat(dataMatch[2]);

        // 检查缓存是否已有相同数据
        // const cachedData = cache.get(id);
        // if (cachedData && cachedData.timestamp === timestamp && cachedData.price === price) {
        //   console.log('Data already in cache, skipping insertion:', { id, timestamp, price });
        //   return;
        // }

        // 将数据插入 MySQL 数据库，避免重复
        const query = `
          INSERT INTO prices (timestamp, price) VALUES (?, ?)`;
        try {
          const [results] = await pool.query(query, [timestamp, price]);
          //console.log('Data inserted/updated successfully:', results);

          // 更新缓存
          cache.set(id, { timestamp, price });
        } catch (err) {
          console.error('Error inserting/updating data into MySQL:', err);
        }
      }
    }
  });

  // 监听错误事件
  response.data.on('error', (err: any) => {
    console.error('Error with SSE:', err);
  });
}

// 启动处理 SSE 流数据的函数
handleSSE();
