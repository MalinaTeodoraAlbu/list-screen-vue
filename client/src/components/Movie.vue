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
          <span v-for="index in 10" :key="index" class="star" :class="{ 'filled': index <= Math.floor(movie.Rating), 'half-filled': index > Math.floor(movie.Rating) && index - 0.5 <= movie.Rating }">&#9733;</span>

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
  data() {
    return {
      completedAdded: false,
      watchNowAdded: false,
      watchLaterAdded: false,
      user: projectAuth.currentUser,
    };
  },
  methods: {
    async toggleCompleted() {
      if (this.completedAdded) {
        await this.removeFromUserList('completed');
        this.completedAdded = false
      } else {
        await this.addToUserList('completed');
        this.completedAdded = true
      }
    },
    async togglewatchLater() {
      if (this.watchLaterAdded) {
        await this.removeFromUserList('watchLater');
        this.watchLaterAdded = false
      } else {
        await this.addToUserList('watchLater');
        this.watchLaterAdded = true
      }
    },
    async togglewatchNow() {
      if (this.watchNowAdded) {
        await this.removeFromUserList('watchNow');
        this.watchNowAdded = false
      } else {
        await this.addToUserList('watchNow');
        this.watchNowAdded = true
      }
    },
    async addToUserList(listType) {
      try {
        const user = projectAuth.currentUser;
        const response = await fetch(`http://localhost:4000/users/${user.uid}/add-movie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: listType,
            movie: this.movie,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add movie to the user list');
        }

        console.log('Movie added to the user list successfully');
      } catch (error) {
        console.error('Error adding movie to the user list:', error);
      }},
      async checkIfMovieInLists() {
  try {
    const user = projectAuth.currentUser;
    const response = await fetch(`http://localhost:4000/users/${user.uid}`);
    const userData = await response.json();

    const movieId = this.movie.id;
    const isInCompletedMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === "completed");
    const isInWatchNowMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === "watchNow");
    const isInWatchLaterMovies = userData.user.movies.some(movie => movie.id === movieId && movie.status === "watchLater");

    this.completedAdded = isInCompletedMovies;
    this.watchNowAdded = isInWatchNowMovies;
    this.watchLaterAdded = isInWatchLaterMovies;

  } catch (error) {
    console.error('Error checking if movie is in the lists:', error);
  }
},
    async removeFromUserList(listType) {
      try {
        const user = projectAuth.currentUser;
        const movieId = this.movie.id;

        const response = await fetch(`http://localhost:4000/users/${user.uid}/remove-movie`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
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
},
created() {
  this.checkIfMovieInLists();
}
}
</script>
  
  <style scoped>
  
.movie {
  background-color: #302f2f;
  color: white;
  border-radius: 8px;
  box-shadow: rgba(255, 255, 255, 0.4) 0px 0px 0px 2px, rgba(255, 255, 255, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
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
  