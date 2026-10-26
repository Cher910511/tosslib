<template>
  <div class="sbom-tool">
    <!-- 内嵌侧边栏：工具集 > 软件物料清单生成 -->
    <aside class="sbom-aside">
      <div class="sbom-aside-hd">
        <RouterLink class="sbom-back" :to="{ name: 'toolset' }">← 工具集</RouterLink>
        <h2 class="sbom-aside-title">软件物料清单</h2>
        <p class="sbom-aside-sub">SBOM 生成与分析</p>
      </div>
      <nav class="sbom-nav">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.name"
          class="sbom-nav-item"
          :to="{ name: item.name }"
          active-class="is-active"
        >
          <span class="sbom-nav-ico" v-html="item.icon" />
          <span class="sbom-nav-label">
            {{ item.label }}
            <small>{{ item.desc }}</small>
          </span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 子页面内容 -->
    <div class="sbom-body">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
const NAV_ITEMS = [
  {
    name: 'sbom-generate',
    label: 'SBOM 生成',
    desc: '上传源码包，选择格式',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  },
  {
    name: 'sbom-analysis',
    label: '详情分析',
    desc: '历史记录与清单查看',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  },
]
</script>

<style scoped>
.sbom-tool {
  display: grid;
  grid-template-columns: 208px 1fr;
  gap: 20px;
  align-items: start;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 内嵌侧边栏 */
.sbom-aside {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 108px);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.sbom-aside-hd {
  padding: 16px 16px 14px;
  border-bottom: 1px solid #f0f1f3;
  background: #fafafa;
}
.sbom-back {
  display: inline-block;
  font-size: 11px;
  color: #9ca3af;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color .2s;
}
.sbom-back:hover { color: #da203e; }
.sbom-aside-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 3px;
  letter-spacing: -.01em;
}
.sbom-aside-sub {
  font-size: 11px;
  color: #b0b5bd;
  margin: 0;
}
.sbom-nav { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 2px; }
.sbom-nav-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 7px;
  text-decoration: none;
  color: #4b5563;
  transition: background .18s, color .18s;
}
.sbom-nav-item:hover { background: #f7f7f8; color: #111827; }
.sbom-nav-item.is-active { background: rgba(218,32,62,0.07); color: #da203e; }
.sbom-nav-ico { display: flex; flex-shrink: 0; margin-top: 2px; }
.sbom-nav-label { display: flex; flex-direction: column; gap: 2px; font-size: 13px; font-weight: 600; line-height: 1.3; }
.sbom-nav-label small { font-size: 10px; font-weight: 400; color: #b0b5bd; letter-spacing: .01em; }
.sbom-nav-item.is-active .sbom-nav-label small { color: rgba(218,32,62,0.55); }

.sbom-body { min-width: 0; }

@media (max-width: 900px) {
  .sbom-tool { grid-template-columns: 1fr; }
  .sbom-aside { position: static; }
  .sbom-nav { flex-direction: row; }
  .sbom-nav-item { flex: 1; }
}
</style>
