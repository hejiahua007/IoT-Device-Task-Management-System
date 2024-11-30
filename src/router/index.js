import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import DeviceDetails from "../views/DeviceDetails.vue";
import Logs from "../views/Logs.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/device/:id",
    name: "DeviceDetails",
    component: DeviceDetails,
  },
  {
    path: "/logs",
    name: "Logs",
    component: Logs,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;