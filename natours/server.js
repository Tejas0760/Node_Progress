const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGTH EXCEPTION!!');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const URL = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(URL, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'));

// This additionally will provide filteration (but it can also cause problems so be aware of it)
// mongoose.set('strictQuery', true);

const app = require('./app');

// testTour
//     .save()
//     .then((doc) => console.log(doc))
//     .catch((err) => console.error(err));

// console.log(process.env);

const port = process.env.PORT;

const server = app.listen(port, () => {
    console.log(`Listening on port number ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('UNHANDELED EXCEPTION!!!');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
