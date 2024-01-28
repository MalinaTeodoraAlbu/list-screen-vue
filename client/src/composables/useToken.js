import { projectAuth } from '../firebase/config'
import { ref } from 'vue'

const useToken = () => {
    const error = ref(null)
    const token = ref(null)

    const getToken = async () => {
      try{
        token.value = await projectAuth.currentUser.getIdToken(true)
        console.log("Token value",token.value)
      }catch(err){
        console.log(err.message)
        error.value = err.message
      }
    }
    return { getToken, token, error }
}

export default useToken;