const validateMovie = (movieData, errorMovie) => {
    const validateTitle = () => {
      const trimmedTitle = movieData.value.Title.trim();
  
      if (trimmedTitle === '') {
        errorMovie.value = 'Please enter a title.';
        return false;
      }
  
      if (trimmedTitle.length > 100) {
        errorMovie.value = 'Title is too long, maximum 100 characters allowed.';
        return false;
      }
  
      const firstLetter = trimmedTitle.charAt(0).toUpperCase();
      movieData.value.Title = firstLetter + trimmedTitle.slice(1);
  
      return true;
    };
  
    const validateRating = () => {
      const rating = parseFloat(movieData.value.Rating);
  
      if (isNaN(rating) || rating < 0 || rating > 10) {
        errorMovie.value = 'Please enter a valid rating between 0 and 10.';
        return false;
      }
  
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
  
    const validateDuration = () => {
      const durationRegex = /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  
      if (!durationRegex.test(movieData.value.Duration)) {
        errorMovie.value = 'Please enter a valid duration in the format HH:MM.';
        return false;
      }
  
      return true;
    };
  
    const validateImage = () => {
      if (!movieData.value.ImageURL) {
        errorMovie.value = 'Please upload an image for the movie.';
        return false;
      }
  
      return true;
    };
  
    const validateReleaseDate = () => {
      const releaseDate = new Date(movieData.value.ReleaseDate);
  
      if (isNaN(releaseDate)) {
        errorMovie.value = 'Please enter a valid release date.';
        return false;
      }
  
      return true;
    };

    const validateDescription = () => {
        const trimmedDescription = movieData.value.Description.trim();
        if (trimmedDescription === '') {
          errorMovie.value = 'Please enter a description.';
          return false;
        }
        return true;
      };
  
    const validations = [
      validateImage,
      validateTitle,
      validateDescription,
      validateRating,
      validateDuration,
      validateGenre,
      validateCast,
      validateReleaseDate,
    ];
  
    for (const validation of validations) {
      if (!validation()) {
        return false;
      }
    }
  
    return true;
  };
  

  
  export { validateMovie };