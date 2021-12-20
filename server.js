const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const loginRouter = require('./routes/loginRoute');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');
const authorRouter = require('./routes/authorRoutes');

const app = express();

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection! Shutting down!');
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('DB connection successful!');
});

app.use(bodyParser.json());
app.use('/login', loginRouter);
app.use('/users', userRouter);
app.use('/books', bookRouter);
app.use('/authors', authorRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
});

app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}!`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection! Shutting down!');
    server.close(() => {
        process.exit(1);
    });
});