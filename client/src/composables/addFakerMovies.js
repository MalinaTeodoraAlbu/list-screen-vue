import useToken from './useToken';

const { token, getToken } = useToken();
getToken();

const addFakerMovies = async () => {
  try {
    const response = await fetch('http://localhost:4000/add-fake-movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to add movie');
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error adding movie:', error);
  }
};

export { addFakerMovies };
