const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const projectRoutes = require('./routes/projectRoutes');
const apiDocRoutes = require('./routes/apiDocRoutes');

app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/apis', apiDocRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Documentation Manager - Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
});
