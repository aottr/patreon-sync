import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { connect, ConnectOptions } from 'mongoose';

const PORT = process.env.PORT || 5050;
const app = express();

import fedRouter from './routes/federation';

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

app.use(fedRouter);

app.listen(PORT, async () => {
    console.log(`⚡️ [server]: Server is running at https://localhost:${PORT}`);
});
