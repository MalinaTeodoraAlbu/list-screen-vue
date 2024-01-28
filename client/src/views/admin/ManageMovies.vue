<template>
  <div>
    <div>
        <NavbarAdmin></NavbarAdmin>
    </div>
    <div>
        <div class="container_movies_admin" >
            <div class="actions_movie">
            <p>Add a new movie</p>
            <router-link to="/add-movie"> <span class="material-symbols-outlined">add</span></router-link>
            </div>
            <table class="table_movies">
                <thead>
                    <tr>
                    <th class="th_title"> Title</th>
                    <th class="th_genre">Genre</th>
                    <th class="th_ranking">Ranking</th>
                    <th class="th_actions"> </th>
                    </tr>
                </thead>
                <tbody >
                    <tr v-for="movie in paginatedMovies" :key="movie.id">
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
            <span   @click="previousPage" :disabled="currentPage === 1" class="material-symbols-outlined">
            arrow_back_ios_new
            </span>
            <span >{{ currentPage }} / {{ totalPages }}</span>
            <span  @click="nextPage" :disabled="currentPage === totalPages" class="material-symbols-outlined">
          arrow_forward_ios
          </span>
          </div>
        </div>
    </div>
    <router-view></router-view>
  </div>
  
</template>

<script>
import { useRouter } from 'vue-router';
import NavbarAdmin from '../../components/admin/NavbarAdmin.vue';
import { movies, fetchMovies } from '../../composables/getMovies';
import { computed, onMounted, ref } from 'vue';

export default {
  components: { NavbarAdmin },
  setup() {
    const router = useRouter();
    const currentPage = ref(1);
    const perPage = 10;

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
      return movies.value.slice(startIndex, endIndex);
    });

    onMounted(async () => {
      await fetchMovies();
    });

    const deleteMovie = async (movie) => {
      try {
        console.log(movie);
        const response = await fetch('http://localhost:4000/movies/' + movie.id, {
          method: 'DELETE',
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

  
    return {
      movies,
      deleteMovie,
      currentPage,
      totalPages,
      paginatedMovies,
      previousPage,
      nextPage,
      editMovie
    };
  },
};
</script>