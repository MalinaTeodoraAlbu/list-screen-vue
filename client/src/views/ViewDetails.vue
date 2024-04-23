<template>
    <div v-if="movie" class="container_movie">
   <div class="movies-container">
     <div class="left_details">
       <img v-if="movie.ImageURL" :src="movie.ImageURL" alt="Movie Poster" class="movie-poster" />
     </div>
       <div class="right_details" >
        <div class="movie-title">
         <h2 id="movie_title">{{ movie.Title}}</h2>
        </div>
         <hr>
         <div class="movie-releaseDate">
           <p class="attribute">Release date: </p>
           <span>{{ movie.ReleaseDate }}</span>
         </div>
         <div class="movie-releaseDate">
           <p class="attribute" >Duration: </p>
           <span>{{ movie.Duration }}</span>
         </div>
         <div class="movie-rating">
           <p class="attribute">Rating:</p>
           <div class="star-rating">
             <span v-for="index in 10" :key="index" class="star" :class="{ 'filled': index <= Math.floor(movie.Rating), 'half-filled': index > Math.floor(movie.Rating) && index - 0.5 <= movie.Rating }">&#9733;</span>
             <span>{{ movie.Rating }}</span>
           </div>
         </div>
         <div class="movie-tags">
           <p class="attribute" >Genre:</p>
           <div class="tags">
             <span v-for="genre in movie.Genre" :key="genre" class="tag">{{ genre }}</span>
           </div>
         </div>
         <div class="movie-cast">
           <p class="attribute">Cast:</p>
           <div class="tag_cast" v-if="movie.Cast">
             <span v-for="(actor, index) in movie.Cast.slice(0, 4)" :key="index">{{ actor }}</span>
           </div>
         </div>
         <hr>
         <div class="description">
           <p id="show_more" @click="toggleDescription">
             {{ showFullDescription ? "Show Less" : "Show More" }}
           </p>
           <p v-if="showFullDescription">{{ movie.Description }}</p>
           <p v-else>{{ truncatedDescription }}</p>
           
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
 import { computed, onMounted, ref, watch } from 'vue';
 import verifyAndCheckAdmin from '@/composables/verifyAndCheckAdmin'
 import getUser from '@/composables/getUser';
 
 export default {
   props: ['id'],
   setup(props) {
     const movie = ref({});
     const showFullDescription = ref(false);
     const { token, getToken } = useToken();
     const {user} = getUser()
     getToken();
 
     const isUser = ref(false)
     const isAdmin = ref(false)
 
     const toggleDescription = () => {
       showFullDescription.value = !showFullDescription.value;
     };
 
     const truncatedDescription = computed(() => {
       const maxLength = 200;
       const movieDescription = movie.value.Description || '';
       return movieDescription.length > maxLength
         ? movieDescription.substring(0, maxLength) + "..."
         : movieDescription;
     });
 
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
         const response = await fetch(`https://api.themoviedb.org/3/movie/${props.id}?api_key=be2cede8efce36dd7fd1931be5dfffdc`);
         if (!response.ok) {
             throw new Error(`Failed to fetch movie data: ${response.statusText}`);
         }
 
         const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${props.id}/credits?api_key=be2cede8efce36dd7fd1931be5dfffdc`);
             const creditsData = await creditsResponse.json();
             const cast = creditsData.cast.map(actor => actor.name);
 
         const data = await response.json();
         const transformedMovie = {
             id: data.id,
             Cast: cast, 
             Description: data.overview,
             Rating: data.vote_average,
             Title: data.title,
             ImageURL: `https://image.tmdb.org/t/p/w500/${data.poster_path}`,
             Duration: `${data.runtime}m`, 
             Genre: data.genres.map(genre => genre.name), 
             ReleaseDate: data.release_date
         };
         movie.value = transformedMovie;
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
 
     return { isUser, isAdmin, movie, watchedAdded, watchLaterAdded, showFullDescription,
       toggleDescription, truncatedDescription, ...methods };
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
 
 .movie-rating, .movie-title, .movie-releaseDate{
   display: inline;
   min-width: 300px;
 }
 .movie-title{
   display: flex;
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
   display: grid;
   grid-template-columns: 1fr 3fr;
   grid-template-rows: 3fr 1fr;
 }
 
 .movie-cast p{
   margin-right: 0;
 }
 .movie-cast span {
   padding: 15px;
   color: white;
 }
 
 .movie-tags span {
   background-color: #ffffff;
   color: black;
   padding: 10px;
   border-radius: 20px;
   
 }
 
 .description{
   position: relative;
 }
 
 
 .description h3 {
   margin-top: 20px;
   font-size: 15px;
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
 
 .attribute{
   min-width: 130px;
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
 
 .tag_cast {
 display: grid;
 grid-template-columns: auto;
 gap: 0;
 grid-template-rows: 40px 40px 40px;
 margin-bottom: 20px;
 }
 .tag_cast span{
 padding-top: 25px;
 }
 </style>