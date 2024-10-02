// controllers/AuthController.js

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis.js';
import dbClient, { ObjectId } from '../utils/db.js';

class AuthController {
  /**
   * Handles the GET /connect endpoint.
   * Signs in the user by generating a new authentication token.
   */
  static async getConnect(req, res) {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if the authorization scheme is Basic
      const [scheme, encoded] = authorization.split(' ');

      if (scheme !== 'Basic' || !encoded) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Decode the Base64 encoded credentials
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex === -1) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const email = decoded.substring(0, separatorIndex);
      const password = decoded.substring(separatorIndex + 1);

      // Validate presence of email and password
      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Find the user with the given email and hashed password
      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({
        email,
        password: hashedPassword,
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a UUIDv4 token
      const token = uuidv4();

      // Create a Redis key and store the user ID with a 24-hour expiration
      const redisKey = `auth_${token}`;
      await redisClient.set(redisKey, user._id.toString(), 86400); // 24 hours in seconds

      // Return the token
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles the GET /disconnect endpoint.
   * Signs out the user by deleting the authentication token.
   */
  static async getDisconnect(req, res) {
    try {
      const { 'x-token': token } = req.headers;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;

      // Check if the token exists in Redis
      const userId = await redisClient.get(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.del(redisKey);

      // Return 204 No Content
      return res.status(204).send();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles the GET /users/me endpoint.
   * Retrieves the authenticated user's information based on the token.
   */
  static async getMe(req, res) {
    try {
      const { 'x-token': token } = req.headers;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;

      // Retrieve the user ID from Redis
      const userId = await redisClient.get(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the user in the database
      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({ _id: dbClient.ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user information (email and id)
      return res.status(200).json({
        id: user._id.toString(),
        email: user.email,
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles the GET /users/me endpoint.
   * Retrieves the authenticated user's information based on the token.
   */
  static async getMe(req, res) {
    try {
      const { 'x-token': token } = req.headers;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;

      // Retrieve the user ID from Redis
      const userId = await redisClient.get(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the user in the database
      const usersCollection = dbClient.db.collection('users');
      const user = await usersCollection.findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user information (email and id)
      return res.status(200).json({
        id: user._id.toString(),
        email: user.email,
      });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
