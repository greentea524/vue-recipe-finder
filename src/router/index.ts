import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

// Must match `base` in vite.config.ts. Without it the router builds in-app
// URLs against the domain root while the app is served from a sub-path.
const BASE = "/vue-recipe-finder/";

export const router = createRouter({
  history: createWebHistory(BASE),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/recipe/:id",
      name: "recipe",
      component: () => import("../views/RecipeView.vue"),
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 };
  },
});
