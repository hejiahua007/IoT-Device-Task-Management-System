import { defineStore } from "pinia";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
  }),
  actions: {
    addTask(task) {
      this.tasks.push(task);
    },
    updateTaskStatus(taskId, status) {
      const task = this.tasks.find((task) => task.id === taskId);
      if (task) {
        task.status = status;
      }
    },
  },
});