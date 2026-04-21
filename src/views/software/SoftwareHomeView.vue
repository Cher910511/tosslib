<template>
  <div class="soft-home">
    <div class="soft-home-decor" aria-hidden="true">
      <span class="soft-home-shape soft-home-shape--a" />
      <span class="soft-home-shape soft-home-shape--b" />
      <span class="soft-home-shape soft-home-shape--c" />
      <span class="soft-home-shape soft-home-shape--d" />
    </div>

    <div class="soft-home-inner">
      <h1 class="soft-home-title">可信开源代码库</h1>

      <div class="soft-home-search-wrap">
        <div class="soft-home-search">
          <select v-model="searchKind" class="soft-home-search-type" aria-label="搜索类型">
            <option value="software">软件</option>
            <option value="component">组件</option>
          </select>
          <span class="soft-home-search-vsep" aria-hidden="true" />
          <div class="soft-home-search-mid">
            <svg
              class="soft-home-search-ico"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
              class="soft-home-search-input"
              placeholder="搜索代码仓库…"
              autocomplete="off"
              @keydown.enter.prevent="submitSearch"
            />
          </div>
          <span class="soft-home-search-vsep" aria-hidden="true" />
          <button
            type="button"
            class="soft-home-search-adv"
            :aria-expanded="filterOpen"
            @click="filterOpen = !filterOpen"
          >
            高级筛选
            <span class="soft-home-caret" aria-hidden="true">▾</span>
          </button>
        </div>

        <div v-show="filterOpen" class="soft-home-filter-panel">
          <p class="soft-home-filter-hint">演示：可按语言、许可证等筛选（接入接口后生效）。</p>
          <label class="soft-home-filter-row">
            <input v-model="filterDemo.java" type="checkbox" />
            <span>Java / JVM</span>
          </label>
          <label class="soft-home-filter-row">
            <input v-model="filterDemo.js" type="checkbox" />
            <span>JavaScript / TypeScript</span>
          </label>
          <label class="soft-home-filter-row">
            <input v-model="filterDemo.python" type="checkbox" />
            <span>Python</span>
          </label>
        </div>
      </div>

      <section class="soft-home-section" aria-labelledby="soft-home-software-heading">
        <h2 id="soft-home-software-heading" class="soft-home-section-title">推荐软件</h2>
        <div class="soft-home-grid">
          <RouterLink
            v-for="card in softwareCards"
            :key="card.id"
            class="soft-home-card soft-home-card--software"
            :to="{ name: 'software-library', query: { q: card.name } }"
          >
            <span
              v-if="card.highlight === 'score'"
              class="soft-home-pill soft-home-pill--score"
              aria-label="高安全评分推荐"
            >
              高评分
            </span>
            <span
              v-else-if="card.highlight === 'stars'"
              class="soft-home-pill soft-home-pill--stars"
              aria-label="高 Star 数推荐"
            >
              高 star 数
            </span>
            <div class="soft-home-card-top">
              <span class="soft-home-card-cube" aria-hidden="true" />
              <div class="soft-home-card-head">
                <span class="soft-home-card-name">{{ card.name }}</span>
                <div class="soft-home-card-badges">
                  <span class="soft-home-badge">{{ card.version }}</span>
                  <span class="soft-home-badge">{{ card.language }}</span>
                </div>
              </div>
            </div>
            <div class="soft-home-card-meta">
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">发布日期</span>
                <span class="soft-home-card-v">{{ card.released }}</span>
              </div>
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">开发商</span>
                <span class="soft-home-card-v">{{ card.developer }}</span>
              </div>
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">安全评分</span>
                <span class="soft-home-card-v" :class="scoreTone(card.securityScore)">
                  {{ card.securityScore }} 分
                </span>
              </div>
              <div class="soft-home-card-row soft-home-card-row--safe">
                <span class="soft-home-card-k">漏洞风险</span>
                <span
                  class="soft-home-safe"
                  title="经检测，当前版本未发现已知高危漏洞，可放心使用"
                  aria-label="安全可信：未发现已知高危漏洞"
                >
                  <svg
                    class="soft-home-safe-ico"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
                    />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <section class="soft-home-section" aria-labelledby="soft-home-component-heading">
        <h2 id="soft-home-component-heading" class="soft-home-section-title">推荐组件</h2>
        <div class="soft-home-grid">
          <RouterLink
            v-for="card in componentCards"
            :key="card.id"
            class="soft-home-card soft-home-card--component"
            :to="{ name: 'component-detail', params: { id: card.id } }"
          >
            <div class="soft-home-card-top soft-home-card-top--component">
              <span class="soft-home-card-gem" aria-hidden="true" />
              <div class="soft-home-card-head soft-home-card-head--component">
                <span class="soft-home-card-name" :title="card.name">{{ card.name }}</span>
              </div>
              <span
                v-if="card.recommendKind === 'premium'"
                class="soft-home-comp-pill soft-home-comp-pill--premium"
                aria-label="精品推荐"
              >
                精品推荐
              </span>
              <span
                v-else-if="card.recommendKind === 'classic'"
                class="soft-home-comp-pill soft-home-comp-pill--classic"
                aria-label="经典推荐"
              >
                经典推荐
              </span>
              <span
                v-else-if="card.recommendKind === 'recent'"
                class="soft-home-comp-pill soft-home-comp-pill--recent"
                aria-label="最近发布"
              >
                最近发布
              </span>
            </div>
            <div class="soft-home-card-meta">
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">组件版本</span>
                <span class="soft-home-card-v">{{ card.version }}</span>
              </div>
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">发布时间</span>
                <span class="soft-home-card-v">{{ card.released }}</span>
              </div>
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">编程语言</span>
                <span class="soft-home-card-v">{{ card.language }}</span>
              </div>
              <div class="soft-home-card-row">
                <span class="soft-home-card-k">groupId</span>
                <span class="soft-home-card-v soft-home-card-v--mono">{{ card.groupId }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { SOFTWARE_HOME_CARDS } from '../../data/softwareHomeCards.js'
import { COMPONENT_HOME_CARDS } from '../../data/componentHomeCards.js'
import { addSearchHistory } from '../../composables/useAdminSearch.js'

const router = useRouter()
const softwareCards = SOFTWARE_HOME_CARDS
const componentCards = COMPONENT_HOME_CARDS

function scoreTone(n) {
  if (n >= 90) return 'soft-home-tone-good'
  if (n >= 75) return 'soft-home-tone-mid'
  return 'soft-home-tone-warn'
}
const searchKind = ref('software')
const searchQuery = ref('')
const filterOpen = ref(false)
const filterDemo = reactive({ java: false, js: false, python: false })

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
  margin: -24px;
  min-height: calc(100% + 48px);
  padding: 40px 24px 48px;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    #fff5f4 0%,
    #ffeef0 18%,
    #fff7ed 42%,
    #fef3f2 70%,
    #f8fafc 100%
  );
}

