import { ElMessage } from "element-plus";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { githubConfig } from "~/store";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "layout",
    component: () => import("~/view/Layout.vue"),
    children: [
      {
        path: "/home",
        name: "home",
        component: () => import("~/view/Home.vue"),
      },
      {
        path: "/general",
        name: "general",
        component: () => import("~/view/General.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (!unref(githubConfig).token && to.name !== "general") {
    next({ name: "general" });
    ElMessage.warning("请先登录");
  } else {
    next();
  }
});

export { router };
