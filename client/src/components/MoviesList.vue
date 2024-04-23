<template>
  <div>
    <div class="movies_list_container">
      <div v-if="movies" class="movies-container grid-container">
        <div v-for="movie in movies" :key="movie.id" class="movie-item grid-item" @click="showMovieDetails(movie)">
          <Movie :movie="movie" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Movie from './Movie.vue';
import ViewDetails from '@/views/ViewDetails.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

export default {
  props: ['movies'],
  components: { Movie, ViewDetails },
  setup() {
    const router = useRouter();
    
    const selectedMovie = ref(null);
    const viewMovieDetails = ref(false);

    const showMovieDetails = (movie) => {
      if (movie && movie.id) {
        router.push({ name: 'ViewMovie', params: { id: movie.id } });
      } else {
        console.error('Movie must have an "id"');
      }
    };
    return { selectedMovie, viewMovieDetails, showMovieDetails};
  },
};
</script>
  <style>
  
  </style>
  