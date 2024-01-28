<template>
  <div>
    <div class="movies_list_container" v-if="viewMovieDetails">
      <ViewDetails :movie="selectedMovie" @close="closeMovieDetails" />
    </div>
    <div v-else class="movies_list_container">
      <div v-if="movies" class="movies-container grid-container">
        <div v-for="movie in movies" :key="movie.id" class="movie-item grid-item" @click="showMovieDetails(movie)">
          <Movie :movie="movie" />
        </div>
      </div>
      <div v-else class="movies-container grid-container">
        Loading...
      </div>
    </div>
  </div>
</template>

<script>
import Movie from './Movie.vue';
import ViewDetails from '@/views/ViewDetails.vue';
import { ref } from 'vue';

export default {
  props: ['movies'],
  components: { Movie, ViewDetails },
  setup() {
    const selectedMovie = ref(null);
    const viewMovieDetails = ref(false);

    const showMovieDetails = (movie) => {
      selectedMovie.value = movie;
      viewMovieDetails.value = true;
    };

    const closeMovieDetails = () => {
      selectedMovie.value = null;
      viewMovieDetails.value = false;
    };

    return { selectedMovie, viewMovieDetails, showMovieDetails, closeMovieDetails };
  },
};
</script>
  <style>
  
  </style>
  