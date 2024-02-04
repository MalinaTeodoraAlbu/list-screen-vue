import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import Movies from '../views/Movies.vue'
import MyList from '../views/MyList.vue'
import TopMovies from '../views/TopMovies.vue'
import ViewDetails from '../views/ViewDetails.vue'
import ManageMovies from '../views/admin/ManageMovies.vue'
import AddMovie from '../components/admin/AddMovie.vue'
import EditMovie from '../components/admin/EditMovie.vue'
import useToken from '../composables/useToken'
import getUser from '@/composables/getUser';
import verifyAndCheckAdmin from '@/composables/verifyAndCheckAdmin'


const requireAuth = async (to, from, next) => {
  const { token, getToken } = useToken();
  const { user } = getUser();

  try {
    await getToken(token);
    const isAdmin = await verifyAndCheckAdmin(token.value);
    if (isAdmin) {
      if (to.name === 'ManageMovies' || to.name === 'AddMovie' || to.name === 'EditMovie') {
        next();
      } else {
        next({ name: 'Movies' });
      }
    } else {
      if (token.value) {
        if (to.name === 'MyList') {
          next();
        } else {
          next({ name: 'Movies' });
        }
      } else {
        next({ name: 'Welcome' });
      }
    }
  } catch (error) {
    console.error('Error checking custom claim:', error);
    next({ name: 'Error' });
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
    path: '/view-movie/:id',
    name: 'ViewMovie',
    component: ViewDetails,
    props: true
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
