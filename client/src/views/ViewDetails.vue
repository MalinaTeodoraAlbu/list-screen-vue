<template>
   <div class="container_movie">
  <div class="movies-container" v-if="movie">
    <div class="left_details">
      <img v-if="movie.ImageURL" :src="movie.ImageURL" alt="Movie Poster" class="movie-poster" />
      <img v-else src="https://st4.depositphotos.com/14953852/24787/v/1600/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" alt="Movie Poster" class="movie-poster" />
    </div>
      <div class="right_details" >
        <h2 id="movie_title">{{ movie.Title }}</h2>
        <hr>
        <div class="movie-releaseDate">
          <p>Release date: </p>
          <h3>{{ movie.ReleaseDate }}</h3>
        </div>
        <div class="movie-rating">
          <p>Rating:</p>
          <div class="star-rating">
            <span v-for="index in 10" :key="index" class="star" :class="{ 'filled': index <= Math.floor(movie.Rating), 'half-filled': index > Math.floor(movie.Rating) && index - 0.5 <= movie.Rating }">&#9733;</span>
            <span>{{ movie.Rating }}</span>
          </div>
        </div>
        <div class="movie-tags">
          <p>Genre:</p>
          <div class="tags">
            <span v-for="genre in movie.Genre" :key="genre" class="tag">{{ genre }}</span>
          </div>
        </div>
        <div class="movie-cast">
          <p>Cast:</p>
          <div v-for="actor in movie.Cast" :key="actor" class="tag">
            <span >{{ actor }}</span>
          </div>
        </div>
        <hr>
        <div class="description">
           <h3> {{ movie.Description }}</h3>
        </div>
        
        <div class="movie-buttons" v-if="!isAdmin && isUser">
        <button @click="toggleWatched" :class="{ 'added': watchedAdded }">Watched</button>
        <button @click="togglewatchLater" :class="{ 'added': watchLaterAdded }">Watch Later</button>
      </div>
      
      </div>
    </div>
    <div class="bottom_details">
        <button id="button_back" @click="goBack">Back</button>
      </div>
  </div>
</template>

<script>
import useToken from '@/composables/useToken';
import { onMounted, ref, watch } from 'vue';
import verifyAndCheckAdmin from '@/composables/verifyAndCheckAdmin'
import getUser from '@/composables/getUser';

