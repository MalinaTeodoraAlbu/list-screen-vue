const express = require("express");
const usersRouter = express.Router();

const initializeUsersRouter = (firestore, checkAuthorization, admin) => {

//add for the user an movie
usersRouter.post('/users/:userId/add-movie', checkAuthorization, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { movie, status } = req.body;
  
      if (!['watched', 'watchLater'].includes(status)) {
        console.log(`Invalid status: ${status}`);
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        console.log(`User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
      const updatedMovie = { ...movie, status };
      const userUpdate = {
        movies: admin.firestore.FieldValue.arrayUnion(updatedMovie)
      };
      await userRef.update(userUpdate);
  
      res.status(200).json({ message: 'Movie added to the user list', movieId: movie.id });
    } catch (error) {
      console.error('Error adding movie to user list:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//remove movie from user 
usersRouter.put('/users/:userId/remove-movie', checkAuthorization, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { movieId } = req.body;
  
      console.log(`Received request to remove movie from the user list for user ${userId}:`, movieId);
  
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
  
      if (!userDoc.exists) {
        console.log(`User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userUpdate = {
        movies: userDoc.data().movies.filter(movie => movie.id !== movieId)
      };
  
      console.log(`Movie removed from the user list for user ${userId}:`, movieId);
  
      await userRef.update(userUpdate);
  
      res.json({ message: 'Movie removed from the user list' });
    } catch (error) {
      console.error('Error removing movie from user list:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  //get user by id 
  usersRouter.get('/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const userDoc = await firestore.collection('users').doc(userId).get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userData = userDoc.data();
      const userWithId = {
        id: userId,
        email: userData.email,
        movies: userData.movies || []
      };
  
      res.status(200).json({ user: userWithId, message: 'User retrieved successfully' });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  return usersRouter;
};

module.exports = initializeUsersRouter;