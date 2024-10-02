// controllers/UsersController.js

import sha1 from 'sha1';
import dbClient, { ObjectId } from '../utils/db.js';
import redisClient from '../utils/redis.js';

class UsersController {
  /**
   * Handles the POST /users endpoint.
   * Creates a new user with provided email and password.
   */
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      // Validate presence of email and password
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if email already exists
      const usersCollection = dbClient.db.collection('users');
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Create the new user object
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the database
      const result = await usersCollection.insertOne(newUser);

      // Prepare the response object
      const responseUser = {
        id: result.insertedId.toString(),
        email: newUser.email,
      };

      // Return the response with status 201
      return res.status(201).json(responseUser);
    } catch (error) {
      console.error('Error in postNew:', error);
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

export default UsersController;
