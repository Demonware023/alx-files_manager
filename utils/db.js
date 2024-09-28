// utils/db.js

import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // Load environment variables or set defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct the MongoDB URI
    const uri = `mongodb://${host}:${port}`;

    // Initialize the MongoDB client
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Connection promise
    this.connection = this.client.connect()
      .then(() => {
        console.log('Connected successfully to MongoDB');
        this.db = this.client.db(database);
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
      });
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} True if connected, false otherwise.
   */
  isAlive() {
    return this.client && this.client.isConnected();
  }

  /**
   * Returns the number of documents in the 'users' collection.
   * @returns {Promise<number>} Number of users.
   */
  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  /**
   * Returns the number of documents in the 'files' collection.
   * @returns {Promise<number>} Number of files.
   */
  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('Not connected to MongoDB');
    }
    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      throw error;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();

export default dbClient;
