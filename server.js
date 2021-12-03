const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const loginRouter = require('./routes/loginRoute');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');
const authorRouter = require('./routes/authorRoutes');

const app = express();

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}!`);
});