<template>
        <div class="container_movies_admin" >
            <div class="actions_movie">
              <div class="search_bar">
            <input type="text" v-model="search" placeholder="Search for a movie...">
            <span class="material-symbols-outlined">search</span>
          </div> 
            <p>Add a new movie</p>
            <router-link to="/add-movie"> <span class="material-symbols-outlined">add</span></router-link>
            <p>Add moview with faker</p>
            <span class="material-symbols-outlined" @click="addFakerMoviesfunc">add</span>
            </div>
              <table class="table_movies">
                <thead>
                    <tr>
                    <th class="th_id" > #</th>
                    <th class="th_title"> Title</th>
                    <th class="th_genre">Genre</th>
                    <th class="th_ranking">Ranking</th>
                    <th class="th_actions"> </th>
                    </tr>
                </thead>
                <tbody >
                    <tr v-for="(movie, movieIndex) in paginatedMovies" :key="movie.id">
                      <td> {{ calculateIndex(movieIndex) }} </td>
                    <td>{{ movie.Title }}</td>
                    <td > {{ movie.Genre[0] }},  {{ movie.Genre[1] }}</td>
                    
                    <td>{{ movie.Rating }}</td>
                    <td>
                        <span class="material-symbols-outlined" @click="editMovie(movie)">edit</span>
                        <span class="material-symbols-outlined" @click="deleteMovie(movie)">delete</span>
                    </td>
                    </tr>
                </tbody>
            </table>
            <div class="pagination">
            <span   @click="previousPage" :disabled="currentPage === 1" class="material-symbols-outlined">arrow_back_ios_new</span>
            <span >{{ currentPage }} / {{ totalPages }}</span>
            <span  @click="nextPage" :disabled="currentPage === totalPages" class="material-symbols-outlined">arrow_forward_ios</span>
          </div>
        </div>
</template>

<script>
import { useRouter } from 'vue-router';
import Navbar from '../../components/Navbar.vue';
import { movies, fetchMovies } from '../../composables/getMovies';
import { computed, onMounted, ref } from 'vue';
import { addFakerMovies } from '../../composables/addFakerMovies'
import useToken from '@/composables/useToken';
import getUser from '@/composables/getUser';

export default {
  components: { Navbar },
  setup() {
    const router = useRouter();
    const currentPage = ref(1);
    const perPage = 10;
    const search = ref('');
    const { token, getToken } = useToken();
    const {user} = getUser();
    getToken();

    const addFakerMoviesfunc = async () => {
      addFakerMovies();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchMovies();
    }

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

    const totalPages = computed(() => {
      return Math.ceil(movies.value.length / perPage);
    });

    const paginatedMovies = computed(() => {
      const startIndex = (currentPage.value - 1) * perPage;
      const endIndex = startIndex + perPage;
      return matchingMovies.value.slice(startIndex, endIndex);
    });

    onMounted(async () => {
      await fetchMovies();
    });

    const deleteMovie = async (movie) => {
      try {
        console.log(movie);
        const response = await fetch('http://localhost:4000/movies/' + movie.id, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
          },
        });
        if (response.ok) {
          await fetchMovies();
        } else {
          console.error('Error deleting movie:', response.status);
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    };

    const editMovie = (movie) => {
      if (movie && movie.id) {
        router.push({ name: 'EditMovie', params: { id: movie.id } });
      } else {
        console.error('Movie must have an "id" property for editing.');
      }
    };

    const calculateIndex = (movieIndex) => {
      return (currentPage.value - 1) * perPage + movieIndex + 1;
    };

    const matchingMovies = computed(() => {
      if (!movies.value || !Array.isArray(movies.value)) {
        return [];
      }

      let filteredMovies = movies.value.filter((movie) => {
        const titleMatch = movie.Title.toLowerCase().includes(search.value.toLowerCase());
        return titleMatch;
      });
      return filteredMovies;
    });

    return {
      movies,
      deleteMovie,
      currentPage,
      totalPages,
      paginatedMovies,
      matchingMovies,
      previousPage,
      nextPage,
      editMovie,
      calculateIndex,
      addFakerMoviesfunc,
      search
    };
  },
};
</script>


<style scoped>

  .th_id{
    margin: auto;
    width: 2%
  }
  .pagination{
    position: absolute;
    margin-bottom: 20px;
    bottom: 10px;
    right: 0;
    margin: auto;

  }
  
  .table_movie_conatiner{
    width: 100%;
    margin: auto;
    display: flex;
    justify-content: center;
    min-height: 650px;
  }
  .container_movies_admin{
    min-height: 800px;
  }

  .actions_movie p{
    margin-left: 40px;
  }


</style>