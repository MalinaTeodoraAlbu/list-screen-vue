<template>
  <div class="container_movies_admin">
    <div class="h1_add_movie">
      <h1>Add new movie</h1>
    </div>
    <div class="add-movie-form">
      <div class="image_div">
        <img v-if="movieData.ImageURL" :src="movieData.ImageURL" alt="Movie Image" class="preview-image">
        <p v-else>No Image Available</p>
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
      <label>Genres selected: </label>
      <div v-for="genre in movieData.Genre" :key="genre">
        <p>{{ genre }}</p>
      </div>
    </div>
    <div class="form-group">
      <label for="cast">Cast</label>
      <input type="text" id="cast" v-model="addedActor">
      <span  @click="addActor" class="material-symbols-outlined">library_add</span>
      <label>Added cast: </label>
      <div v-for="actor in movieData.Cast" :key="actor">
        <p>{{ actor }}</p>
      </div>
    </div>
    <div class="form-group">
      <label for="releaseDate">Release Date</label>
      <input type="date" id="releaseDate" v-model="movieData.ReleaseDate">
    </div>
        </div>
    </div>
    <div class="form-group_btn">
        <button @click="addMovie">Add Movie</button>
        <button class="back_btn">Cancel</button>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import useStorage from '../../composables/useStorage'; 
import { projectStorage } from '../../firebase/config';

export default {
  setup() {
    const { uploadImage, url, filePath, error } = useStorage();
    const genres = ['Drama', 'Action', 'Comedy', 'Sci-Fi', 'Thriller', 
    'Romance', 'Horror', 'Mystery', 'Adventure', 'Fantasy'];
    const selectedGenre = ref('');
    const addedActor = ref('');

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

    const uploadImg = async (file) => {
    filePath.value = `movie-cover/${file.name}`;
    const storageRef = projectStorage.ref(filePath.value);

    try {
      const res = await storageRef.put(file);
      url.value = await res.ref.getDownloadURL();
      console.log(url.value); 
    } catch (err) {
      console.log(err.message);
      error.value = err;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await uploadImage(file);
      console.log(url.value);
      movieData.value.ImageURL = url.value;
    }
  };


    const addMovie = async () => {
      try {
        const response = await fetch('http://localhost:4000/movies/add-movies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(movieData.value),
        });

        if (!response.ok) {
          throw new Error('Failed to add movie');
        }

        const result = await response.json();
        console.log(result); 

        movieData.value = {
          Title: '',
          Description: '',
          Rating: '',
          Duration: '',
          Genre: [],
          Cast: [],
          ReleaseDate: '',
          ImageURL: ''
        };
      } catch (error) {
        console.error('Error adding movie:', error);
      }
    };

    return {
      movieData,
      addMovie,
      handleImageUpload,
      genres,
      selectedGenre,
      addedActor,
      addGenre,
      addActor
    };
  },
};

</script>

<style scoped>

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
  background-color: rgba(106, 102, 115, 0.8);
  color: white;
  padding: 20px;
  width: 60%;
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
  height: 400px;
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
