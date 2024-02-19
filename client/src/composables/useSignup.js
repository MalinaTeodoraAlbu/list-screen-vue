import { ref } from 'vue';
import { projectAuth} from '../firebase/config';

const error = ref(null);

const signup = async (email, password, displayName) => {
  error.value = null

  try {
    const res = await projectAuth.createUserWithEmailAndPassword(email, password)
    if (!res) {
      throw new Error('Could not complete signup')
    }

    await res.user.updateProfile({ displayName })
    const token = await projectAuth.currentUser.getIdToken();
    const newUser = {
      userId: res.user.uid,
      displayName: displayName,
    };

    const response = await fetch('http://localhost:4000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUser),
    });
    console.log(response)
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