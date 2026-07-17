<template>
  <div class="soft-home">
    <div class="soft-home-inner">

      <!-- ========== 标题 ========== -->
      <h1 class="soft-home-title">可信开源代码库</h1>

      <!-- ========== 搜索框 ========== -->
      <div class="soft-search-wrap">
        <div class="soft-search">
          <select v-model="searchKind" class="soft-search-type" aria-label="搜索类型">
            <option value="software">软件</option>
            <option value="component">组件</option>
          </select>
          <span class="soft-search-vsep" aria-hidden="true" />
          <div class="soft-search-mid">
            <svg
              class="soft-search-ico"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              class="soft-search-input"
              placeholder="搜索代码仓库…"
              autocomplete="off"
              @keydown.enter.prevent="submitSearch"
            />
          </div>
          <span class="soft-search-vsep" aria-hidden="true" />
          <button
            type="button"
            class="soft-search-adv"
            :aria-expanded="filterOpen"
            @click="filterOpen = !filterOpen"
          >
            高级筛选
            <span class="soft-caret" aria-hidden="true">▾</span>
          </button>
        </div>
        <div v-show="filterOpen" class="soft-filter-panel">
          <p class="soft-filter-hint">可按语言、许可证等筛选（接入接口后生效）。</p>
          <label class="soft-filter-row">
            <input v-model="filterDemo.java" type="checkbox" />
            <span>Java / JVM</span>
          </label>
          <label class="soft-filter-row">
            <input v-model="filterDemo.js" type="checkbox" />
            <span>JavaScript / TypeScript</span>
          </label>
          <label class="soft-filter-row">
            <input v-model="filterDemo.python" type="checkbox" />
            <span>Python</span>
          </label>
        </div>
      </div>

      <!-- ========== 左右分栏 ========== -->
      <div class="home-columns">

        <!-- 左栏：风险预警 · 时间线 -->
        <section class="col-left">
          <header class="section-header">
            <h2 class="section-title">
              <span class="section-title-ico" aria-hidden="true">&#9888;</span>
              风险预警
            </h2>
            <span class="section-count">{{ alerts.length }} 条预警</span>
          </header>

          <div class="alert-timeline">
            <div
              v-for="(alert, idx) in limitAlerts"
              :key="alert.id"
              class="alert-row"
              :class="{ 'alert-row--last': idx === limitAlerts.length - 1 }"
            >
              <div class="alert-timeline-left">
                <div class="alert-dot" :class="'alert-dot--' + levelClass(alert.level)" />
                <div v-if="idx !== alerts.length - 1" class="alert-line" />
              </div>

              <div class="alert-card">
                <div class="alert-card-top">
                  <div class="alert-card-left">
                    <span class="alert-type-tag">{{ alert.typeLabel }}</span>
                    <span class="alert-component">
                      <strong>{{ alert.componentName }}</strong>
                      <span class="alert-version">{{ alert.componentVersion }}</span>
                    </span>
                    <span
                      class="alert-level"
                      :class="'alert-level--' + levelClass(alert.level)"
                    >
                      {{ alert.level }}
                    </span>
                    <span class="alert-cve">{{ alert.cveId }}</span>
                    <span
                      class="alert-aff"
                      :class="alert.affiliation === '组织' ? 'alert-aff--org' : 'alert-aff--personal'"
                    >
                      {{ alert.affiliation }}
                    </span>
                  </div>
                  <span class="alert-time">{{ alert.publishTime }}</span>
                </div>
                <p class="alert-desc">{{ alert.description }}</p>
                <div class="alert-card-bottom">
                  <a class="alert-link" href="#" @click.prevent="onViewDetail(alert)">
                    查看详情 &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 右栏：软件 · 卡片网格 -->
        <section class="col-right">
          <header class="section-header">
            <h2 class="section-title">
              <span class="section-title-ico" aria-hidden="true">&#9632;</span>
              软件
            </h2>
            <span class="section-count">{{ softwareItems.length }} 个组件</span>
          </header>

          <div class="soft-grid">
            <article
              v-for="item in softwareItems"
              :key="item.id"
              class="soft-card"
            >
              <div class="soft-card-body">
                <div class="soft-card-top">
                  <span class="soft-card-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
                  </span>
                  <span class="soft-card-name">{{ item.name }}</span>
                  <span class="soft-card-version">{{ item.version }}</span>
                </div>
                <div class="soft-card-meta">
                  <div class="soft-card-row">
                    <span class="soft-card-k">编程语言</span>
                    <span
                      class="soft-card-lang"
                      :class="'soft-card-lang--' + langClass(item.language)"
                    >
                      {{ item.language }}
                    </span>
                  </div>
                  <div class="soft-card-row">
                    <span class="soft-card-k">发布日期</span>
                    <span class="soft-card-v">{{ item.released }}</span>
                  </div>
                  <div class="soft-card-row">
                    <span class="soft-card-k">开发者</span>
                    <span class="soft-card-v soft-card-dev" :title="item.developer">{{ item.developer }}</span>
                  </div>
                </div>
              </div>
              <div class="soft-card-footer">
                <router-link
                  class="soft-card-link"
                  :to="{ name: 'software-library', query: { q: item.name } }"
                >
                  查看详情 &rarr;
                </router-link>
              </div>
            </article>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { HOME_RISK_ALERTS } from '../../data/homeRiskAlerts.js'
