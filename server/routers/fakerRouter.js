const express = require("express");
const fakerRouter = express.Router();
const faker = require('faker');

const initializeFakerRouter = (firestore, checkAuthorization) => {

const imageUrls = [
'https://i.pinimg.com/564x/7a/11/e0/7a11e0c8b320a13e84ce0b1fe7c35cb3.jpg',
'https://i.pinimg.com/564x/9a/3e/2e/9a3e2e99dac008c8db9169f0967895fc.jpg',
'https://i.pinimg.com/564x/2c/4f/98/2c4f98572edcce7f10239140cad944a6.jpg',
'https://i.pinimg.com/564x/7b/78/32/7b78321fd5d19661052bdc0d5e609830.jpg',
'https://i.pinimg.com/564x/45/45/74/454574777abac7bbd6cfe67519a26e99.jpg',
'https://i.pinimg.com/564x/42/00/da/4200dae9ac7b15a5c65375cbfaceaa69.jpg',
'https://i.pinimg.com/564x/67/13/21/671321e89da97b8b9e9da57a83eaddc7.jpg',
'https://i.pinimg.com/564x/8e/fa/8a/8efa8a7ed972b926eb9ce7e5e1b1d6b0.jpg',
'https://i.pinimg.com/564x/0a/8e/e9/0a8ee99cd4a233615795a460c831c769.jpg',
'https://i.pinimg.com/564x/68/60/10/6860108134ad3c9b29b77925683d6874.jpg',
'https://i.pinimg.com/564x/e0/cc/67/e0cc670c8b292b6eb77d406388d50835.jpg',
'https://i.pinimg.com/564x/13/e5/05/13e505906dcecd8df6a53ca35580071b.jpg',
'https://i.pinimg.com/564x/43/b3/2d/43b32d4f44b1e83e3d6d7528f1c392d0.jpg'
];


function generateFakeMovie() {
    const genres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Thriller', 
    'Romance', 'Horror', 'Mystery', 'Adventure', 'Fantasy'];
    const randomGenre = faker.random.arrayElement(genres);
    const releaseDate = faker.date.recent();
    const formattedReleaseDate = `${releaseDate.getFullYear()}-${(releaseDate.getMonth() + 1).toString().padStart(2, '0')}-${releaseDate.getDate().toString().padStart(2, '0')}`;
    const imageUrl = faker.random.arrayElement(imageUrls);
    return {
      Cast: [faker.name.findName(), faker.name.findName(), faker.name.findName()], 
      Description: faker.lorem.paragraph(),
      Rating: faker.random.number({ min: 1, max: 10, precision: 0.1 }).toFixed(1), 
      Title: faker.random.words(),
      Duration: `${faker.random.number({ min: 60, max: 180 })}m`, 
      Genre: [randomGenre], 
      ReleaseDate: formattedReleaseDate,
      ImageURL: imageUrl
    };
  }
  
  fakerRouter.post('/add-fake-movies', checkAuthorization, async (req, res) => {
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
  
  return fakerRouter;
};

module.exports = initializeFakerRouter;