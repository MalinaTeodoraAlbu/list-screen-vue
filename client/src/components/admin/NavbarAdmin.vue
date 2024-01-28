<template>
    <div>
      <nav class="nav" >
        <div class="logo">
          <img src="../../assets/logo.png"/>
        </div>
        <div class="uil uil-bars navOpenBtn">
              <span class="material-icons">
            menu
            </span>
            </div>
        
        <ul class="nav-links">
          <div class="uil uil-times navCloseBtn"><span class="material-icons">close</span></div>
          <li><router-link class="link" to="/movies"><span :class="{ 'colored-link': $route.path === '/manageMovies' }">Manage Movies</span></router-link></li>
          <li><router-link class="link" to="/movies"><span :class="{ 'colored-link': $route.path === '/movies' }">All Movies</span></router-link></li>
          <li>
            <div v-if="user" class="user_details">
          <p>{{ user.displayName }}</p>
        </div>
          </li>
          <li>
            
        <div  v-if="user" class="logout">
          <span @click="handleLogout" class="material-icons">
  logout
  </span>
        </div>
        <div v-else class="logout">
        
          <router-link  to="/">  <span class="material-icons">
          login
          </span></router-link>
        </div>
        
          </li>
        
        </ul>
        
        <router-view></router-view>
      </nav>
    </div>
    
    </template>
    
    <script>
    import useLogout from '../../composables/useLogout'
    import getUser from '../../composables/getUser'
  
    export default {
    setup() {
      const {logout, error} = useLogout()
      const { user } = getUser()
  
      const handleLogout = async () => {
        await logout()
        if(!error.value) {
          console.log('User logged out')
        }
      }
  
      return { handleLogout, user}
    },
    mounted() {
      const nav = document.querySelector(".nav"),
    navOpenBtn = document.querySelector(".navOpenBtn"),
    navCloseBtn = document.querySelector(".navCloseBtn");
  
      navOpenBtn.addEventListener("click", () => {
        nav.classList.add("openNav");
      });
      navCloseBtn.addEventListener("click", () => {
        nav.classList.remove("openNav");
      });
  
    }
  }
    </script>
    
    <style>
    .user_details{
      color:#030637;
      width: 100px;
      padding: 10px;
      border-radius: 5px;
      background: white;
    }
    .logout{
      color: white;
    }
    .nav {
      width: 100%;
      top: 0;
      left: 0;
      width: 100%;
      padding: 15px 200px;
      background: rgba(32, 31, 31, 0.9);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }
    .nav,
    .nav .nav-links {
      display: flex;
      align-items: center;
    }
    .nav {
      justify-content: space-between;
    }
    a {
      color: #fff;
      text-decoration: none;
    }
    .nav img {
      width: 120px;
    }
    .nav .nav-links {
      column-gap: 20px;
      list-style: none;
    }
    .nav .nav-links a {
      transition: all 0.2s linear;
    }
    .nav.openSearch .nav-links a {
      opacity: 0;
      pointer-events: none;
    }
    .nav .search-icon {
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .nav .search-box {
      position: absolute;
      right: 250px;
      height: 45px;
      max-width: 555px;
      width: 100%;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s linear;
    }
    .nav.openSearch .search-box {
      opacity: 1;
      pointer-events: auto;
    }
    .search-box .search-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      left: 15px;
      color: #4a98f7;
      transform: translateY(-50%);
    }
    .search-box input {
      height: 100%;
      width: 100%;
      border: none;
      outline: none;
      border-radius: 6px;
      background-color: #fff;
      padding: 0 15px 0 45px;
    }
  
    .nav .navOpenBtn,
    .nav .navCloseBtn {
      display: none;
    }
  
    /* responsive */
    @media screen and (max-width: 1160px) {
      .nav {
        padding: 15px 100px;
      }
      .nav .search-box {
        right: 150px;
      }
    }
    @media screen and (max-width: 950px) {
      .nav {
        padding: 15px 50px;
      }
      .nav .search-box {
        right: 100px;
        max-width: 400px;
      }
    }
    @media screen and (max-width: 768px) {
      .nav .navOpenBtn,
      .nav .navCloseBtn {
        display: block;
      }
      .nav {
        padding: 15px 20px;
      }
      .nav .nav-links {
        position: fixed;
        top: 0;
        left: -100%;
        height: 100%;
        max-width: 280px;
        width: 100%;
        padding-top: 100px;
        row-gap: 30px;
        flex-direction: column;
        background-color: #11101d;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.4s ease;
        z-index: 100;
      }
      .nav.openNav .nav-links {
        left: 0;
      }
      .nav .navOpenBtn {
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      .nav .navCloseBtn {
        position: absolute;
        top: 20px;
        right: 20px;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      .nav .search-box {
        top: calc(100% + 10px);
        max-width: calc(100% - 20px);
        right: 50%;
        transform: translateX(50%);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    }
    </style>
    