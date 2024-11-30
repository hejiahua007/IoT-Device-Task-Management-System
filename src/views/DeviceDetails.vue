<template>
  <div class="device-details-container">
  <div class="device-info">
    <p><strong>Device Details</strong></p>
    <p><strong>Device Name:</strong> {{ device.name }}</p>
    <p><strong>Status:</strong> {{ device.status }}</p>
    <p><strong>Tasks:</strong> {{ device.tasks.length }} tasks</p>
  </div>

    <!-- 控制表单显示的按钮 -->
  <div class="button-group">
    <button @click="toggleTaskForm" class="toggle-form-btn">
      {{ isTaskFormVisible ? "Hide Task Form" : "Show Task Form" }}
    </button>
  </div>

    <!-- 任务提交表单 -->
    <TaskForm
      v-if="isTaskFormVisible"
      :deviceId="deviceId"
      @taskSubmitted="handleTaskSubmitted"
    />

    <!-- 任务列表 -->
    <div v-if="device.tasks.length" class="task-list:">
      <h3>Task List</h3>
      <ul>
        <li v-for="(task, index) in device.tasks" :key="index" class="task-item">
          <p><strong>Task Name:</strong> {{ task.name }}</p>
          <p><strong>Task Type:</strong> {{ task.tasktype }}</p>
          <p><strong>Status:</strong> <span :class="statusClass(task.status)">{{ task.status }}</span></p>
          <p><strong>Start Time:</strong> {{ task.startTime }}</p>
          <p><strong>End Time:</strong> {{ task.endTime }}</p>
          <p><strong>Description:</strong> {{ task.description }}</p>
          <button @click="toggleTaskStatus(index)">Next Status</button>
        </li>
      </ul>
    </div>

    <div v-else class="no-tasks">
      <p>No tasks assigned to this device.</p>
    </div>
  </div>
</template>

<script>
import { useDeviceStore } from "../stores/deviceStore";
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import TaskForm from "../components/TaskForm.vue";
import mqtt from "../../node_modules/mqtt";

