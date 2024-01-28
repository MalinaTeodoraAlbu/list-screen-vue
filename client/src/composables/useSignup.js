import { ref } from 'vue';
import { projectAuth ,projectFirestore} from '../firebase/config';

const error = ref(null);

const signup = async (email, password, displayName) => {
  error.value = null

  try {
    const res = await projectAuth.createUserWithEmailAndPassword(email, password)
    if (!res) {
      throw new Error('Could not complete signup')
    }

    await res.user.updateProfile({ displayName })
    const userMoviesRef = projectFirestore.collection('users').doc(res.user.uid);
    await userMoviesRef.set({
      movies: [],
    });

    error.value = null;
    return res
  }
  catch(err) {
    console.log(err.message)
    error.value = err.message;
  }
}

const useSignup = () => {
  return { error, signup }
}

export default useSignup