process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/swipe', require('./routes/swipe'));
app.use('/api/messages', require('./routes/messages'));

// Serve the React application in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
};

// Sync database and then start the server
db.sequelize.sync()
  .then(() => {
    console.log('Database synced successfully.');
    startServer();
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
