import express from 'express';
import { Router } from 'express';
import pool from './db';
const router = Router();

// 定义 GET 接口获取数据
router.get('/api/stocks', async (req: any, res: any) => {
  try {
    const { timeUnit, interval, startTime, endTime } = req.query;
    console.log('{ timeUnit, interval, startTime, endTime } :>> ', {
      timeUnit,
      interval,
      startTime,
      endTime,
    });
    let tableName = '';
    if (timeUnit === 'second') {
      tableName = 'second_prices';
    } else if (timeUnit === 'minute') {
      tableName = 'minute_prices';
    } else {
      return res.status(400).json({ error: 'Invalid time unit' });
    }

    const intervalSeconds = interval * (timeUnit === 'second' ? 1000 : 60000);
    const query = `
      SELECT
        ? - FLOOR((? - timestamp) / ?) * ?  AS interval_time,
        SUBSTRING_INDEX(GROUP_CONCAT(open_price ORDER BY timestamp), ',', 1) AS open_price,
        SUBSTRING_INDEX(GROUP_CONCAT(close_price ORDER BY timestamp DESC), ',', 1) AS close_price
      FROM ${tableName}
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY interval_time
      ORDER BY interval_time ASC
    `;
    const [rows] = await pool.query(query, [
      endTime,
      endTime,
      intervalSeconds,
      intervalSeconds,
      startTime,
      endTime,
    ]);
    console.log('rows :>> ', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
export default router;