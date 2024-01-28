import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import Movies from '../views/Movies.vue'
import MyList from '../views/MyList.vue'
import TopMovies from '../views/TopMovies.vue'
import { projectAuth } from '@/firebase/config'
import NewMovies from '../views/NewMovies.vue'
import ManageMovies from '../views/admin/ManageMovies.vue'
import AddMovie from '../components/admin/AddMovie.vue'
import EditMovie from '../components/admin/EditMovie.vue'
import useToken from '../composables/useToken'
import getUser from '@/composables/getUser';


const requireAuth = async (to, from, next) => {
  console.log('Before navigation guard checks');

  const { token, getToken } = useToken();
  const { user } = getUser();

  try {
    await getToken(token);
    console.log('Token retrieved:', token.value);
    const isAdmin = await verifyAndCheckAdmin(token.value);
    console.log('Is Admin:', isAdmin);

    if (isAdmin) {
      if (to.name === 'ManageMovies' || to.name === 'AddMovie' || to.name === 'EditMovie') {
        next();
      } else {
        next({ name: 'Movies' });
      }
    } else {
      if (to.name === 'Movies' || to.name === 'MyList') {
        next();
      } else {
        next({ name: 'Movies' });
      }
    }
  } catch (error) {
    console.error('Error checking custom claim:', error);
    next({ name: 'Error' });
  }

  console.log('After navigation guard checks');
};


const verifyAndCheckAdmin = async (idToken) => {
  try {
    const response = await fetch('http://localhost:4000/verify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`, 
      },
    });

    console.log(response);

    if (response.ok) {
      const result = await response.json();
      return result.isAdmin;
    } else {
      console.error('Error verifying admin status:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};




const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/movies',
    name: 'Movies',
    component: Movies
  },
  {
    path: '/my-list',
    name: 'MyList',
    component: MyList,
    beforeEnter: requireAuth
  },
  {
    path: '/top-movies',
    name: 'TopMovies',
    component: TopMovies
  }
  ,
  {
    path: '/new-movies',
    name: 'NewMovies',
    component: NewMovies
  }
  ,
  {
    path: '/manageMovies',
    name: 'ManageMovies',
    component: ManageMovies,
    beforeEnter: requireAuth
  }
  ,
  {
    path: '/add-movie',
    name: 'AddMovie',
    component: AddMovie,
    beforeEnter: requireAuth
  },
  {
    path: '/edit-movie/:id',
    name: 'EditMovie',
    component: EditMovie,
    beforeEnter: requireAuth,
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
