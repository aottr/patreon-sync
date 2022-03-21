import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { connect, ConnectOptions } from 'mongoose';
import { update } from './models/fedUser';
import { VERSION } from './version';

const PORT = process.env.PORT || 5050;
const app = express();

import campaignRouter from './routes/campaign';

app.use(helmet());
app.use(express.json());

connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions
);

app.get('/status', async (req, res) => {

    return res.status(200).send({
        version: VERSION,
        date: Date.now()
    });
});

//app.use('/campaign', campaignRouter);

// run every 8 minutes
setInterval(update, 8 * 60 * 1000);


app.listen(PORT, async () => {
    console.log(`⚡️ [server]: Server is running at https://localhost:${PORT}`);
});
