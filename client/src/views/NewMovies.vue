<template>
    <div>
      <div class="navbar">
        <Navbar></Navbar>
      </div>
      <div id="new_movies">
        <div>
            <h1>New Movies </h1>
        </div>
        <div id="slider-container">
          <span @click="slideRight" class="btn"></span>
          <div id="slider">
            <div v-for="movie in latestMovies" :key="movie.id" class="slide">
              <Movie :movie="movie"></Movie>
            
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
  import { movies, fetchMovies } from '../composables/getMovies';
  import { computed, onMounted, ref, watch } from 'vue';
  
  export default {
    components: { Navbar, Movie },
    setup() {
      const currentIndex = ref(0);
  
      const sortedMovies = computed(() =>
        movies.value.slice().sort((a, b) => b.ReleaseDate - a.ReleaseDate)
      );
  
      const latestMovies = computed(() =>
        sortedMovies.value.slice(currentIndex.value, currentIndex.value + 10)
      );
  
      const slideRight = () => {
        currentIndex.value = Math.max(currentIndex.value - 1, 0);
      };
  
      const slideLeft = () => {
        currentIndex.value = Math.min(currentIndex.value + 1, movies.value.length - 10);
      };
  
      onMounted(async () => {
        await fetchMovies();
      });
  
      watch([currentIndex, movies], () => {
        latestMovies.value = sortedMovies.value.slice(
          currentIndex.value,
          currentIndex.value + 10
        );
      });
  
      return {
        latestMovies,
        slideRight,
        slideLeft,
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
  color: #7c795d; 
  font-family: 'Trocchi', serif; 
  font-size: 45px;
font-weight: normal;
    line-height: 48px;
     margin: 0;
     padding: 50px;
}

  #new_movies{
  width: 100%;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  background-color: rgba(6, 6, 6, 0.8);
  position: relative;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 3px 8px;
  min-height: 800px;
  }


#slider-container {
    border-top: 2px solid white;
	width: 100%;
	position: relative;
	overflow: hidden;
	padding: 20px;
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
@media only screen and (min-width: 1100px) {
	#slider-container #slider .slide {
		width: calc(2.5% - 20px);
	}
}
@media only screen and (max-width: 1100px) {
	#slider-container #slider .slide {
		width: calc(3.3333333% - 20px);
	}
}
@media only screen and (max-width: 900px) {
	#slider-container #slider .slide {
		width: calc(5% - 20px);
	}
}
@media only screen and (max-width: 550px) {
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


  </style>