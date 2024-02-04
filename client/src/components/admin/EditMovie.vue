<template>
  <div class="container_movies_admin">
    <div class="h1_add_movie">
      <h1>Edit movie</h1>
    </div>
    <div class="edit-movie-form">
      <div class="image_div">
        <img v-if="movieData && movieData.ImageURL" :src="movieData.ImageURL" alt="Movie Image" class="preview-image">
        
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
      <label v-if="movieData.Genre !=''">Genres: </label>
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
      <label v-if="movieData.Cast !=''">Cast: </label>
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
        <button @click="editMovie">Edit Movie</button>
        <button class="back_btn" @click="cancel">Cancel</button>
      </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import useStorage from '../../composables/useStorage'; 
import { useRouter } from 'vue-router';
import useToken from '@/composables/useToken';
import getUser from '@/composables/getUser';

export default {
  props: ['id'],
  setup(props) {
    const { uploadImage, url, filePath, error } = useStorage();
    const genres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Thriller', 
    'Romance', 'Horror', 'Mystery', 'Adventure', 'Fantasy'];
    const selectedGenre = ref('');
    const addedActor = ref('');
    const movieData = ref({});
    const loading = ref(true);
    const errorMovie = ref('')
    const { token, getToken } = useToken();
    const router = useRouter();

    getToken();
    
    const fetchMovieData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/movies/${props.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch movie data: ${response.statusText}`);
        }

        const data = await response.json();
        movieData.value = data.movie;
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        loading.value = false;
      }
    };

    
    const addGenre = () => {
  if (selectedGenre.value && !movieData.value.Genre.includes(selectedGenre.value)) {
    movieData.value.Genre.push(selectedGenre.value);
    movieData.value.Genre = [...movieData.value.Genre];
    selectedGenre.value = ''; 
    }
  };

    const addActor = () => {
    if (addedActor.value && !movieData.value.Cast.includes(addedActor.value)) {
      movieData.value.Cast.push(addedActor.value);
      movieData.value.Cast = [...movieData.value.Cast];
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

    onMounted(() => {
      fetchMovieData();
    });

    const validateTitle = () => {
      const trimmedTitle = movieData.value.Title.trim();

      if (trimmedTitle === '') {
        errorMovie.value = 'Please enter a title.';
        return false;
      }

      const firstLetter = trimmedTitle.charAt(0).toUpperCase();
      movieData.value.Title = firstLetter + trimmedTitle.slice(1);

      return true;
    };

    const validateGenre = () => {
      if (movieData.value.Genre.length === 0) {
        errorMovie.value = 'Please select at least one genre.';
        return false;
      }
      return true;
    };

    const validateCast = () => {
      if (movieData.value.Cast.length === 0) {
        errorMovie.value = 'Please select at least one actor.';
        return false;
      }
      return true;
    };

    const editMovie = async () => {
      if (!validateTitle() || !validateGenre() || !validateCast()) {
    return;
    }
    try {
        const response = await fetch(`http://localhost:4000/movies/${props.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(movieData.value),
        });

        if (!response.ok) {
        throw new Error(`Failed to update movie: ${response.statusText}`);
        }
        const updatedData = await response.json();
        console.log('Movie updated successfully:', updatedData);
        router.push({ name: 'ManageMovies'});
    } catch (error) {
        console.error('Error updating movie:', error);
    }
    };

    const cancel = async() => {
      router.push({ name: 'ManageMovies'});
    }

    return {
      movieData,
      loading,
      editMovie,
      genres,
      addGenre,
      addActor,
      selectedGenre,
      addedActor,
      handleImageUpload,
      cancel,
      deleteGenre,
      errorMovie,
      deleteActor
    };
  },
};
</script>


<style scoped>

.error{
  font-size: 1rem;
  color: rgb(178, 8, 8);
  font-weight: bold;

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

.error_container{
  border: 1px solid rgba(252, 251, 251, 0.8);
  background-color: rgba(252, 251, 251, 0.5);
  border-radius: 20px;
  padding: 20px;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}

.edit-movie-form {
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

.genre_{
  display: flex;
  border:1px solid rgba(214, 207, 230, 0.5);
  border-radius: 20px;
  padding: 10px;
  margin-top: 10px;
  justify-content: space-between;
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

textarea{
  min-height: 200px;
}
@media (max-width: 808px) {
  .edit-movie-form{
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