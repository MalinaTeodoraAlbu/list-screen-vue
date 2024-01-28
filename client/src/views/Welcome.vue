<template>
 <div class="welcome container">
  <div v-if="showLogin">
    <h2>Login</h2>
    <LoginForm @login="enterChat"/>
    <p>Not account yet? <span @click="showLogin = false">Signup</span> instead</p>
  </div>
  <div v-else>
    <h2>Sign up</h2>
    <SignupForm  @signup="enterChat"/>
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

  const enterChat = () => {
    router.push({name: 'Movies'})
  }

  return {showLogin, enterChat}
}
}
</script>

<style>
  .welcome {
    text-align: center;
    padding: 20px 0;
  }
  .welcome form {
    width: 300px;
    margin: 20px auto;
  }
  .welcome label {
    display: block;
    margin: 20px 0 10px;
  }
  .welcome input {
    width: 100%;
    padding: 10px 5px;
    border-radius: 20px;
    border: 1px solid #908383;
    outline: none;
    color: #999999;
    margin: 10px auto;
  }

  .welcome span{
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    color:#3e6ba2 ;
  }
  .welcome button {
    margin: 20px auto;
  }

</style>