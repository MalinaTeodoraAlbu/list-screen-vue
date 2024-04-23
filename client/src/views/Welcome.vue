<template>
 <div class="welcome container">
  <div v-if="showLogin">
    <h2>Login</h2>
    <LoginForm @login="enterMovies"/>
    <p>Not account yet? <span @click="showLogin = false">Signup</span> instead</p>
  </div>
  <div v-else>
    <h2>Sign up</h2>
    <SignupForm  @signup="enterMovies"/>
    <p>Already registered? <span @click="showLogin = true">Login</span> instead</p>
  </div>

 </div>
</template>

<script>
import { ref } from 'vue';
import LoginForm from '../components/LoginForm.vue';
import SignupForm from '../components/SignupForm.vue';
import { useRoute, useRouter } from 'vue-router';


export default {
  components: {
    SignupForm, LoginForm
  },
  setup() {
    const showLogin = ref(true)
    const router = useRouter()

    const enterMovies = () => {
      router.push({name: 'Movies'})
    }

    return {showLogin, enterMovies}
  }
}
</script>

<style>
  .welcome {
    text-align: center;
    padding: 20px 0;
  }
  .welcome form {
    width: 100%;
    margin: 20px auto;
  }

  .welcome input::placeholder {
    padding: 5px;
    color: white;
  }

  .welcome input {
    width: 100%;
    padding: 10px;
    border-radius: 20px;
    border: 2px solid #ffffff;
    outline: none;
    color: #ffffff;
    margin: 10px auto;
    background: none;
  }

  .welcome span{
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    color: rgb(245, 69, 69);
  }
  .welcome button {
    margin: 20px auto;
  }


  @media screen and (max-width: 500px){
    .welcome input {
    width: 80%;
  }
  }

  .welcome > div {
    max-width: 300px;
  }
</style>