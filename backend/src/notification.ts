import { Router } from 'express';
import pool from './db';
import { RowDataPacket } from 'mysql2';

const router = Router();

router.get('/api/notificationPref', async (req: any, res: any) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM notification_pref WHERE user_id = ?', [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No notification preferences found for the user' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/api/notificationPref', async (req: any, res: any) => {
  const { preference, next_time, time_interval, time_unit } = req.body;
  const user_id = 1;
  if (!user_id || !preference || !next_time || !time_interval || !time_unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const timestamp = new Date(next_time).getTime();
    const [result] = await pool.query(`
      INSERT INTO notification_pref (user_id, preference, next_time, time_interval, time_unit)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        preference = VALUES(preference),
        next_time = VALUES(next_time),
        time_interval = VALUES(time_interval),
        time_unit = VALUES(time_unit)
    `, [user_id, JSON.stringify(preference), timestamp, time_interval, time_unit]);

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error inserting/updating notification preference:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;