import { HOME_SOFTWARE_CARDS } from '../../data/homeSoftwareCards.js'
import { addSearchHistory } from '../../composables/useAdminSearch.js'

const router = useRouter()
const alerts = HOME_RISK_ALERTS
const limitAlerts = alerts.slice(0, 5)
const softwareItems = HOME_SOFTWARE_CARDS

const searchKind = ref('software')
const searchQuery = ref('')
const filterOpen = ref(false)
const filterDemo = reactive({ java: false, js: false, python: false })

function levelClass(level) {
  if (level === '超危') return 'critical'
  if (level === '高危') return 'high'
  if (level === '中危') return 'medium'
  return 'low'
}

function langClass(lang) {
  const map = {
    Python: 'python',
    Go: 'go',
    JavaScript: 'js',
    TypeScript: 'ts',
    Java: 'java',
    Rust: 'rust',
    'C++': 'cpp',
    C: 'c',
  }
  return map[lang] || 'default'
}

function onViewDetail(alert) {
  router.push({ name: 'component-library', query: { q: alert.componentName } })
}

function submitSearch() {
  const q = searchQuery.value.trim()
  if (searchKind.value === 'software') {
    if (q) addSearchHistory('software', q)
    router.push({ name: 'software-library', query: q ? { q } : {} })
  } else {
    if (q) addSearchHistory('component', q)
    router.push({ name: 'component-library', query: q ? { q } : {} })
  }
}
</script>

<style scoped>
.soft-home {
  position: relative;
  min-height: 100%;
}

.soft-home-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== 标题 ========== */
.soft-home-title {
  margin: 0 0 24px;
  font-size: clamp(2rem, 4.5vw, 2.75rem);
  font-weight: 800;
  color: #111827;
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* ========== 搜索框 ========== */
.soft-search-wrap {
  margin-bottom: 24px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* ========== 左右分栏（等高） ========== */
.home-columns {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 24px;
}
.col-left {
  min-width: 0;
}
.col-right {
  min-width: 0;
}

/* ========== 通用 ========== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title-ico {
  font-size: 16px;
  opacity: 0.7;
}
.section-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* ========== 上板块 · 风险预警时间线 ========== */
.alert-section {
  margin-bottom: 36px;
}

.alert-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.alert-row {
  display: flex;
  gap: 14px;
  position: relative;
}

.alert-timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
  padding-top: 4px;
}

.alert-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}
.alert-dot--high,
.alert-dot--critical {
  background: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}
.alert-dot--medium {
  background: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}
.alert-dot--low {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
}

.alert-line {
  width: 2px;
  flex: 1;
  min-height: 16px;
  background: #e5e7eb;
}

.alert-row--last .alert-line {
  display: none;
}

/* 预警卡片 */
.alert-card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  padding: 14px 16px 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.alert-card:hover {
  border-color: #fecdd3;
  box-shadow: 0 4px 16px rgba(218, 32, 62, 0.08);
}

.alert-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.alert-card-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.alert-type-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  white-space: nowrap;
}

