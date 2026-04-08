/**
 * local server entry file, for local development
 */
import app from './app.js';
import sendOtp from './send-otp';

app.post('/api/send-otp', sendOtp);

/**
 * start server with port
 */
import portfinder from 'portfinder';

portfinder.getPort((err, port) => {
  if (err) {
    console.error(err);
    return;
  }
  
  const server = app.listen(port, () => {
    console.log(`Server ready on port ${port}`);
  });

  /**
   * close server
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

export default app;