import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import notificationPrefRoutes from './notification';
import stockPriceRoutes from './stockPrice';

const app = express();
const port = 3100;

app.use(bodyParser.json());
app.use(cors());

app.use(notificationPrefRoutes);
app.use(stockPriceRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});