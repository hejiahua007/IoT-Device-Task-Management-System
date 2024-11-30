<template>
  <div class="device">
    <br>
    <h2>Device List</h2>
    <!-- 添加设备表单 -->
    <div class="add-device-form">
      <input v-model="newDeviceName" placeholder="Enter new device name" @keypress.enter="addDevice" />
      <button @click="addDevice">Add Device</button>
    </div>

    <ul class="device-list">
      <li v-for="device in devices" :key="device.id" :class="{
        online: device.status === 'online',
        offline: device.status === 'offline',
      }">
        <!-- 设备信息 -->
        <div @click="handleClick(device.id)" class="device-summary">
          <p><strong>Name:</strong> {{ device.name }}</p>
            <!-- 编辑模式 -->
            <div v-if="editingDeviceId === device.id" class="device-edit">
              <p>Renamed By:</p>
              <input v-model="editedDeviceName" placeholder="Enter new device name"
                @keypress.enter="saveDeviceName(device.id)" @blur="saveDeviceName(device.id)" />
            </div>
          <p><strong>Status:</strong> <span class="status-label">{{ device.status }}</span></p>
          <p><strong>Tasks:</strong> {{ device.tasks.length }}</p>
        </div>

        <!-- 设备详情 -->
        <div v-if="expandedDeviceId === device.id" class="device-details">
          <h3>Device Details:</h3>
          <p><strong>Device ID:</strong> {{ device.id }}</p>
          <p><strong>Tasks:</strong></p>
          <ul>
            <li v-for="(task, index) in device.tasks" :key="index">
              <p><strong>Task Name:</strong> {{ task.name }}</p>
              <p><strong>Start Time:</strong> {{ task.startTime }}</p>
              <p><strong>End Time:</strong> {{ task.endTime }}</p>
              <p><strong>Description:</strong> {{ task.description }}</p>
              <p><strong>Status:</strong> <span class="task-status" :class="task.status">{{ task.status }}</span></p>
            </li>
          </ul>
          <div v-if="device.tasks.length === 0" class="no-tasks">
            <p>No tasks assigned to this device.</p>
          </div>
        </div>

        <!-- 设备状态切换按钮 -->
        <div class="buttons-container">
          <button @click="toggleDeviceStatus(device.id)" class="status-btn">
            {{ device.status === 'online' ? 'Set as Offline' : 'Set as Online' }}
          </button>

          <router-link :to="'/device/' + device.id">
            <button class="detail-btn">Details</button>
          </router-link>

          <button class="delete-btn" @click="deleteDevice(device.id)">
            Delete
          </button>
        </div>

      </li>
    </ul>



    <!-- 空状态提示 -->
    <div v-if="devices.length === 0" class="no-devices">
      <p>No devices found. Add a new device to get started!</p>
    </div>
  </div>
</template>

<script>
import { useDeviceStore } from "../stores/deviceStore";
import { ref } from "vue";