export default {
  name: "DeviceDetails",
  components: {
    TaskForm,
  },
  setup() {
    const route = useRoute();
    const deviceStore = useDeviceStore();
    const deviceId = parseInt(route.params.id);
    const device = computed(() =>
      deviceStore.devices.find((d) => d.id === deviceId)
    );

    // 控制任务表单显示
    const isTaskFormVisible = ref(false);
    const toggleTaskForm = () => {
      isTaskFormVisible.value = !isTaskFormVisible.value;
    };

    const handleTaskSubmitted = (task) => {
      // 将任务分配给设备
      deviceStore.assignTask(deviceId, task);

      // 获取新任务的索引
      const newTaskIndex = device.value.tasks.findIndex((t) => t.name === task.name);

      // 启动任务定时器
      if (newTaskIndex !== -1) {
        startTask(task.name, newTaskIndex);
      } else {
        console.warn("Failed to find the newly added task.");
      }

      alert("Task successfully assigned and started!");
    };


    // MQTT 客户端
    const mqttClient = ref(null);
    const taskTimers = ref({}); // 用于存储任务的定时器

    // 状态样式类
    const statusClass = (status) => {
      switch (status) {
        case "in-progress":
          return "status-in-progress";
        case "stopped":
          return "status-stopped";
        case "failed":
          return "status-failed";
        default:
          return "";
      }
    };

    const toggleTaskStatus = (taskIndex) => {
      const task = device.value.tasks[taskIndex];

      if (task.status === "in-progress") {
        task.status = "stopped";
        logAction(task.name, "stopped");
        stopTask(task.name);
      } else if (task.status === "stopped") {
        task.status = "failed";
        logAction(task.name, "failed");
        sendAlert(task.name);
      } else if (task.status === "failed") {
        task.status = "in-progress";
        logAction(task.name, "in-progress");
        startTask(task.name, taskIndex);
      }
    };



    // 启动任务定时器
    const startTask = (taskName, taskIndex) => {
      if (taskTimers.value[taskName]) return; // 防止重复启动

      const task = device.value.tasks[taskIndex];
      console.log(`Starting data collection for task: ${taskName}`);
      taskTimers.value[taskName] = setInterval(() => {
        const data = {
          deviceId,
          taskName: task.name,
          type: task.tasktype,
          timestamp: new Date().toISOString(),
          description: task.description,
          value: Math.random() * 100, // 模拟采集数据
        };
        mqttClient.value.publish(`device/${deviceId}/data`, JSON.stringify(data));
        console.log("Collected Data:", data);
      }, 5000);
    };

    // 停止任务定时器
    const stopTask = (taskName) => {
      if (taskTimers.value[taskName]) {
        clearInterval(taskTimers.value[taskName]); // 清理定时器
        delete taskTimers.value[taskName]; // 从任务管理中移除
        console.log(`Task "${taskName}" stopped.`);
      } else {
        console.warn(`No active timer found for task "${taskName}".`);
      }
    };


    // 发送警报
    const sendAlert = (taskName) => {
      console.warn(`Task "${taskName}" failed! Sending alert...`);
      mqttClient.value.publish(
        `device/${deviceId}/alerts`,
        JSON.stringify({
          deviceId,
          taskName,
          timestamp: new Date().toISOString(),
          alert: "Task failed. Immediate attention required!",
        })
      );
    };
    // 初始化 MQTT 连接
    const initializeMqtt = () => {
      mqttClient.value = mqtt.connect("ws://localhost:8083/mqtt");
      mqttClient.value.on("connect", () => {
        console.log("MQTT connected");
        mqttClient.value.subscribe(`device/${deviceId}/data`);
      });
      mqttClient.value.on("error", (error) => {
        console.error("MQTT error:", error);
      });
    };

    // 生命周期钩子
    onMounted(() => {
      initializeMqtt();

      // 自动启动 `in-progress` 的任务
      device.value.tasks.forEach((task, index) => {
        if (task.status === "in-progress") startTask(task.name, index);
      });
    });

    onBeforeUnmount(() => {
      // 停止所有任务
      Object.keys(taskTimers.value).forEach(stopTask);
      mqttClient.value.end();
    });

    // 记录操作日志
    const logAction = (taskName, status) => {
      const log = {
        timestamp: new Date().toISOString(),
        deviceName: device.value.name,
        taskName,
        status,
      };
      deviceStore.addLog(log);
      console.log("Log recorded:", log);
    };

    return {
      device,
      deviceId,
      isTaskFormVisible,
      toggleTaskForm,
      toggleTaskStatus,
      statusClass,
      handleTaskSubmitted,
      logAction,
    };
  },
};
</script>



<style scoped>
.device-details-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.device-info{
  text-align: center;
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.device-info p {
  text-align: center; /* 居中对齐 */
  margin: 10px 0;
  font-size: 16px;
  color: #333;
}
.button-group {
  display: flex; /* 横向排列 */
  justify-content: center; /* 居中对齐 */
  gap: 20px; /* 按钮间隔 */
  margin-top: 20px;
}
.toggle-form-btn {
  width: 500px;
  height: 40px;
  padding: 10px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 15px;
  margin-bottom: 10px;
}

.toggle-form-btn:hover {
  background-color: #005f99;
  transform: scale(1.05); /* 放大效果 */
}

.task-form {
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-form input,
.task-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.task-form input:focus,
.task-form textarea:focus {
  border-color: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.task-form button {
  align-self: flex-end;
  padding: 10px 20px;
  font-size: 16px;
  margin: 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.task-form button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.task-list ul {
  list-style: none;
  padding: 0;
}

.task-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-item button {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.task-item button:hover {
  background-color: #005f99;
}

.status-in-progress {
  color: green;
  font-weight: bold;
}

.status-stopped {
  color: orange;
  font-weight: bold;
}

.status-failed {
  color: red;
  font-weight: bold;
}

.no-tasks {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  color: #888;
}
</style>