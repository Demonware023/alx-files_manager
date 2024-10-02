// controllers/AppController.js

import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  /**
   * Handles the GET /status endpoint.
   * Returns the status of Redis and MongoDB connections.
   */
  static async getStatus(req, res) {
    try {
      const redisStatus = redisClient.isAlive();
      const dbStatus = dbClient.isAlive();

      res.status(200).json({
        redis: redisStatus,
        db: dbStatus,
      });
    } catch (error) {
      console.error('Error in getStatus:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles the GET /stats endpoint.
   * Returns the number of users and files in the database.
   */
  static async getStats(req, res) {
    try {
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'Database not connected' });
      }

      const [usersCount, filesCount] = await Promise.all([
        dbClient.nbUsers(),
        dbClient.nbFiles(),
      ]);

      res.status(200).json({
        users: usersCount,
        files: filesCount,
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
