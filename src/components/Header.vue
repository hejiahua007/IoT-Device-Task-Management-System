<template>
  <header class="header">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/logs">Logs</router-link>
    </nav>
  </header>
</template>

<style>
.header {
  background-color: #007acc;
  color: white;
  padding: 10px;
}

nav {
  display: flex; /* 启用 flexbox 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

nav a {
  margin-right: 30px; /* 为每个链接设置右间距 */
  color: white;
  text-decoration: none;
}

nav a.router-link-active {
  font-weight: bold; /* 激活链接加粗 */
}
</style>
