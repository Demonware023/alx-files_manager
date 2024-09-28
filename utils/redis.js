// utils/redis.js

import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = redis.createClient();

    // Handle Redis client errors
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Promisify Redis methods for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} True if connected, false otherwise.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves the value associated with the given key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string|null>} The value stored in Redis, or null if not found.
   */
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to store.
   * @param {number} duration - Expiration time in seconds.
   * @returns {Promise<string>} The status reply from Redis.
   */
  async set(key, value, duration) {
    try {
      const reply = await this.setAsync(key, value, 'EX', duration);
      return reply;
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} The number of keys that were removed.
   */
  async del(key) {
    try {
      const result = await this.delAsync(key);
      return result;
    } catch (error) {
      console.error(`Error deleting key "${key}":`, error);
      throw error;
    }
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();

export default redisClient;
