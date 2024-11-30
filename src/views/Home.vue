<!-- src/views/Home.vue -->
<template>
  <div>
    <h2>Home</h2>
    <DeviceList />
  </div>
</template>

<script>
import DeviceList from "../components/DeviceList.vue";

export default {
  components: {
    DeviceList,
  },
};
</script>

<style scoped>
.device {
  background-color: #007acc;
  border-radius: 10px;
}


h2 {
  text-align: center;
  color: #007acc;
  font-size: 32px;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
