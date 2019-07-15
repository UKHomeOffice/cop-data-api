const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.status(200).json({ 'message': 'COP API'})
});

module.exports = app;
