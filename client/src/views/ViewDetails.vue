<template>
  <div class="movies-container">
    <div class="left_details">
      <img v-if="movie.ImageURL" :src="movie.ImageURL" alt="Movie Poster" class="movie-poster" />
      <img v-else src="https://st4.depositphotos.com/14953852/24787/v/1600/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" alt="Movie Poster" class="movie-poster" />
    </div>
      <div class="right_details" >
        <h2 id="movie_title">{{ movie.Title }}</h2>
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
        <div class="separator"></div>
        <div class="description">
           <h3> {{ movie.Description }}</h3>
        </div>
        <div class="movie-buttons">
        <button @click="toggleCompleted" :class="{ 'added': completedAdded }">Completed</button>
        <button @click="togglewatchNow" :class="{ 'added': watchNowAdded }">Watch Now</button>
        <button @click="togglewatchLater" :class="{ 'added': watchLaterAdded }">Watch Later</button>
      </div>
      <div class="bottom_details">
        <button id="button_back" @click="goBack">Back</button>
      </div>
      </div>
      
      
    </div>
</template>

<script>
import { projectAuth } from '@/firebase/config';
import useToken from '@/composables/useToken';
import { onMounted, ref } from 'vue';

export default {
  props: ['movie'],
  setup(props) {
    const { token, getToken } = useToken();
    getToken();

    const completedAdded = ref(false);
    const watchNowAdded = ref(false);
    const watchLaterAdded = ref(false);

    const methods = {
      async toggleCompleted() {
      await methods.toggleStatus('completed', completedAdded);
      },

      async togglewatchLater() {
        await methods.toggleStatus('watchLater', watchLaterAdded);
      },

      async togglewatchNow() {
        await methods.toggleStatus('watchNow', watchNowAdded);
      },
      async toggleStatus(status, addedRef) {
  try {
    const user = projectAuth.currentUser;
    const movieId = props.movie.id;
    const isInList = addedRef.value;
    if (isInList) {
      await methods.removeFromUserList(status);
      addedRef.value = false;
    } else {
      if (status !== 'completed') {
        await methods.removeFromUserList('completed');
        completedAdded.value = false;
      }
      if (status !== 'watchLater') {
        await methods.removeFromUserList('watchLater');
        watchLaterAdded.value = false;
      }
      if (status !== 'watchNow') {
        await methods.removeFromUserList('watchNow');
        watchNowAdded.value = false;
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
          const user = projectAuth.currentUser;
          const response = await fetch(`http://localhost:4000/users/${user.uid}/add-movie`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              status: listType,
              movie: props.movie,
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
        this.$emit('close');
      },
      async checkIfMovieInLists() {
        try {
          const user = projectAuth.currentUser;
          const response = await fetch(`http://localhost:4000/users/${user.uid}`);
          const userData = await response.json();
          const movieId = props.movie.id;

          const isInCompletedMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === 'completed');
          const isInWatchNowMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === 'watchNow');
          const isInWatchLaterMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === 'watchLater');

          completedAdded.value = isInCompletedMovies;
          watchNowAdded.value = isInWatchNowMovies;
          watchLaterAdded.value = isInWatchLaterMovies;
        } catch (error) {
          console.error('Error checking if movie is in the lists:', error);
        }
      },
      async removeFromUserList(listType) {
        try {
          const user = projectAuth.currentUser;
          const movieId = props.movie.id;

          const response = await fetch(`http://localhost:4000/users/${user.uid}/remove-movie`, {
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
      methods.checkIfMovieInLists();
    });

    return { completedAdded, watchNowAdded, watchLaterAdded, ...methods };
  },
};
</script>
<style scoped>
.left_details{
  float: left;
  width: 40%;
  margin-left: 50px;
}

.right_details{
  float: right;
  width: 45%;
  margin: 50px;
}

.bottom_details{
  clear: both;
}
img {
max-width: 500px;
margin: 50px;
}

.movie_details{
  position: relative;
  top: 100px;
  padding:10px ;
}

.movie-rating{
  display: inline;
}

#movie_title {
  font-family: oswald;
  font-size: 2rem;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1;
  color: white;
  margin-bottom: 20px;
}
.movie-buttons{
  margin: 80px;
}

button{
  margin-left: 20px;
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

p{
  color: white;
  margin: 20px;
}

.movie-tags {
  display: flex;
  align-items: center;
}

.movie-tags span {
  background-color: #ffffff;
  color: black;
  padding: 10px;
  border-radius: 20px;
}

.description h3 {
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
</style>