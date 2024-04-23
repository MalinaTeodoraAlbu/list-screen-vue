<template>
  <div>
    <div id="new_movies">
      <h1>Top Movies </h1>
      <div id="slider-container">
        <span @click="slideRight" class="btn"></span>
        <div id="slider">
          <div v-for="(movie, index) in latestMovies" :key="movie.id" class="slide">
            <Movie :movie="movie" @click="showMovieDetails(movie)" ></Movie>
            <div class="circle">{{ currentIndex + index + 1 }}</div>
          </div>
        </div>
        <span @click="slideLeft" class="btn"></span>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Movie from '../components/Movie.vue';
import { useRouter } from 'vue-router';
import { movies, fetchMovies } from '../composables/getMovies';
import { computed, onMounted, ref, watch } from 'vue';

export default {
  components: { Navbar, Movie },
  setup() {
    const router = useRouter();
    const currentIndex = ref(0);
    const contor = 0;
    const sortedMovies = computed(() =>
      movies.value.slice().sort((a, b) => b.Rating - a.Rating)
    );

    const latestMovies = computed(() =>
      sortedMovies.value.slice(currentIndex.value, 10)
    );

    const slideRight = () => {
      currentIndex.value = Math.max(currentIndex.value - 1, 0);
    };

    const slideLeft = () => {
      currentIndex.value = Math.min(currentIndex.value + 1, 9);
    };

    onMounted(async () => {
      await fetchMovies();
    });

    const showMovieDetails = (movie) => {
      if (movie && movie.id) {
        router.push({ name: 'ViewMovie', params: { id: movie.id } });
      } else {
        console.error('Movie must have an "id"');
      }
    
    };

    return {
      latestMovies,
      slideRight,
      slideLeft,
      contor,
      currentIndex,
      showMovieDetails
    };
  },
  methods: {
    formatReleaseDate(timestamp) {
      const date = new Date(timestamp._seconds * 1000);
      const formattedDate = `${date.toDateString()} ${date.toLocaleTimeString()}`;
      return formattedDate;
    },
  },
};
</script>


<style scoped>

  h1{
    color: #b48e7e; 
    font-family: 'Trocchi', serif; 
    font-size: 2rem;
    font-weight: normal;
    line-height: 48px;
    margin: 0;
    padding: 20px;
    border-bottom: 2px solid white;
  }
    
    #new_movies{
    width: 100%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    background-color: rgba(6, 6, 6, 0.8);
    position: relative;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 8px;
    min-height: 800px;
    }


    #slider-container {

    width: 100%;
    position: relative;
    overflow: hidden;
    padding: 20px;
    margin-top: 20px;
    }
    #slider-container .btn {
    position: absolute;
    top: calc(50% - 30px);
    height: 15px;
    width: 15px;
    border-left: 8px solid #fffdff;
    border-top: 8px solid #fffdff;
    cursor: pointer;
    }
    #slider-container .btn:hover {
    transform: scale(1.2);
    }
    #slider-container .btn.inactive {
    border-color: #282828
    }
    #slider-container .btn:first-of-type {
    transform: rotate(-45deg);
    left: 10px
    }
    #slider-container .btn:last-of-type {
    transform: rotate(135deg);
    right: 10px;
    }
    #slider-container #slider {
    display: flex;
    width: 1000%;
    height: 80%;
    transition: all .5s;
    }
    #slider-container #slider .slide {
    height: 90%;
    margin: auto 10px;
    border-radius: 5px;
    display: grid;
    place-items: center;
    }

    img {
      
      max-height: 500px;
    }


    #slider-container #slider .slide span {
    color: white;
    font-size: 2rem;
    }
    
    #slider-container #slider .slide {
      width: calc(2.5% - 20px);
    }
    
    @media only screen and (max-width: 1400px) {
      #slider-container #slider .slide {
        width: calc(3.33% - 20px);
      }
    }
   
    @media only screen and (max-width: 1070px) {
    #slider-container #slider .slide {
      width: calc(5% - 20px);
    }
    }
    @media only screen and (max-width: 730px) {
    #slider-container #slider .slide {
      width: calc(10% - 20px);
    }
    }

    #title_container{
      align-items: center;
      justify-content: center;
      width: 100%;
      top: 450px;
      background-color: rgba(6, 6, 6, 0.8);
      height: 50px;
    }
    #title_container span{
      padding: 50px;
    }

  .circle{
    position: absolute;
    top: 0;
    margin-left: 250px;
    background-color: rgba(206, 46, 46,0.8);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #fffdff;

  }


</style>