.alert-component {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
}
.alert-component strong {
  font-weight: 700;
}
.alert-version {
  font-size: 11px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.alert-level {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.alert-level--high,
.alert-level--critical {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.alert-level--medium {
  background: #fff7ed;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.alert-cve {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: #da203e;
  font-weight: 600;
  white-space: nowrap;
}

.alert-aff {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.alert-aff--org {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}
.alert-aff--personal {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.alert-time {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 1px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.alert-desc {
  margin: 0 0 8px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-card-bottom {
  display: flex;
  justify-content: flex-end;
}
.alert-link {
  font-size: 12px;
  font-weight: 600;
  color: #da203e;
  text-decoration: none;
  transition: color 0.12s;
}
.alert-link:hover {
  color: #b81c36;
  text-decoration: underline;
}

/* ========== 下板块 · 软件卡片网格 ========== */
.soft-section {
  margin-bottom: 0;
}

/* 搜索栏 */

.soft-search {
  display: flex;
  align-items: stretch;
  min-height: 44px;
  background: #fff;
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 999px;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    0 8px 24px rgba(218, 32, 62, 0.06);
}

.soft-search-type {
  flex-shrink: 0;
  width: 80px;
  padding: 0 10px 0 18px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

.soft-search-vsep {
  align-self: stretch;
  width: 1px;
  margin: 8px 0;
  background: #e5e7eb;
  flex-shrink: 0;
}

.soft-search-mid {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 6px 0 12px;
}

.soft-search-ico {
  flex-shrink: 0;
  color: #9ca3af;
}

.soft-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  font-size: 14px;
  color: #111827;
  background: transparent;
}
.soft-search-input::placeholder {
  color: #9ca3af;
}
.soft-search-input:focus {
  outline: none;
}

.soft-search-adv {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 18px 0 14px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
}
.soft-search-adv:hover {
  color: #da203e;
}

.soft-caret {
  font-size: 10px;
  opacity: 0.7;
}

.soft-filter-panel {
  margin-top: 10px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.soft-filter-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #6b7280;
}

.soft-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.soft-filter-row:last-child {
  margin-bottom: 0;
}

/* 卡片网格 */
.soft-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.soft-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  overflow: hidden;
}
.soft-card:hover {
  border-color: #fecdd3;
  box-shadow: 0 8px 28px rgba(218, 32, 62, 0.1);
  transform: translateY(-2px);
}

.soft-card-body {
  flex: 1;
  padding: 16px 16px 12px;
}

.soft-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.soft-card-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #fda4af 0%, #fb7185 40%, #e11d48 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.soft-card-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.soft-card-version {
  flex-shrink: 0;
  font-size: 11px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: 1px 6px;
  background: #f3f4f6;
  border-radius: 3px;
}

.soft-card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soft-card-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  font-size: 12px;
}

.soft-card-k {
  color: #9ca3af;
  flex-shrink: 0;
}

.soft-card-v {
  color: #374151;
  font-weight: 500;
  text-align: right;
}

.soft-card-dev {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 编程语言标签 */
.soft-card-lang {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.soft-card-lang--python {
  background: #eef2ff;
  color: #2563eb;
  border: 1px solid #c7d2fe;
}
.soft-card-lang--go {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.soft-card-lang--js {
  background: #fefce8;
  color: #ca8a04;
  border: 1px solid #fef08a;
}
.soft-card-lang--ts {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #bae6fd;
}
.soft-card-lang--java {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.soft-card-lang--rust {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}
.soft-card-lang--default {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.soft-card-footer {
  padding: 10px 16px;
  border-top: 1px solid #f3f4f6;
  text-align: right;
}

.soft-card-link {
  font-size: 12px;
  font-weight: 600;
  color: #da203e;
  text-decoration: none;
  transition: color 0.12s;
}
.soft-card-link:hover {
  color: #b81c36;
  text-decoration: underline;
}

/* ========== 响应式 ========== */
@media (max-width: 1100px) {
  .soft-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {

  .soft-grid {
    grid-template-columns: 1fr;
  }

  .alert-card-top {
    flex-direction: column;
    gap: 6px;
  }

  .alert-card-left {
    flex-wrap: wrap;
  }

  .alert-time {
    align-self: flex-start;
  }

  .soft-search {
    flex-wrap: wrap;
    border-radius: 16px;
    padding: 4px 0;
  }

  .soft-search-type {
    width: 100%;
    padding: 8px 16px;
  }

  .soft-search-vsep {
    display: none;
  }

  .soft-search-mid {
    width: 100%;
    padding: 6px 14px;
  }

  .soft-search-adv {
    width: 100%;
    justify-content: center;
    padding: 8px 16px 10px;
  }
}
</style>