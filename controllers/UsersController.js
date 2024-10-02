// controllers/UsersController.js

import sha1 from 'sha1';
import dbClient from '../utils/db.js';

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
}

export default UsersController;
