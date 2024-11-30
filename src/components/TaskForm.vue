<template>
  <div class="assign-task-container">
    <h3>Create a New Task</h3>
    <form @submit.prevent="submitTask" class="task-form">
      <div class="form-group">
        <label for="taskName">Task Name:</label>
        <input id="taskName" v-model="task.name" placeholder="Enter task name" />
      </div>

      <div class="form-group">
        <label for="taskType">Task Type</label>
        <input id="taskType" v-model="task.tasktype" placeholder="Enter type name" />
      </div>

      <div class="form-group">
        <label for="startTime">Start Time:</label>
        <input id="startTime" v-model="task.startTime" type="datetime-local" />
      </div>

      <div class="form-group">
        <label for="endTime">End Time:</label>
        <input id="endTime" v-model="task.endTime" type="datetime-local" />
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" v-model="task.description" placeholder="Enter task description"></textarea>
      </div>

      <button type="submit" class="submit-btn">Submit Task</button>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "TaskForm",
  props: {
    deviceId: {
      type: Number,
      required: true,
    },
  },
  emits: ["taskSubmitted"],
  setup(props, { emit }) {
    // 任务数据
    const task = ref({
      name: "",
      tasktype: "",
      startTime: "",
      endTime: "",
      description: "",
      status: "in-progress",
    });

    // 提交任务
    const submitTask = () => {
      if (!task.value.name || !task.value.tasktype || !task.value.startTime || !task.value.endTime || !task.value.description) {
        alert("Please fill out all fields.");
        return;
      }

      // 触发事件，将任务传递给父组件
      emit("taskSubmitted", { ...task.value });

      // 清空表单
      task.value = {
        name: "",
        tasktype: "",
        startTime: "",
        endTime: "",
        description: "",
        status: "in-progress",
      };
    };

    return {
      task,
      submitTask,
    };
  },
};
</script>

<style scoped>
.assign-task-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input,
textarea,
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

button.submit-btn {
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button.submit-btn:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

button.submit-btn:active {
  background-color: #3e8e41;
  transform: scale(0.95);
}
</style>
