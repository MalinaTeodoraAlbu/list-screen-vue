<template>
  <div class="movie">
    <img v-if="movie.ImageURL" :src="movie.ImageURL" alt="Movie Poster" class="movie-poster" />
    <img v-else src="https://st4.depositphotos.com/14953852/24787/v/1600/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" alt="Movie Poster" class="movie-poster" />
    <div class="movie-details">
      <h2 class="movie-title">{{ movie.Title }}</h2>
      <div class="separator"></div>
        <div class="movie-rating">
          <p>Rating:</p>
          <div class="star-rating">
            <span v-for="index in 10" :key="index" class="star" :class="{ 'filled': index <= Math.floor(movie.Rating), 
            'half-filled': index > Math.floor(movie.Rating) && index - 0.5 <= movie.Rating }">&#9733;</span>
            <span>{{ movie.Rating }}</span>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import { projectAuth } from '@/firebase/config';

export default {
  props: ['movie'],
}
</script>

  <style scoped>
    
  .movie {
    backdrop-filter: blur(10px);
    color: white;
    border-radius: 8px;
    box-shadow: rgba(59, 59, 59, 0.4) 0px 0px 0px 2px, rgba(59, 59, 59, 0.4) 0px 4px 6px -1px, rgba(59, 59, 59, 0.4) 0px 1px 0px inset;
    overflow: hidden;
    transition: transform 0.2s;
  }

  .movie-buttons{
    justify-content: center;
    margin: auto;
    align-items: center;
  }

  .movie-poster {
    width: 100%;
    min-width: 300px;
    min-height: 400px;
    max-height: 400px;
    height: auto;
    border-radius: 8px 0 0 8px;
  }

  .movie-details {
    flex: 1;
    padding: 10px;

  }

  .movie-title {
    font-size: 1em;
    margin-bottom: 5px;
    color:#ffffff ;

  }


  .separator {
    border-top: 1px solid #ffffff;
    margin: 5px 0;
  }

  .movie-rating {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

    .star {
    font-size: 1em;
    color: #ffffff; 
    }

    .filled {
    color: #fffa67; 
    }

    .half-filled {
    position: relative;
    display: inline-block;
  }

  .half-filled::before {
    content: "\2605"; 
    position: absolute;
    left: 0;
    width: 50%;
    overflow: hidden;
    color: #f39c12;
  }
  </style>
  