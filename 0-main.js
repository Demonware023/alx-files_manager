// main.js

import dbClient from './utils/db';

const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      setTimeout(async () => { // Removed 'await' since setTimeout is not a Promise
        i += 1;
        if (i >= 10) {
          reject(new Error('Connection timeout'));
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });
};

(async () => {
  console.log('Is MongoDB alive?', dbClient.isAlive());
  try {
    await waitConnection();
    console.log('Is MongoDB alive after waiting?', dbClient.isAlive());
    console.log('Number of users:', await dbClient.nbUsers());
    console.log('Number of files:', await dbClient.nbFiles());
  } catch (error) {
    console.error('Error during database operations:', error);
  } finally {
    // Close the MongoDB connection gracefully
    if (dbClient.isAlive()) {
      await dbClient.client.close();
      console.log('MongoDB connection closed.');
    }
  }
})();
