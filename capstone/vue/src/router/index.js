import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'
import Register from '../views/Register.vue'
import store from '../store/index'
import MTGView from '../views/MTGView.vue'
import PokemonTCGView from '../views/PokemonTCGView.vue'
import DisplayCard from '../views/DisplayCard.vue'
import PokemonTest from '../views/PokemonTest.vue'

Vue.use(Router)

/**
 * The Vue Router is used to "direct" the browser to render a specific view component
 * inside of App.vue depending on the URL.
 *
 * It also is used to detect whether or not a route requires the user to have first authenticated.
 * If the user has not yet authenticated (and needs to) they are redirected to /login
 * If they have (or don't need to) they're allowed to go about their way.
 */

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/mtg-view",
      name: "mtg-view",
      component: MTGView,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/pokemon-tcg-view",
      name: "pokemon-tcg-view",
      component: PokemonTCGView,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/card-test",
      name: "card-test",
      component: DisplayCard,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: "/card-test-pokemon",
      name: "card-test-pokemon",
      component: PokemonTest,
      meta: {
        requiresAuth: false
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // Determine if the route requires Authentication
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);

  // If it does and they are not logged in, send the user to "/login"
  if (requiresAuth && store.state.token === '') {
    next("/login");
  } else {
    // Else let them go to their next destination
    next();
  }
});

export default router;
