import { RowDataPacket } from 'mysql2';
import pool from './db';
import { sendMessage } from './kafka';

interface Preference {
  open_price: string;
  close_price: string;
}

interface Task {
  id: number;
  user_id: number;
  preference: Preference;
  next_time: number;
  time_interval: number;
  time_unit: string;
}

const fetchTasks = async (currentTimestamp: number): Promise<Task[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT id, user_id, preference, next_time, time_interval, time_unit
    FROM notification_pref
    WHERE next_time <= ?
  `,
    [currentTimestamp],
  );
  return rows.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    preference: JSON.parse(row.preference),
    next_time: row.next_time,
    time_interval: row.time_interval,
    time_unit: row.time_unit,
  }));
};

const checkPrices = async (task: Task, currentTimestamp: number) => {
  try {
    const { id, user_id, preference, next_time, time_interval, time_unit } =
      task;

    const query = `
      SELECT
        ? - FLOOR((? - timestamp) / ?) * ?  AS interval_time,
        SUBSTRING_INDEX(GROUP_CONCAT(open_price ORDER BY timestamp), ',', 1) AS open_price,
        SUBSTRING_INDEX(GROUP_CONCAT(close_price ORDER BY timestamp DESC), ',', 1) AS close_price
      FROM ${time_unit}_prices
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY interval_time
      ORDER BY interval_time DESC
      limit 2
    `;

    const intervalSeconds =
      time_interval * (time_unit === 'second' ? 1000 : 60000);
    const fixedNextTime =
      currentTimestamp - next_time < intervalSeconds
        ? next_time
        : currentTimestamp - ((currentTimestamp - next_time) % intervalSeconds);
    // 获取最新的两个时间间隔的数据
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      fixedNextTime,
      fixedNextTime,
      intervalSeconds,
      intervalSeconds,
      fixedNextTime - 2 * intervalSeconds,
      fixedNextTime,
    ]);
    // 更新 next_time
    const newNextTime = fixedNextTime + intervalSeconds;
    await pool.query(
      'UPDATE notification_pref SET next_time = ? WHERE id = ?',
      [newNextTime, id],
    );

    if (rows.length < 2) {
      console.log(`Task ${id}: Not enough data to perform check.`);
      return;
    }

    const currentInterval = rows[0];
    const previousInterval = rows[1];

    // 检查是否满足条件
    const openPriceCondition =
      preference.open_price === '<'
        ? currentInterval.open_price < previousInterval.open_price
        : currentInterval.open_price > previousInterval.open_price;
    const closePriceCondition =
      preference.close_price === '<'
        ? currentInterval.close_price < previousInterval.close_price
        : currentInterval.close_price > previousInterval.close_price;

    if (openPriceCondition && closePriceCondition) {
      const message = `${user_id}`;
      await sendMessage('price-check', message);
    }
  } catch (error) {
    console.error(`Task ${task.id}: Error checking prices:`, error);
  }
};

const scheduleCheckers = async () => {
  const currentTimestamp = Math.floor(Date.now());
  const tasks = await fetchTasks(currentTimestamp);
  tasks.forEach((task) => {
    checkPrices(task, currentTimestamp);
  });
};

// 每秒钟检查一次
setInterval(scheduleCheckers, 1000);
