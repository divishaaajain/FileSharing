import express, {ErrorRequestHandler} from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import authRoutes from './routes/auth';
import userRoutes from './routes/user';

// dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use(authRoutes);
app.use(userRoutes);

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    const status: number = error.statusCode;
    const message: string = error.message;
    const data: any = error.data;
    res.status(status).json({ message, data });
};

app.use(errorHandler);

app.listen(3000);