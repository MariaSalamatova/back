const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(require('./routes/auth'));
app.use(require('./routes/gacha'));
app.use(require('./routes/forum'));

mongoose.
connect("mongodb://localhost:27017/my_database")
    .then(() => {
        console.log('MongoDB connected');
        app.listen(5000, () => console.log('Server running on port 5000'));
    })
    .catch(err => console.error(err));