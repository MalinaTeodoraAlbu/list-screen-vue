<template>
  <div class="container_movies_admin">
    <div class="h1_add_movie">
      <h1>Add new movie</h1>
    </div>
    <div class="add-movie-form">
      <div class="image_div">
        <img v-if="movieData.ImageURL" :src="movieData.ImageURL" alt="Movie Image" class="preview-image">
      </div>
        <div class="forms_group">
          <div class="form-group">
        <label for="image">Image</label>
        <input type="file" id="image" accept="image/*" @change="handleImageUpload">
      </div>
    <div class="form-group">
      <label for="title">Title</label>
      <input type="text" id="title" v-model="movieData.Title">
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea id="description" v-model="movieData.Description"></textarea>
    </div>
    <div class="form-group">
      <label for="rating">Rating</label>
      <input type="number" step="0.1" id="rating" v-model="movieData.Rating">
    </div>
    <div class="form-group">
      <label for="duration">Duration</label>
      <input type="text" id="duration" v-model="movieData.Duration">
    </div>
    <div class="form-group">
      <label for="genre">Genre</label>
      <select id="genre" v-model="selectedGenre">
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
      <span  @click="addGenre" class="material-symbols-outlined">library_add</span>
      <label v-if="movieData.Genre.length > 0">Genres selected: </label>
      <div v-for="genre in movieData.Genre" :key="genre">
        <div class="genre_">
          <p>{{ genre }}</p>
          <p @click="deleteGenre(genre)">X</p>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label for="cast">Cast</label>
      <input type="text" id="cast" v-model="addedActor">
      <span  @click="addActor" class="material-symbols-outlined">library_add</span>
      <label v-if="movieData.Cast.length > 0">Added cast: </label>
      <div v-for="actor in movieData.Cast" :key="actor">
        <div class="genre_">
          <p>{{ actor }}</p>
          <p @click="deleteActor(actor)">X</p>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label for="releaseDate">Release Date</label>
      <input type="date" id="releaseDate" v-model="movieData.ReleaseDate">
    </div>
    <div class="error_container" v-if="errorMovie!=''">
      <span class="error">{{ errorMovie }}</span>
    </div>
        </div>
    </div>
    <div class="form-group_btn">
        <button @click="addMovie">Add Movie</button>
        <button class="back_btn" @click="cancel">Cancel</button>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import useStorage from '../../composables/useStorage'; 
import { useRouter } from 'vue-router';
import useToken from '@/composables/useToken';
import getUser from '@/composables/getUser';
import {validateMovie} from '../../composables/validateMovie'

export default {
  setup() {
    const { uploadImage, url, filePath, error } = useStorage();
    const genres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Thriller', 
    'Romance', 'Horror', 'Mystery', 'Adventure', 'Fantasy'];
    const selectedGenre = ref('');
    const addedActor = ref('');
    const errorMovie = ref('')
    const router = useRouter();
    const { token, getToken } = useToken();
    const {user} = getUser();
    getToken();

    const movieData = ref({
      Title: '',
      Description: '',
      Rating: '',
      Duration: '',
      Genre: [],
      Cast: [],
      ReleaseDate: '',
      ImageURL: ''
    });

    const addGenre = () => {
    if (selectedGenre.value && !movieData.value.Genre.includes(selectedGenre.value)) {
      movieData.value.Genre.push(selectedGenre.value);
      selectedGenre.value = ''; 
      }
    };

    const addActor = () => {
    if (addedActor.value && !movieData.value.Cast.includes(addedActor.value)) {
      movieData.value.Cast.push(addedActor.value);
      addedActor.value = ''; 
    }
  };

  const deleteGenre = (genre) => {
    if(genre){
      movieData.value.Genre.pop(genre);
    }
  }
  const deleteActor = (actor) => {
    if(actor){
      movieData.value.Cast.pop(actor);
    }
  }


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadImage(file);
      movieData.value.ImageURL = url.value;
    }
  };

    const addMovie = async () => {
      if (!validateMovie(movieData,  errorMovie)) {
      return;
      }
      try {
        const response = await fetch('http://localhost:4000/movies/add-movies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify(movieData.value),
        });

        if (!response.ok) {
          throw new Error('Failed to add movie');
        }
        router.push({ name: 'ManageMovies'});
      } catch (error) {
        console.error('Error adding movie:', error);
      }
    };

    const cancel = async() => {
      router.push({ name: 'ManageMovies'});
    }


    return {
      movieData,
      addMovie,
      handleImageUpload,
      genres,
      selectedGenre,
      addedActor,
      addGenre,
      addActor,
      errorMovie,
      deleteGenre,
      deleteActor,
      cancel
    };
  },
};

</script>

<style scoped>

textarea{
  min-height: 200px;
}
.error{
  font-size: 1rem;
  color: rgb(178, 8, 8);
  font-weight: bold;

}
.genre_{
  display: flex;
  border:1px solid rgba(214, 207, 230, 0.5);
  border-radius: 20px;
  padding: 10px;
  margin-top: 10px;
  justify-content: space-between;
}
.error_container{
  border: 1px solid rgba(252, 251, 251, 0.8);
  background-color: rgba(252, 251, 251, 0.5);
  border-radius: 20px;
  padding: 20px;
}
.back_btn{
  justify-items: flex-end;
  float: right;
  margin-left: 20px;
  right: 0;
}
.forms_group{
float: right;
width: 50%;
}
.h1_add_movie{
  display: flex;
  justify-content: center;
  border-bottom: 1px solid white;
  width: 100%;
  margin: 20px;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}

.add-movie-form {
  background-color: rgba(106, 102, 115, 0.5);
  color: white;
  padding: 20px;
  width: 80%;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
}

#genre, #cast{
  width: 90%;
  margin-right: 10px;
}
.image_div{
  width: 40%;
  margin: 40px;
  height: auto;
  max-height: 600px;
  border: 3px solid white;
  border-radius: 20px;
  justify-content: center;
  align-content: center;
  display: flex;
  float: left;
}
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-bottom: 10px;
}

button {
  background-color: #eff3ef;
  color: rgb(0, 0, 0);
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 50px;
}

.preview-image {
  align-items: center;
  max-width: 100%;
  padding: 10px;
  max-height: 100%;
}

.form-group_btn{
  clear: both;
}

@media (max-width: 808px) {
  .add-movie-form {
  display: block;
  width: 100%;
  }
  .forms_group{
  clear: both;
  width: 100%;
  float: none;
  }

  .image_div{
  width: 100%;
  clear: both;
  float: none;
  margin: 0;
  padding: 0;
  margin-bottom: 20px;
}

#genre, #cast{
  width: 85%;

}

}


</style>
