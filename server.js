const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.get('/', express.static(path.join(__dirname, '/index.html')));
app.use(express.static(__dirname));

app.listen(PORT);
