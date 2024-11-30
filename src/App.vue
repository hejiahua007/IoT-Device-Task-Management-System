<template>
  <div>
    <Header />
    <router-view />
  </div>
</template>

<script>
import Header from './components/Header.vue';

export default {
  components: {
    Header,
  },
};


</script>

<style> 
div {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
}
</style>

