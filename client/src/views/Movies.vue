<template>
  <div>
    <div class="container_movie">
      <div class="gene_categories">
        <div class="filters" :class="{ 'show-filters': isFiltersVisible }">
          <span v-if="isFiltersVisible" class="toggle-filters" @click="toggleFilters">Hide Filters</span>
          <span v-else class="toggle-filters" @click="toggleFilters">View Filters</span>
          <div class="dropdown">
            <label >Sort by</label>
            <select  v-model="sortBy">
              <option value="ranking">Ranking</option>
              <option value="alphabetical">Alphabetical</option>
          </select>
          </div>
          <div class="dropdown"> 
            <label> Genre: </label>
            <select v-model="selectedGenre">
              <option value="">All Genres</option>
              <option v-for="genre in genresArray" :key="genre" :value="genre">{{ genre }}</option>
            </select>
          </div>
          <div class="dropdown">
            <label>Ranking</label>
            <select v-model="selectedRaiting">
            <option value="">All Ranking</option>
            <option value="lower">Lower than 5</option>
            <option value="greater">Greater than 5</option>
          </select>
          </div>
          <div class="orderBy">
              <span class="material-symbols-outlined" v-if="sortOrder" @click="changeOrder">expand_less</span>
              <span class="material-symbols-outlined" v-else @click="changeOrder">keyboard_arrow_down</span>
          </div>
          <div>
            <span class="material-symbols-outlined" @click="undoFilters">undo</span>
          </div>
          <div class="search_bar">
            <input type="text" v-model="search" placeholder="Search for a movie...">
            <span class="material-symbols-outlined">search</span>
          </div> 
        </div>
      </div>
      <div>
          <MoviesList :movies="paginatedMovies"></MoviesList>
          <div class="pagination">
            <span   @click="previousPage" :disabled="currentPage === 1" class="material-symbols-outlined">arrow_back_ios_new</span>
            <span >{{ currentPage }} / {{ totalPages }}</span>
            <span  @click="nextPage" :disabled="currentPage === totalPages" class="material-symbols-outlined"> arrow_forward_ios</span>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import MoviesList from '../components/MoviesList.vue';

import { movies, fetchMovies } from '../composables/getMovies';
import { computed, onMounted, ref } from 'vue';

export default {
  components: { Navbar, MoviesList },
  setup() {
    const genres = new Set();
    const genresArray = ref([]);
    const selectedGenre = ref('');
    const selectedRaiting = ref('');

    const search = ref('');
    const sortBy = ref('ranking');
    const sortOrder = ref(false);
    //page
    const currentPage = ref(1);
    const perPage = 12;

    const isFiltersVisible = ref(false);

    const toggleFilters = () => {
      isFiltersVisible.value = !isFiltersVisible.value;
    };

    const totalPages = computed(() => {
      const totalMovies = matchingMovies.value.length;
      return Math.ceil(totalMovies / perPage);
    });

    const paginatedMovies = computed(() => {
      const startIndex = (currentPage.value - 1) * perPage;
      const endIndex = startIndex + perPage;
      return matchingMovies.value.slice(startIndex, endIndex);
    });

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };
    
    const changeOrder = () =>{
      sortOrder.value  = !sortOrder.value
    }

    onMounted(async () => {
      await fetchMovies();
      if (movies.value) {
        movies.value.forEach((movie) => {
          movie.Genre.forEach((genre) => {
            genres.add(genre);
          });
        });
      }
      genresArray.value = Array.from(genres);
    });

   
    
    const matchingMovies = computed(() => {
      if (!movies.value || !Array.isArray(movies.value)) {
        return [];
      }

      let filteredMovies = movies.value.filter((movie) => {
        const titleMatch = movie.Title.toLowerCase().includes(search.value.toLowerCase());
        const genreMatch = selectedGenre.value === '' || movie.Genre.includes(selectedGenre.value);

        let raitingMatch = true;
        if (selectedRaiting.value === 'lower' && movie.Rating > 5) {
          raitingMatch = false;
        } else if (selectedRaiting.value === 'greater' && movie.Rating <= 5) {
          raitingMatch = false;
        }
        return titleMatch && genreMatch && raitingMatch;
      });


      switch (sortBy.value) {
        case 'ranking':
          filteredMovies = filteredMovies.sort((a, b) => {
            const order = sortOrder.value === true ? 1 : -1;
            return order * (a.Rating - b.Rating);
          });
          break;
        case 'alphabetical':
          filteredMovies = filteredMovies.sort((a, b) => {
            const order = sortOrder.value === true ? 1 : -1;
            return order * a.Title.localeCompare(b.Title);
          });
          break;
        default:
          break;
      }
      return filteredMovies;
    });

    const undoFilters = () => {
    search.value = '';
    selectedGenre.value = '';
    selectedRaiting.value = '';
    sortBy.value = 'ranking';
    sortOrder.value = false;
    currentPage.value = 1;
   };

    return {
      movies,
      matchingMovies,
      search,
      genresArray,
      selectedGenre,
      selectedRaiting,
      sortBy,
      currentPage,
      totalPages,
      paginatedMovies,
      previousPage,
      nextPage,
      toggleFilters,
      isFiltersVisible,
      sortOrder,
      changeOrder,
      undoFilters
    };
  },
};
</script>

  <style>
  .container_movie .pagination{
    display: flex;
    justify-content: flex-end;
    align-items: center; 
    padding: 10px;
    flex-wrap: wrap;
  }
  .pagination span{
    margin-left: 20px;
    margin-right: 20px;
    color: white;
  }

  .search_bar input {
    appearance: none;
    border: none;
    min-width: 200px;
    outline: none;
    padding: .4em;
    background: none;
    margin: auto;
    width: 70%;
    border-bottom: 2px solid white;
    color: white;
  }

  .orderBy{
    margin-right: 20px;
    background-color: rgba(200, 198, 198, 0.5);
    border-radius: 20px;
  }

  .select_asc_desc{
    max-width: 50px;
  }
  .toggle-filters {
    display: none;
    border: 1px solid white;
    padding: 8px;
    color: white;
    border-radius: 20px;
  }

  .toggle-filters:hover {
    background-color: white;
  }


  @media only screen and (max-width: 767px) {
    .toggle-filters {
      display: block;
      margin-right: 20px; 
    }

    .filters {
      align-items: stretch; 
    }

    .dropdown {
      display: none; 
      margin-bottom: 10px;
    }

    .filters.show-filters .dropdown {
      display: block;
    }

    .pagination span{
    margin-left: 0;
    margin-right: 0;
  }
  }

</style>
