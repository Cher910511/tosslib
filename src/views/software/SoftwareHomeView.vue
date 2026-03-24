<template>
  <div class="soft-home">
    <h1 class="h1">首页</h1>
    <p class="lead">可信开源代码库 · 管理后台（浅色主题）</p>
    <RouterLink class="link" :to="{ name: 'software-detail' }">进入软件库示例：软件详情 →</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.soft-home {
  max-width: 720px;
}
.h1 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
}
.lead {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
}
.link {
  color: #da203e;
  font-weight: 600;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
