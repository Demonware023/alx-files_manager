// server.js

import express from 'express';
import routes from './routes/index.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use the routes defined in routes/index.js
app.use('/', routes);

// Determine the port to listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
