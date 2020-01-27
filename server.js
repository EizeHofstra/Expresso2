const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require('cors');
app.use(cors());

const errorhandler = require('errorhandler');
app.use(errorhandler());

const PORT = process.env.PORT || 4000;

const apiRouter = require('./api/api');

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});

module.exports = app;