export default {
  setup() {
    const deviceStore = useDeviceStore();
    const newDeviceName = ref("");
    const expandedDeviceId = ref(null);
    const editingDeviceId = ref(null);
    const editedDeviceName = ref("");
    let clickTimer = null;

    // 切换设备详情显示状态
    const toggleDeviceDetails = (deviceId) => {
      expandedDeviceId.value = expandedDeviceId.value === deviceId ? null : deviceId;
    };

    const handleClick = (deviceId) => {
      if (clickTimer) {
        // 如果定时器已经存在，说明是双击
        clearTimeout(clickTimer); // 清除单击定时器
        clickTimer = null; // 清空计时器引用

        // 进入编辑模式
        const device = deviceStore.devices.find((d) => d.id === deviceId);
        if (device) {
          editingDeviceId.value = deviceId; // 设置当前编辑的设备 ID
          editedDeviceName.value = device.name; // 初始化编辑名称
        }
      } else {
        // 如果没有定时器，则设置单击定时器
        clickTimer = setTimeout(() => {
          toggleDeviceDetails(deviceId); // 执行单击操作
          clickTimer = null; // 清空计时器引用
        }, 150); // 调整为150毫秒
      }
    };

    // 保存设备名称
    const saveDeviceName = (deviceId) => {
      const device = deviceStore.devices.find((d) => d.id === deviceId);
      if (device) {
        device.name = editedDeviceName.value.trim() || device.name; // 保留原名称以防为空
      }
      editingDeviceId.value = null; // 退出编辑模式
    };

    const addDevice = () => {
      if (newDeviceName.value.trim() === "") {
        alert("Device name cannot be empty!");
        return;
      }
      console.log("Adding device:", newDeviceName.value);
      deviceStore.addDevice(newDeviceName.value.trim());
      newDeviceName.value = ""; // 清空输入框
    };

    // 切换设备状态
    const toggleDeviceStatus = (deviceId) => {
      const device = deviceStore.devices.find(d => d.id === deviceId);
      if (device) {
        // 切换设备状态，'online' <=> 'offline'
        device.status = device.status === 'online' ? 'offline' : 'online';
      }
    };

    const deleteDevice = (deviceId) => {
      const isDeleted = deviceStore.removeDevice(deviceId);
      if (!isDeleted) {
        alert(`Device ID ${deviceId} not found!`);
      } else {
        alert(`Device ID ${deviceId} has been deleted.`);
      }
    };

    return {
      devices: deviceStore.devices, // 响应式绑定
      newDeviceName,
      expandedDeviceId,
      editingDeviceId,
      editedDeviceName,
      handleClick,
      toggleDeviceDetails,
      saveDeviceName,
      toggleDeviceStatus,
      deleteDevice,
      addDevice,
    };
  },
};
</script>

<style scoped>
.device {
  background-color: #007acc;
  border-radius: 10px;
}

h2{
  text-align: center;
  color: #ffffff;
  margin-top: 0px;
  margin-bottom: 20px;
}

.device-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 20px;
}

.device-list li {
  margin: 10px;
  padding: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.device-list li:hover {
  transform: scale(1.05);
}

.device-summary {
  padding: 10px;
  cursor: pointer;
}

.device-summary:hover {
  background-color: #f1f1f1;
  border-radius: 5px;
}

.device-details {
  padding: 15px;
  border: 1px solid #ddd;
  margin-top: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.device-details h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.device-edit input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

/* 按钮容器 */
.buttons-container {
  display: flex;
  justify-content: space-between;
  /* 等分间距 */
  gap: 10px;
  /* 为按钮之间增加间隔 */
}

/* 按钮样式 */
.status-btn,
.detail-btn,
.delete-btn {
  flex: 1;
  width: 180px;
  /* 使按钮等宽 */
  padding: 8px 12px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.status-btn {
  background-color: #007acc;
}

.status-btn:hover {
  background-color: #005f99;
}

.detail-btn {
  background-color: #007acc;
}

.delete-btn {
  background-color: #f44336;
}

.detail-btn:hover {
  background-color: #005f99;
}

.delete-btn:hover {
  opacity: 0.9;
}


.add-device-form {
  display: flex;
  gap: 10px;
  margin: 20px;
}

.add-device-form input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  flex: 1;
}

.add-device-form button {
  padding: 10px 15px;
  background-color: #ffffff;
  color: black;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.add-device-form button:hover {
  background-color: #888;
}

.no-devices {
  margin-top: 20px;
  font-style: italic;
  color: #888;
}

.status-label {
  font-weight: bold;
  color: #007acc;
}

.task-status {
  font-weight: bold;
  color: #007acc;
}

.task-status.in-progress {
  color: #ff9800;
}

.task-status.completed {
  color: #4caf50;
}

.no-tasks {
  font-style: italic;
  color: #888;
}
</style>