.soft-home-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.soft-home-shape {
  position: absolute;
  border-radius: 12px;
  opacity: 0.35;
  filter: blur(0.5px);
}

.soft-home-shape--a {
  width: 120px;
  height: 120px;
  left: 8%;
  top: 12%;
  background: linear-gradient(135deg, rgba(218, 32, 62, 0.25), rgba(255, 180, 160, 0.4));
  transform: rotate(-18deg) perspective(400px) rotateX(12deg);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
}

.soft-home-shape--b {
  width: 72px;
  height: 72px;
  right: 12%;
  top: 18%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(251, 207, 232, 0.5));
  transform: rotate(12deg);
}

.soft-home-shape--c {
  width: 90px;
  height: 90px;
  right: 22%;
  top: 8%;
  background: linear-gradient(145deg, rgba(254, 215, 170, 0.55), rgba(252, 165, 165, 0.35));
  transform: rotate(24deg) skewX(-6deg);
}

.soft-home-shape--d {
  width: 56px;
  height: 56px;
  left: 18%;
  top: 28%;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 228, 230, 0.9), rgba(254, 202, 202, 0.45));
  transform: rotate(36deg);
}

.soft-home-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.soft-home-title {
  margin: 0 0 32px;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  color: #111827;
  text-align: center;
  letter-spacing: -0.02em;
}

.soft-home-search-wrap {
  max-width: 920px;
  margin: 0 auto 36px;
}

.soft-home-section + .soft-home-section {
  margin-top: 48px;
}

