<template>
  <div class="admin-shell">
    <aside class="admin-aside">
      <div class="admin-brand">
        <svg data-v-ffa6468c="" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><path fill="#DA203E" d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-3.567 0-6.86-1.168-9.52-3.14L9 13.643H4.775L2.96 25.273A15.93 15.93 0 0 1 0 16c0-1.381.175-2.722.504-4h11.56l-.476 3h4.05l.477-3h6.465l-.9 9h-6.994l.635-4h-4.05l-.72 4.53A3 3 0 0 0 13.514 25h9.071a3 3 0 0 0 2.943-2.418l.042-.283 1.1-11A3 3 0 0 0 23.685 8H2.142C4.908 3.218 10.078 0 16 0"></path></svg>
        <span class="admin-brand-text">可信开源代码库</span>
      </div>
      <nav class="admin-nav">
        <RouterLink class="admin-nav-item" to="/software/home" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▦</span>
          首页
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/detail" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">⟨⟩</span>
          软件库
        </RouterLink>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">◇</span>
          组件库
        </a>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">▣</span>
          软件管理
        </a>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">⌘</span>
          组织管理
        </a>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">▤</span>
          需求反馈
        </a>
        <a
          class="admin-nav-item admin-nav-external"
          :href="dataScreenHomeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="nav-ico" aria-hidden="true">▶</span>
          数据大屏
        </a>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <nav class="admin-breadcrumb" aria-label="面包屑">
          <template v-if="route.name === 'software-home'">
            <span class="current">首页</span>
          </template>
          <template v-else-if="route.name === 'software-detail'">
            <RouterLink to="/software/home">首页</RouterLink>
            <span class="sep">/</span>
            <RouterLink to="/software/detail">软件库</RouterLink>
            <span class="sep">/</span>
            <span class="current">软件详情</span>
          </template>
          <template v-else>
            <RouterLink to="/software/home">首页</RouterLink>
          </template>
        </nav>
        <div class="admin-header-center">
          <div class="admin-search">
            <select class="admin-search-type" aria-label="搜索类型">
              <option>软件</option>
              <option>软件</option>
            </select>
            <input type="search" class="admin-search-input" placeholder="搜索" />
            <button type="button" class="admin-search-btn" aria-label="搜索"></button>
          </div>
        </div>
        <div class="admin-user">
          <div class="admin-avatar" aria-hidden="true">会</div>
          <div class="admin-user-meta">
            <span class="admin-user-name">会饮篇</span>
            <span class="admin-user-mail">xlue019@gmail.com</span>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/** 深色态势总览（/dash），新标签打开；含 GitHub Pages base */
const dataScreenHomeUrl = computed(() => {
  const href = router.resolve({ name: 'home' }).href
  return new URL(href, window.location.origin).href
})
</script>

<style scoped>
.admin-shell {
  --admin-primary: #da203e;
  --admin-primary-soft: rgba(218, 32, 62, 0.08);
  --admin-bg: #f4f5f7;
  --admin-card: #ffffff;
  --admin-text: #1a1a1a;
  --admin-muted: #6b7280;
  --admin-border: #e5e7eb;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

.admin-aside {
  width: 220px;
  flex-shrink: 0;
  background: var(--admin-card);
  border-right: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  padding: 20px 0 24px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--admin-border);
  margin-bottom: 8px;
}

.admin-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #da203e, #b81830);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.35);
}

.admin-brand-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--admin-text);
  line-height: 1.3;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
}
.admin-nav-item:hover:not(.is-disabled) {
  background: #f3f4f6;
}
.admin-nav-item.is-active {
  background: var(--admin-primary-soft);
  color: var(--admin-primary);
  font-weight: 600;
}
.admin-nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.admin-nav-external {
  color: #374151;
}
.admin-nav-external:hover {
  background: #fef2f2;
  color: var(--admin-primary);
}

.nav-ico {
  width: 20px;
  text-align: center;
  font-size: 13px;
  opacity: 0.85;
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-header {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  background: var(--admin-card);
  border-bottom: 1px solid var(--admin-border);
}

.admin-breadcrumb {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--admin-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.admin-breadcrumb a {
  color: var(--admin-muted);
  text-decoration: none;
}
.admin-breadcrumb a:hover {
  color: var(--admin-primary);
}
.admin-breadcrumb .sep {
  color: #d1d5db;
  user-select: none;
}
.admin-breadcrumb .current {
  color: var(--admin-text);
  font-weight: 500;
}

.admin-header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.admin-search {
  display: flex;
  align-items: stretch;
  max-width: 480px;
  min-height: 36px;
  width: 100%;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  overflow: hidden;
  background: #fafafa;
}
.admin-search-type {
  border: none;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
}
.admin-search-input {
  flex: 1;
  border: none;
  padding: 0 14px;
  font-size: 14px;
  min-width: 0;
  background: transparent;
}
.admin-search-input:focus {
  outline: none;
}
.admin-search-btn {
  border: none;
  background: transparent;
  padding: 0 14px;
  cursor: pointer;
  color: var(--admin-muted);
  font-size: 16px;
}

.admin-user {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8b4bc, #da203e);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}
.admin-user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
.admin-user-name {
  font-size: 14px;
  font-weight: 600;
}
.admin-user-mail {
  font-size: 12px;
  color: var(--admin-muted);
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
