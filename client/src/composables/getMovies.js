
import { ref } from 'vue';

const movies = ref([]);

const fetchMovies = async () => {
  try {
    const response = await fetch('http://localhost:4000/movies');
    const data = await response.json();
    movies.value = data.movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
};

export { movies, fetchMovies };
