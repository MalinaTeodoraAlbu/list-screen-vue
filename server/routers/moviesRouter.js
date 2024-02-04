const express = require("express");
const moviesRouter = express.Router();

const initializeMoviesRouter = (firestore, checkAuthorization) => {
//get all movies 
moviesRouter.get('/movies', async (req, res) => {
    try {
      const moviesCollection = firestore.collection('Movies');
      const snapshot = await moviesCollection.get();
  
      if (snapshot.empty) {
        return res.status(404).json({ message: 'No movies found' });
      }
  
      const movies = [];
      snapshot.forEach(doc => {
        const movieData = doc.data();
        const movieWithId = {
          id: doc.id,
          ...movieData,
        };
        movies.push(movieWithId);
      });
  
      res.status(200).json({ movies });
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  //get movie by id 
  moviesRouter.get('/movies/:movieId', async (req, res) => {
    try {
      const movieId = req.params.movieId;
  
      const moviesCollection = firestore.collection('Movies');
      const movieDoc = await moviesCollection.doc(movieId).get();
  
      if (!movieDoc.exists) {
        return res.status(404).json({ message: 'Movie not found' });
      }
  
      const movieData = movieDoc.data();
      const movieWithId = {
        id: movieDoc.id,
        ...movieData,
      };
  
      res.status(200).json({ movie: movieWithId });
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  //add movie
  moviesRouter.post('/movies/add-movies',checkAuthorization, async (req, res) => {
    try {
      const moviesCollection = firestore.collection('Movies');
      const movieData = req.body;
      const addedMovie = await moviesCollection.add(movieData);
  
      res.status(201).json({
        message: `The movie with ID ${addedMovie.id} is added to the database`,
        movieId: addedMovie.id,
      });
    } catch (error) {
      console.error('Error adding movie:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
//update movie
moviesRouter.put('/movies/:movieId', checkAuthorization, async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const updatedMovieData = req.body;

    const moviesCollection = firestore.collection('Movies');
    const movieRef = moviesCollection.doc(movieId);

    const existingMovie = await movieRef.get();
    if (!existingMovie.exists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movieRef.update(updatedMovieData);

    const updatedMovie = {
      id: movieId,
      ...updatedMovieData,
    };

    const usersCollection = firestore.collection('users');
    const usersSnapshot = await usersCollection.get();

    const batch = firestore.batch();

    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      const updatedMovies = userData.movies.map(movie =>
        movie.id === movieId ? { ...movie, ...updatedMovieData } : movie
      );
      batch.update(usersCollection.doc(userDoc.id), { movies: updatedMovies });
    });

    await batch.commit();

    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
  // delete movie
moviesRouter.delete('/movies/:movieId', checkAuthorization, async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const moviesCollection = firestore.collection('Movies');
    const movieRef = moviesCollection.doc(movieId);

    const existingMovie = await movieRef.get();
    if (!existingMovie.exists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movieRef.delete();

    const usersCollection = firestore.collection('users');
    const usersSnapshot = await usersCollection.get();

    const batch = firestore.batch();

    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      const updatedMovies = userData.movies.filter(movie => movie.id !== movieId);
      batch.update(usersCollection.doc(userDoc.id), { movies: updatedMovies });
    });

    await batch.commit();

    res.status(200).json({ message: 'Movie deleted successfully', movieId }); 
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  return moviesRouter;
};

module.exports = initializeMoviesRouter;