.soft-home-section-title {
  margin: 0 0 18px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.soft-home-search {
  display: flex;
  align-items: stretch;
  min-height: 52px;
  background: #fff;
  border: 1px solid rgba(229, 231, 235, 0.95);
  border-radius: 999px;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    0 12px 40px rgba(218, 32, 62, 0.08);
}

.soft-home-search-type {
  flex-shrink: 0;
  width: 88px;
  padding: 0 12px 0 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

.soft-home-search-vsep {
  align-self: stretch;
  width: 1px;
  margin: 10px 0;
  background: #e5e7eb;
  flex-shrink: 0;
}

.soft-home-search-mid {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 8px 0 14px;
}

.soft-home-search-ico {
  flex-shrink: 0;
  color: #9ca3af;
}

.soft-home-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  font-size: 15px;
  color: #111827;
  background: transparent;
}

.soft-home-search-input::placeholder {
  color: #9ca3af;
}

.soft-home-search-input:focus {
  outline: none;
}

.soft-home-search-adv {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px 0 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
}

.soft-home-search-adv:hover {
  color: #da203e;
}

.soft-home-caret {
  font-size: 10px;
  opacity: 0.7;
}

.soft-home-filter-panel {
  margin-top: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.soft-home-filter-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #6b7280;
}

.soft-home-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.soft-home-filter-row:last-child {
  margin-bottom: 0;
}

.soft-home-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 1100px) {
  .soft-home-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .soft-home {
    padding: 28px 16px 36px;
    margin: -24px -16px;
    min-height: calc(100% + 48px);
  }

  .soft-home-search {
    flex-wrap: wrap;
    border-radius: 20px;
    padding: 4px 0;
  }

  .soft-home-search-type {
    width: 100%;
    padding: 10px 16px;
    border-radius: 16px 16px 0 0;
  }

  .soft-home-search-vsep {
    display: none;
  }

  .soft-home-search-mid {
    width: 100%;
    padding: 8px 16px;
  }

  .soft-home-search-adv {
    width: 100%;
    justify-content: center;
    padding: 10px 16px 14px;
  }

  .soft-home-grid {
    grid-template-columns: 1fr;
  }
}

.soft-home-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 14px;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.soft-home-pill {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  pointer-events: none;
  white-space: nowrap;
}

.soft-home-pill--score {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  box-shadow:
    0 1px 4px rgba(109, 40, 217, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.soft-home-pill--stars {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  box-shadow:
    0 1px 4px rgba(217, 119, 6, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.soft-home-comp-pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
}

.soft-home-comp-pill--premium {
  background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
  box-shadow:
    0 1px 4px rgba(190, 18, 60, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.soft-home-comp-pill--classic {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
  box-shadow:
    0 1px 4px rgba(67, 56, 202, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.soft-home-comp-pill--recent {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  box-shadow:
    0 1px 4px rgba(13, 148, 136, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.soft-home-card:hover {
  border-color: #fecdd3;
  box-shadow: 0 8px 28px rgba(218, 32, 62, 0.1);
  transform: translateY(-2px);
}

.soft-home-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f3f4f6;
}

.soft-home-card-top--component {
  gap: 10px;
  align-items: flex-start;
}

.soft-home-card-head--component {
  flex: 1;
  min-width: 0;
}

.soft-home-card-cube {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fda4af 0%, #fb7185 40%, #e11d48 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    2px 4px 12px rgba(225, 29, 72, 0.25);
  transform: rotate(-8deg) perspective(80px) rotateX(8deg);
}

.soft-home-card-gem {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: transparent;
}

.soft-home-card-gem::before {
  content: '';
  width: 22px;
  height: 22px;
  border-radius: 5px;
  transform: rotate(45deg);
  background: linear-gradient(145deg, #c7d2fe 0%, #6366f1 45%, #4338ca 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    2px 4px 12px rgba(67, 56, 202, 0.28);
}

.soft-home-card-head {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soft-home-card-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.soft-home-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.soft-home-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f3f4f6;
}

.soft-home-card-meta {
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.soft-home-card-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 12px;
}

.soft-home-card-k {
  color: #9ca3af;
  flex-shrink: 0;
}

.soft-home-card-v {
  color: #374151;
  font-weight: 500;
  text-align: right;
}

.soft-home-card-row--safe {
  align-items: center;
}

.soft-home-safe {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
  color: #059669;
}

.soft-home-safe-ico {
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(5, 150, 105, 0.25));
}

.soft-home-tone-good {
  color: #059669 !important;
  font-weight: 600 !important;
}

.soft-home-tone-mid {
  color: #d97706 !important;
  font-weight: 600 !important;
}

.soft-home-tone-warn {
  color: #dc2626 !important;
  font-weight: 600 !important;
}

.soft-home-card-v--mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  word-break: break-all;
  line-height: 1.35;
}
</style>
