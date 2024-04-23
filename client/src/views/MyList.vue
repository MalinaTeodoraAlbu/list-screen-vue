<template>
    <div class="container_movie">
      <div class="categories_div">
        <div class="filters">
          <span class="categories" :class="{ active: isSelectedCategory('watched') }" @click="setCategory('watched')">Watched</span>
          <span class="categories" :class="{ active: isSelectedCategory('watchLater') }" @click="setCategory('watchLater')">Watch Later</span>
        </div>
      </div>
      <MoviesList :movies="filteredMovies" />
    </div>
</template>


<script>
import Navbar from '../components/Navbar.vue';
import MoviesList from '../components/MoviesList.vue';
import { ref, onMounted, computed } from 'vue';
import useToken from '../composables/useToken'
import getUser from '@/composables/getUser';

export default {
  components: { Navbar, MoviesList },
  setup() {
    const {token, getToken} = useToken()
    const {user} = getUser()
    const movies = ref({
      watched: [],
      watchLater: [],
    });

    const selectedCategory = ref('watched');

    const setCategory = (category) => {
      selectedCategory.value = category;
      
    };

    const isSelectedCategory = (category) => {
    return selectedCategory.value === category;
  };

    const movieFetchList = async () => {
      try {
        const response = await fetch(`http://localhost:4000/users/${user.value.uid}`);
        const userData = await response.json();
        movies.value.watched = userData.user.movies.filter(movie => movie.status === 'watched') || [];
        movies.value.watchLater = userData.user.movies.filter(movie => movie.status === 'watchLater') || [];
          } catch (error) {
        console.error('Error checking if movie is in the lists:', error);
      }
    };
    onMounted(movieFetchList);

    const filteredMovies = computed(() => {
      const category = selectedCategory.value;
        return movies.value[category];
    });

    return {
      selectedCategory,
      setCategory,
      movieFetchList,
      filteredMovies,
      isSelectedCategory
    };
  },
};
</script>

<style>

  .container_movie{
    min-height: 800px;
  }
  .filters {
    display: flex;
    justify-content: flex-end;
    align-items: center; 
    padding: 10px;
    flex-wrap: wrap;
  }

  .categories_div{
    border-bottom: 2px solid white;
    padding: 10px 0; 
    width: 100%;
    margin-bottom: 20px;
  }

  .categories_div span{
    color: white;
    padding: 10px;
    margin-right: 20px;
    font-size: 1rem;
  }

  .categories_div .active{
    color: rgb(6, 6, 6);
    background-color: white;
    border-radius: 20px;
  }

  .categories{
    margin-left:50px;
  }


  @media(max-width: 767px){
    .categories_div{
      margin: 0;
  }
    .categories_div span{
    padding: 5px;
    font-size: 10px;
  }
  .categories{
    margin-left: 5px;
  }

  }
</style>