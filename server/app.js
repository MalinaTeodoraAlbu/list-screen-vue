const express = require("express");
const cors = require("cors");
const faker = require('faker');
const app = express();


app.use(express.json());
app.use(cors());

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

const makeUserAdmin = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`User with UID ${uid} and email ${user.email} has been granted admin privileges.`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
};


const checkAuthorization = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  console.log('Received ID token:', idToken);
  if (!idToken) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken) {
      req.uid = decodedToken.uid;
      const userClaims = await admin.auth().getUser(decodedToken.uid);
      if (userClaims.customClaims && userClaims.customClaims.admin) {
        req.isAdmin = true;
      } else {
        req.isAdmin = false;
      }
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (e) {
    console.error('Error while verifying Firebase ID token:', e);
    res.status(401).send("Unauthorized");
  }
};

app.post('/verify-admin', checkAuthorization, (req, res) => {
  if (req.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
});

app.get('/movies', async (req, res) => {
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

    res.json({ movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


function generateFakeMovie() {
  const genres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Thriller', 
  'Romance', 'Horror', 'Mystery', 'Adventure', 'Fantasy'];
  const randomGenre = faker.random.arrayElement(genres);

  return {
    Cast: [faker.name.findName(), faker.name.findName(), faker.name.findName()], 
    Description: faker.lorem.paragraph(),
    Rating: faker.random.number({ min: 1, max: 10, precision: 0.1 }).toFixed(1), 
    Title: faker.random.words(),
    Duration: `${faker.random.number({ min: 60, max: 180 })}m`, 
    Genre: [randomGenre], 
    ReleaseDate: {
      _nanoseconds: 0,
      _seconds: faker.date.recent().getTime() / 1000,
    },
  };
}

app.get('/movies/:movieId', async (req, res) => {
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

    res.json({ movie: movieWithId });
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/add-fake-movies', async (req, res) => {
  try {
    const moviesCollection = firestore.collection('Movies');
    const numberOfFakeMovies = 20;

    for (let i = 0; i < numberOfFakeMovies; i++) {
      const fakeMovie = generateFakeMovie();
      await moviesCollection.add(fakeMovie);
    }

    res.json({ message: `${numberOfFakeMovies} fake movies added to the database` });
  } catch (error) {
    console.error('Error adding fake movies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/movies/add-movies', async (req, res) => {
  try {
    const moviesCollection = firestore.collection('Movies');
    const movieData = req.body;
    const addedMovie = await moviesCollection.add(movieData);

    res.json({
      message: `The movie with ID ${addedMovie.id} is added to the database`,
      movieId: addedMovie.id,
    });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/users/:userId', async (req, res) => {
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

    res.json({ user: userWithId });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/users/:userId/add-movie', checkAuthorization, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { movie, status } = req.body;

    if (!['completed', 'watchNow', 'watchLater'].includes(status)) {
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

    res.json({ message: 'Movie added to the user list' });
  } catch (error) {
    console.error('Error adding movie to user list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/users/:userId/remove-movie', checkAuthorization, async (req, res) => {
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


app.put('/movies/:movieId', async (req, res) => {
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

    res.json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/movies/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const moviesCollection = firestore.collection('Movies');
    const movieRef = moviesCollection.doc(movieId);

    const existingMovie = await movieRef.get();
    if (!existingMovie.exists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movieRef.delete();

    res.json({ message: 'Movie deleted successfully', movieId });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const targetUid = 'qZIJ3ZdhOsWMl2YDuJtaHRv5fmc2';
makeUserAdmin(targetUid);

app.listen(4000, () => console.log("Up & Running on port 4000"));