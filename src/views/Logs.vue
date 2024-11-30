<template>
  <div class="logs-container">
    <h1>System Logs</h1>
    <p>Review recent activities of all devices below:</p>

    <!-- 筛选控件 -->
    <div class="filters">
      <div class="filter-item">
        <label for="deviceFilter">Device:</label>
        <select id="deviceFilter" v-model="filters.deviceName">
          <option value="">All</option>
          <option v-for="device in uniqueDevices" :key="device" :value="device">
            {{ device }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label for="statusFilter">Status:</label>
        <select id="statusFilter" v-model="filters.status">
          <option value="">All</option>
          <option value="in-progress">In Progress</option>
          <option value="stopped">Stopped</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div class="filter-item">
        <label for="startDate">Start Date:</label>
        <input type="date" id="startDate" v-model="filters.startDate" />
      </div>

      <div class="filter-item">
        <label for="endDate">End Date:</label>
        <input type="date" id="endDate" v-model="filters.endDate" />
      </div>

      <div class="filter-item">
        <label for="searchFilter">Search:</label>
        <input
          id="searchFilter"
          v-model="searchQuery"
          placeholder="Search by task, device, or status"
        />
      </div>
    </div>

    <!-- 日志表格 -->
    <table class="log-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Device</th>
          <th>Task</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in paginatedLogs" :key="log.timestamp">
          <td>{{ log.timestamp }}</td>
          <td>{{ log.deviceName }}</td>
          <td>{{ log.taskName }}</td>
          <td>{{ log.status }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页控件 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script>
import { useDeviceStore } from "../stores/deviceStore";
import { computed, ref } from "vue";

export default {
  name: "Logs",
  setup() {
    const deviceStore = useDeviceStore();

    // 筛选条件
    const filters = ref({
      deviceName: "",
      status: "",
      startDate: "",
      endDate: "",
    });

    // 搜索关键词
    const searchQuery = ref("");

    // 分页设置
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // 获取去重后的设备名列表
    const uniqueDevices = computed(() => {
      return [...new Set(deviceStore.logs.map((log) => log.deviceName))];
    });

    // 过滤后的日志
    const filteredLogs = computed(() => {
      return deviceStore.logs
        .filter((log) => {
          const { deviceName, status, startDate, endDate } = filters.value;

          // 按设备名筛选
          if (deviceName && log.deviceName !== deviceName) return false;

          // 按状态筛选
          if (status && log.status !== status) return false;

          // 按时间范围筛选
          const logDate = new Date(log.timestamp).toISOString().split("T")[0];
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;

          return true;
        })
        .filter((log) => {
          // 按搜索关键词筛选
          const query = searchQuery.value.toLowerCase();
          return (
            log.deviceName.toLowerCase().includes(query) ||
            log.taskName.toLowerCase().includes(query) ||
            log.status.toLowerCase().includes(query)
          );
        });
    });

    // 计算分页数据
    const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage));
    const paginatedLogs = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredLogs.value.slice(start, end);
    });

    // 分页控制
    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    return {
      filters,
      searchQuery,
      uniqueDevices,
      filteredLogs,
      paginatedLogs,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  color: #007acc;
  font-size: 32px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.logs-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logs-container h1 {
  text-align: center;
  color: #007acc;
  font-size: 24px;
  margin-bottom: 10px;
}

.logs-container p {
  text-align: center;
  color: #555;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-item {
  flex: 1 1 calc(33% - 10px);
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #333;
}

.filter-item label {
  font-weight: bold;
}

.filter-item input,
.filter-item select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.filter-item input:focus,
.filter-item select:focus {
  border-color: #007acc;
  outline: none;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.log-table th,
.log-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.log-table th {
  background-color: #007acc;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
}

.log-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.log-table tr:hover {
  background-color: #f1f1f1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination button {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #007acc;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:disabled {
  background-color: #ddd;
  color: #888;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: #555;
  font-weight: bold;
}
</style>