export default {
  props: ['id'],
  setup(props) {
    const movie = ref({});
    const { token, getToken } = useToken();
    const {user} = getUser()
    getToken();

    const isUser = ref(false)
    const isAdmin = ref(false)

    const checkAdminStatus = async () => {
      try {
        await getToken(token)
        isAdmin.value = await verifyAndCheckAdmin(token.value)
        console.log("Este admin?",isAdmin.value)
      } catch (error) {
        console.error('Error checking custom claim:', error)
      }
    }

    const fetchMovieData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/movies/${props.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch movie data: ${response.statusText}`);
        }

        const data = await response.json();
        movie.value = data.movie;
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    const watchedAdded = ref(false);
    const watchLaterAdded = ref(false);

    const methods = {
      async toggleWatched() {
      await methods.toggleStatus('watched', watchedAdded);
      },

      async togglewatchLater() {
        await methods.toggleStatus('watchLater', watchLaterAdded);
      },
      async toggleStatus(status, addedRef) {
        try {
          const isInList = addedRef.value;
          if (isInList) {
            await methods.removeFromUserList(status);
            addedRef.value = false;
          } else {
            if (status !== 'watched') {
              await methods.removeFromUserList('watched');
              watchedAdded.value = false;
            }
            if (status !== 'watchLater') {
              await methods.removeFromUserList('watchLater');
              watchLaterAdded.value = false;
            }
            await methods.addToUserList(status);
            addedRef.value = true;
          }
        } catch (error) {
          console.error(`Error toggling ${status} status:`, error);
        }
      },
      async addToUserList(listType) {
        try {
          const response = await fetch(`http://localhost:4000/users/${user.value.uid}/add-movie`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              status: listType,
              movie: movie.value,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to add movie to the user list');
          }

          console.log('Movie added to the user list successfully');
        } catch (error) {
          console.error('Error adding movie to the user list:', error);
        }
      },
      goBack() {
        this.$router.go(-1);
      },
      async checkIfMovieInLists() {
        try {
          const response = await fetch(`http://localhost:4000/users/${user.value.uid}`);
          const userData = await response.json();
          const movieId = props.id;
          isUser.value = true;

          const isInCompletedMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === 'watched');
          const isInWatchLaterMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === 'watchLater');

          watchedAdded.value = isInCompletedMovies;
          watchLaterAdded.value = isInWatchLaterMovies;
        } catch (error) {
          console.error('Error checking if movie is in the lists:', error);
        }
      },
      async removeFromUserList(listType) {
        try {
          const movieId = props.id;

          const response = await fetch(`http://localhost:4000/users/${user.value.uid}/remove-movie`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              listType: listType,
              movieId: movieId,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to remove movie from ${listType} list`);
          }

          console.log(`Movie removed from the ${listType} list successfully`);
        } catch (error) {
          console.error(`Error removing movie from the ${listType} list:`, error);
        }
      },
    };

    onMounted(() => {
      fetchMovieData();
      checkAdminStatus();
      methods.checkIfMovieInLists();
    });


    watch(() => props.id, () => {
      methods.checkIfMovieInLists();
    });

    return { isUser, isAdmin, movie, watchedAdded, watchLaterAdded, ...methods };
  },
};
</script>
<style scoped>

.movies-container{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.left_details{
  width: 40%;
  margin-left: 50px;
}

.right_details{
  width: 40%;
  margin: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: column;
}

.bottom_details{
  clear: both;
  position: absolute;
  right: 20px;
  bottom: 0;
  margin-bottom: 20px;
}
img {
max-width: 500px;
margin: 50px;
max-height: 700px;
}

.movie_details{
  position: relative;
  top: 100px;
  padding:10px ;
}

.movie-rating, .movie-releaseDate{
  display: inline;
  min-width: 300px;
}

#movie_title {
  font-family: oswald;
  font-size: 2rem;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1;
  color: white;
  min-width: 300px;
  margin-bottom: 20px;
}
.movie-buttons{
  display: flex;
  align-content: center;
  justify-content: center;
}

button{
  margin-left: 20px;
}


.separator {
  border-top: 1px solid #ffffff;
  margin: 5px 0;
}

.movie-rating, .movie-releaseDate {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.movie-releaseDate{
  color: white;
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

p{
  color: white;
  margin: 20px;
}

.movie-tags {
  display: flex;
  align-items: center;
  
}

.tags span{
  margin-left: 10px;
}

.movie-cast {
  display: block;
  align-items: center;
  margin-bottom: 10px;
}



.movie-cast span{
  margin: 50px;
}
.movie-cast span {
  color: black;
  padding: 15px;
  color: white;
}

.movie-tags span {
  background-color: #ffffff;
  color: black;
  padding: 10px;
  border-radius: 20px;
  
}

.description h3 {
  margin-top: 20px;
  font-size: 15px;
  font-family: 'Untitled Sans';
  font-weight: 400;
  color: white;
  height: 150px;
}

.added {
background-color: #2ea25f !important; 
color: #fff !important;
}

@media (max-width: 1120px) {

  .movies-container{
  justify-content:start;
}
  .left_details {
    width: 100%;
  }

  .right_details {
    width: 100%;
  }


  .movie-tags, .movie-cast, .description{
    min-width: 300px;
  }

  .movie-tags, .movie-cast{
  display: block;
  }

  
}

@media (min-width: 1130px) and (max-width: 1300px) {
  .movies-container{
  justify-content:start;
}
  .left_details {
    width: 40%;
  }

  .right_details {
    width: 40%;
  }


  .movie-cast, .description{
    min-width: 300px;
  }

  .movie-cast{
  display: block;
  }
  .movie-tags {
  display: block;
  align-items: center;
}
  
}

@media (max-width: 570px) {

  .movies-container{
  justify-content:start;
}
  .movies-container{
    width: 90%;
    margin-top: 50px;
  }
  .left_details {
    margin: 0;
    padding: 0;
    width: 80%;
  }

  .right_details {
    width: 80%;
    margin: auto;
  }

  .tags{
  display: grid;
  grid-template-columns: 100px 100px;
  grid-template-rows: auto;
}

.tags span{
  margin-bottom: 5px;
}

  img{
    width: 90%;
  }
 
  .bottom_details{
    top: 0;
  }

  .movie-buttons{
    margin-right: 25px;
    margin-bottom: 50px;
  }

  .movie-tags {
  display: block;
  align-items: center;
}
}

@media (max-width: 300px) {

  .movies-container{
    margin-top: 50px;
    justify-content: start;
  }
  .left_details {
    margin: 0;
    padding: 0;
    width: 80%;
  }

  .right_details {
    width: 80%;
    margin: 0;
  }

  img{
    width: 90%;
    align-items: center;
  }

  .bottom_details{
    top: 0;
  }

  .movie-buttons{
    margin-bottom: 50px;
    
  }

  .movie-tags {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
}
  button{
    padding: 8px;
  }
}
</style>