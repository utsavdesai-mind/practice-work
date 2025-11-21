const express = require('express');
const appRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler')
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', appRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.send("Server + MongoDB Connected Successfully 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
