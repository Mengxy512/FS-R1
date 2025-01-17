import pool from './db';
import { RowDataPacket } from 'mysql2';

// 获取当前秒的开盘价和收盘价
async function recordSecondPrices() {
  const timestamp = Math.floor(Date.now() / 1000) - 1; // 当前秒的时间戳
  console.log('second timestamp :>> ', timestamp);
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT price FROM prices WHERE FLOOR(timestamp / 1000) = ?',
      [timestamp],
    );
    console.log('rows :>> ', rows);
    if (Array.isArray(rows) && rows.length > 0) {
      const openPrice = rows[0].price;
      const closePrice = rows[rows.length - 1].price;

      await pool.query(
        'INSERT INTO second_prices (timestamp, open_price, close_price) VALUES (?, ?, ?)',
        [timestamp * 1000, openPrice, closePrice],
      );
      // console.log(
      //   `Recorded second prices: timestamp=${timestamp}, open=${openPrice}, close=${closePrice}`,
      // );
    }
  } catch (error) {
    console.error('Error recording second prices:', error);
  }
}

// 获取当前秒的开盘价和收盘价
async function recordMinutePrices() {
  const timestamp = Math.floor(Date.now() / 60000) - 1; // 当前分钟的时间戳
  console.log('minute timestamp :>> ', timestamp);
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT price FROM prices WHERE FLOOR(timestamp / 60000) = ?',
      [timestamp],
    );
    console.log('rows :>> ', rows);
    if (Array.isArray(rows) && rows.length > 0) {
      const openPrice = rows[0].price;
      const closePrice = rows[rows.length - 1].price;

      await pool.query(
        'INSERT INTO minute_prices (timestamp, open_price, close_price) VALUES (?, ?, ?)',
        [timestamp * 60000, openPrice, closePrice],
      );
      // console.log(
      //   `Recorded minute prices: timestamp=${timestamp}, open=${openPrice}, close=${closePrice}`,
      // );
    }
  } catch (error) {
    console.error('Error recording second prices:', error);
  }
}

// 每秒钟记录一次
setInterval(recordSecondPrices, 1000);
// 每分钟记录一次
setInterval(recordMinutePrices, 60000);
