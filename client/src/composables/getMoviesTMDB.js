import { ref } from "vue";
import useToken from './useToken';

const movies = ref([]);

const fetchMoviesTMdb = async () => {
    try {
        const { token, getToken } = useToken();
        await getToken();
        const responseMovies = await fetch('https://api.themoviedb.org/3/movie/now_playing?api_key=be2cede8efce36dd7fd1931be5dfffdc')
        const moviesData = await responseMovies.json();

        const responseGenre = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=be2cede8efce36dd7fd1931be5dfffdc')
        const genresData = await responseGenre.json();

        const transformedMovies = await Promise.all(moviesData.results.map(async movie => {
            const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=be2cede8efce36dd7fd1931be5dfffdc`);
            const creditsData = await creditsResponse.json();
            const cast = creditsData.cast.map(actor => actor.name);
            
            return {
                id: movie.id,
                Cast: cast,
                Description: movie.overview,
                Rating: movie.vote_average,
                Title: movie.title,
                ImageURL: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                Duration: `${movie.runtime}m`,
                Genre: movie.genre_ids.map(genreId => {
                    const genre = genresData.genres.find(g => g.id === genreId);
                    return genre ? genre.name : '';
                }),
                ReleaseDate: movie.release_date
            };
        }));
        
        await Promise.all(transformedMovies.map(async movie => {
            try {
                const response = await fetch('http://localhost:4000/movies/add-moviesTMdb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(movie)
                });

                if (!response.ok) {
                    throw new Error('Failed to add movie to database');
                }
            } catch (error) {
                console.error('Error adding movie:', error);
            }
        }));
        
        movies.value = transformedMovies;
        
        console.log("Movies",movies.value)
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

export { fetchMoviesTMdb , movies};
