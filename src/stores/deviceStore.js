import { defineStore } from "pinia";

export const useDeviceStore = defineStore("deviceStore", {
  state: () => ({
    devices: [
      {
        id: 1,
        name: "Factory's Smart Sensor",
        status: "online",
        tasks: [
          {
            name: "Collect-temperature",
            tasktype: "Collect-data",
            status: "in-progress",
            startDate: "2024-11-30T10:27",
            endDate: "2024-11-30T13:27",
            description: "Collect temperature data from the device at regular intervals"
          },
          {
            name: "Collect-light",
            tasktype: "Collect-data",
            status: "in-progress",
            startDate: "2024-11-30T10:27",
            endDate: "2024-11-30T13:27",
            description: "Collect light data from the device at regular intervals"
          },
          {
            name: "Collect-co2",
            tasktype: "Collect-data",
            status: "in-progress",
            startDate: "2024-11-30T10:27",
            endDate: "2024-11-30T13:27",
            description: "Collect co2 data from the device at regular intervals"
          },
        ]
      },
      { id: 2, name: "Camera Module", status: "offline", tasks: [] },
      { id: 3, name: "Light Controller", status: "online", tasks: [] },
    ],
    logs: [], // 日志记录
  }),
  actions: {
    addDevice(deviceName) {
      const newDevice = {
        id: this.devices.length > 0 ? this.devices[this.devices.length - 1].id + 1 : 1,
        name: deviceName,
        status: "online",
        tasks: [],
      };
      this.devices.push(newDevice);
    },
    removeDevice(deviceId) {
      const index = this.devices.findIndex((device) => device.id === deviceId);
      if (index !== -1) {
        this.devices.splice(index, 1);
        return true;
      }
      return false;
    },
    // 为设备添加任务
    addTask(deviceId, task) {
      const device = this.devices.find((d) => d.id === deviceId);
      if (device) {
        device.tasks.push(task);
      }
    },
    // 删除任务
    removeTask(deviceId, taskIndex) {
      const device = this.devices.find((d) => d.id === deviceId);
      if (device && device.tasks[taskIndex]) {
        device.tasks.splice(taskIndex, 1);
        return true;
      }
      return false;
    },
    // 分配任务
    assignTask(deviceId, task) {
      const device = this.devices.find((d) => d.id === deviceId);
      if (device) {
        device.tasks.push(task); // 将任务添加到设备的任务列表
      } else {
        console.warn(`Device with ID ${deviceId} not found.`);
      }
    },
    addLog(log) {
      this.logs.push(log);
    },
  },
});
