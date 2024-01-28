<template>
  <div class="page_">
    <div class="navbar">
      <Navbar></Navbar>
    </div>
    <div class="container_movie">
      <div class="categories_div">
        <div class="filters">
          <span class="categories" :class="{ active: isSelectedCategory('completed') }" @click="setCategory('completed')">Completed</span>
          <span class="categories" :class="{ active: isSelectedCategory('watchNow') }" @click="setCategory('watchNow')">Watch Now</span>
          <span class="categories" :class="{ active: isSelectedCategory('watchLater') }" @click="setCategory('watchLater')">Watch Later</span>
      </div>
      </div>
      <MoviesList :movies="filteredMovies" />
    </div>
  </div>
</template>
<script>
import Navbar from '../components/Navbar.vue';
import MoviesList from '../components/MoviesList.vue';
import { ref, onMounted, computed } from 'vue';
import { projectAuth } from '@/firebase/config';
import useToken from '../composables/useToken'
import getUser from '@/composables/getUser';

export default {
  components: { Navbar, MoviesList },
  setup() {
    const {token, getToken} = useToken()
    const {user} = getUser()
    const movies = ref({
      completed: [],
      watchNow: [],
      watchLater: [],
    });

    const selectedCategory = ref('completed');

    const setCategory = (category) => {
      selectedCategory.value = category;
      
    };

    const isSelectedCategory = (category) => {
    return selectedCategory.value === category;
  };

    const movieFetchList = async () => {
      try {
        const response = await fetch(`http://localhost:4000/users/${user.value.uid}`);
        console.log(user.value.uid)
        const userData = await response.json();
        movies.value.completed = userData.user.movies.filter(movie => movie.status === 'completed') || [];
        movies.value.watchNow = userData.user.movies.filter(movie => movie.status === 'watchNow') || [];
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