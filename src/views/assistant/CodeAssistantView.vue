<template>
  <div class="assistant">
    <aside class="assistant-side" aria-label="对话历史">
      <button type="button" class="assistant-new" @click="startNewChat">+ 新对话</button>
      <ul class="assistant-history" role="list">
        <li v-for="c in conversations" :key="c.id">
          <button
            type="button"
            class="assistant-history-item"
            :class="{ 'is-active': c.id === activeId }"
            @click="activeId = c.id"
          >
            {{ c.title }}
          </button>
        </li>
      </ul>
      <!-- <p class="assistant-side-hint" role="note">
        对话标题会在你发出首条消息后自动生成；新建对话将出现在列表顶部。
      </p> -->
    </aside>

    <section class="assistant-main" aria-label="对话">
      <header class="assistant-head">
        <h1 class="assistant-title">AI 助手</h1>
        <p class="assistant-sub">可信开源代码库 · 演示对话（回答为预设规则，接入模型后可替换）</p>
      </header>

      <div v-if="isLandingView" class="assistant-landing">
        <div class="assistant-landing-glow" aria-hidden="true" />
        <div class="assistant-landing-inner">
          <header class="assistant-welcome-plain" aria-labelledby="assistant-welcome-plain-title">
            <h2 id="assistant-welcome-plain-title" class="assistant-welcome-plain-title">
              你好！我是可信开源代码库的智能 AI 助手。
            </h2>
            <p class="assistant-welcome-plain-body">
              我深度连接了平台内海量的软件与组件元数据，我不仅能回答通用的开源知识，更能针对具体的软件和组件为你提供基于数据的决策支持。
            </p>
          </header>

          <form class="assistant-form assistant-form--hero" @submit.prevent="sendInput">
            <div class="assistant-hero-box">
              <div class="assistant-hero-field">
                <textarea
                  v-model="draft"
                  class="assistant-input assistant-input--hero"
                  rows="5"
                  placeholder="询问软件、组件、漏洞、License 或依赖…"
                  :disabled="thinking"
                  @keydown.enter.exact.prevent="sendInput"
                  @input="onHeroInputResize"
                />
                <div class="assistant-hero-actions">
                  <button
                    type="submit"
                    class="assistant-send assistant-send--hero"
                    :disabled="thinking || !draft.trim()"
                    aria-label="发送"
                  >
                    <span class="assistant-send-hero-ico" aria-hidden="true">↑</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div
            class="assistant-landing-suggestions assistant-landing-suggestions--constrained"
            role="group"
            aria-labelledby="assistant-landing-suggestions-title"
          >
            <h3 id="assistant-landing-suggestions-title" class="assistant-landing-suggestions-title">
              推荐问题
            </h3>
            <div class="assistant-welcome-grid assistant-welcome-grid--landing">
              <button
                v-for="p in recommendedQuestions.slice(1)"
                :key="'landing-' + p.id"
                type="button"
                class="assistant-welcome-btn"
                :class="{ 'assistant-welcome-btn--software': p.icon === 'maintain' }"
                :disabled="thinking"
                @click="sendPreset(p.text)"
              >
                <span class="assistant-welcome-btn-icon" aria-hidden="true">
                  <AssistantPromptIcon :name="p.icon" />
                </span>
                <span class="assistant-welcome-btn-text">{{ p.text }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        ref="scrollRef"
        class="assistant-scroll"
      >
        <div
          v-for="msg in active.messages"
          :key="msg.id"
          class="assistant-msg"
          :class="'assistant-msg--' + msg.role"
        >
          <div class="assistant-msg-label">{{ msg.role === 'user' ? '用户昵称' : 'AI助手' }}</div>
          <div class="assistant-msg-bubble">
            <p class="assistant-msg-text">{{ msg.text }}</p>
            <div v-if="msg.cards?.length" class="assistant-cards">
              <RouterLink
                v-for="card in msg.cards"
                :key="assistantCardKey(card)"
                class="assistant-card"
                :class="
                  isSoftwareCard(card) ? 'assistant-card--software' : 'assistant-card--component'
                "
                :to="assistantCardTo(card)"
              >
                <template v-if="isSoftwareCard(card)">
                  <div class="assistant-card-row assistant-card-row--head">
                    <span class="assistant-card-name">{{ card.name }}</span>
                    <span class="assistant-card-lang">{{ card.language }}</span>
                  </div>
                  <div class="assistant-card-row assistant-card-row--meta assistant-card-row--software">
                    <span>v{{ card.version ?? '—' }}</span>
                    <span class="assistant-card-dot" aria-hidden="true">·</span>
                    <span>评分 {{ card.score ?? '—' }}</span>
                    <span class="assistant-card-dot" aria-hidden="true">·</span>
                    <span>漏洞 {{ card.vulnCount ?? '—' }}</span>
                  </div>
                  <span class="assistant-card-foot assistant-card-foot--software">软件详情</span>
                </template>
                <template v-else>
                  <div class="assistant-card-row assistant-card-row--head">
                    <span class="assistant-card-name">{{ card.title }}</span>
                    <span class="assistant-card-lang">{{ card.language }}</span>
                  </div>
                  <div class="assistant-card-row assistant-card-row--meta assistant-card-row--component">
                    <span>v{{ card.version ?? '—' }}</span>
                  </div>
                  <span class="assistant-card-foot">组件详情</span>
                </template>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-if="thinking" class="assistant-msg assistant-msg--assistant">
          <div class="assistant-msg-label">助手</div>
          <div class="assistant-msg-bubble assistant-msg-bubble--typing">
            <span class="assistant-dots" aria-hidden="true"><i /><i /><i /></span>
            正在整理回答…
          </div>
        </div>
      </div>

      <div v-if="active.messages.length > 0" class="assistant-prompts" aria-label="推荐问题">
        <span class="assistant-prompts-label">试试问</span>
        <button
          v-for="p in recommendedQuestions.slice(3)"
          :key="p.id"
          type="button"
          class="assistant-chip"
          :disabled="thinking"
          @click="sendPreset(p.text)"
        >
          {{ p.text }}
        </button>
      </div>

      <form v-if="!isLandingView" class="assistant-form" @submit.prevent="sendInput">
        <textarea
          v-model="draft"
          class="assistant-input"
          rows="4"
          placeholder="继续提问…"
          :disabled="thinking"
          @keydown.enter.exact.prevent="sendInput"
        />
        <button type="submit" class="assistant-send" :disabled="thinking || !draft.trim()">
          发送
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { RECOMMENDED_QUESTIONS, matchAssistantReply } from '../../data/assistantDemo.js'
import AssistantPromptIcon from './AssistantPromptIcon.vue'

const recommendedQuestions = RECOMMENDED_QUESTIONS

/** @param {unknown} card */
function isSoftwareCard(card) {
  return Boolean(card && typeof card === 'object' && card.kind === 'software')
}

/** @param {unknown} card */
function assistantCardKey(card) {
  if (isSoftwareCard(card)) {
    return `sw-${card.name}-${card.version}`
  }
  if (card && typeof card === 'object' && 'componentId' in card) {
    return `co-${card.componentId}`
  }
  return String(Math.random())
}

/** @param {unknown} card */
function assistantCardTo(card) {
  if (isSoftwareCard(card)) {
    return {
      name: 'software-detail',
      query: { tab: 'intro', v: card.version },
    }
  }
  if (card && typeof card === 'object' && 'componentId' in card) {
    return { name: 'component-detail', params: { id: card.componentId } }
  }
  return { name: 'software-home' }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createConversation() {
  return {
    id: uid(),
    title: '新对话',
    messages: [],
  }
}

const conversations = ref([createConversation()])
const activeId = ref(conversations.value[0].id)
const draft = ref('')
const thinking = ref(false)
const scrollRef = ref(null)

const active = computed(() => {
  const c = conversations.value.find((x) => x.id === activeId.value)
  return c || conversations.value[0]
})

const isLandingView = computed(
  () => active.value.messages.length === 0 && !thinking.value,
)

function onHeroInputResize(e) {
  const el = e?.target
  if (!el || !(el instanceof HTMLTextAreaElement)) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 280)}px`
}

function scrollToBottom() {
  nextTick(() => {
    const el = scrollRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(
  () => active.value.messages.length,
  () => scrollToBottom(),
)

function startNewChat() {
  const c = createConversation()
  conversations.value.unshift(c)
  activeId.value = c.id
  draft.value = ''
}

function ensureTitleFromFirstUser(text) {
  const c = active.value
  if (c.title !== '新对话') return
  const t = text.trim().slice(0, 18)
  c.title = t ? (text.length > 18 ? t + '…' : t) : '新对话'
}

function sendPreset(text) {
  draft.value = text
  sendWithText(text)
}

function sendInput() {
  sendWithText(draft.value)
}

function sendWithText(text) {
  const raw = String(text || '').trim()
  if (!raw || thinking.value) return

  const c = active.value
  const userMsg = { id: uid(), role: 'user', text: raw }
  c.messages.push(userMsg)
  ensureTitleFromFirstUser(raw)
  draft.value = ''

  thinking.value = true
  scrollToBottom()

  window.setTimeout(() => {
    const { text: replyText, cards } = matchAssistantReply(raw)
    c.messages.push({
      id: uid(),
      role: 'assistant',
      text: replyText,
      cards: cards && cards.length ? cards : undefined,
    })
    thinking.value = false
    scrollToBottom()
  }, 650)
}
</script>

<style scoped>
.assistant {
  display: flex;
  gap: 0;
  min-height: calc(100vh - 56px - 48px);
  max-height: calc(100vh - 56px - 48px);
  margin: -8px -12px 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

@media (max-width: 900px) {
  .assistant {
    flex-direction: column;
    max-height: none;
    min-height: min(640px, 85vh);
    margin: 0;
  }
}

.assistant-side {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
}

@media (max-width: 900px) {
  .assistant-side {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 160px;
  }
}

.assistant-new {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.assistant-new:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fff5f5;
}

.assistant-history {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.assistant-history-item {
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  margin-bottom: 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  line-height: 1.35;
}

.assistant-history-item:hover {
  background: #f3f4f6;
}

.assistant-history-item.is-active {
  background: #fff;
  box-shadow: 0 0 0 1px #e5e7eb;
  color: #111827;
  font-weight: 600;
}

.assistant-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.assistant-head {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.assistant-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.assistant-sub {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.assistant-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.assistant-landing {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 28px;
  overflow-y: auto;
  background:
    radial-gradient(ellipse 100% 70% at 50% 0%, rgba(218, 32, 62, 0.06), transparent 52%),
    radial-gradient(ellipse 55% 45% at 85% 40%, rgba(37, 99, 235, 0.045), transparent 50%),
    linear-gradient(180deg, #eef0f4 0%, #f6f7f9 45%, #f1f2f5 100%);
}

.assistant-landing-glow {
  position: absolute;
  left: 50%;
  top: 18%;
  width: min(420px, 85vw);
  height: 120px;
  transform: translateX(-50%);
  background: radial-gradient(circle at 50% 40%, rgba(218, 32, 62, 0.1), transparent 70%);
  pointer-events: none;
}

.assistant-landing-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 28px;
}

@media (max-height: 720px) {
  .assistant-landing {
    justify-content: flex-start;
    padding-top: 12px;
  }
}

@media (max-width: 520px) {
  .assistant-form--hero {
    max-width: 100%;
  }

  .assistant-hero-box {
    padding: 12px 12px 10px;
    border-radius: 20px;
  }

  .assistant-hero-field {
    min-height: 100px;
  }

  .assistant-input--hero {
    min-height: 100px;
    padding: 8px 48px 44px 10px;
    font-size: 16px;
  }

  .assistant-send--hero {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 17px;
  }

  .assistant-landing-inner {
    gap: 20px;
  }
}

.assistant-welcome-plain {
  margin: 0 auto;
  padding: 0 8px;
  max-width: 36rem;
  text-align: center;
}

.assistant-welcome-plain-title {
  margin: 0 0 12px;
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.assistant-welcome-plain-body {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: #6b7280;
}

.assistant-form--hero {
  padding: 0;
  border: none;
  background: transparent;
  align-items: stretch;
  width: 100%;
  max-width: 920px;
  margin-left: auto;
  margin-right: auto;
}

.assistant-hero-box {
  width: 100%;
  padding: 14px 14px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 8px 28px rgba(17, 24, 39, 0.08);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.assistant-hero-box:focus-within {
  border-color: #d1d5db;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 10px 36px rgba(17, 24, 39, 0.1),
    0 0 0 1px rgba(218, 32, 62, 0.08);
}

.assistant-hero-field {
  position: relative;
  min-height: 120px;
}

.assistant-input--hero {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  max-height: 280px;
  margin: 0;
  padding: 10px 52px 48px 12px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  line-height: 1.55;
  resize: none;
  background: transparent;
  box-shadow: none;
}

.assistant-input--hero:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.assistant-hero-actions {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.assistant-hero-actions .assistant-send--hero {
  pointer-events: auto;
}

.assistant-send--hero {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.assistant-send-hero-ico {
  display: block;
  transform: translateY(-1px);
  font-weight: 700;
}

.assistant-landing-suggestions {
  width: 100%;
}

.assistant-landing-suggestions--constrained {
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}

.assistant-landing-suggestions-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  letter-spacing: 0.02em;
}

.assistant-welcome-grid--landing {
  margin: 0;
}

.assistant-welcome-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 540px) {
  .assistant-welcome-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.assistant-welcome-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 58px;
  padding: 12px 14px;
  text-align: left;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  font: inherit;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.assistant-welcome-btn:hover:not(:disabled) {
  border-color: #fecdd3;
  box-shadow: 0 4px 14px rgba(218, 32, 62, 0.1);
  background: #fffafb;
}

.assistant-welcome-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(218, 32, 62, 0.35);
}

.assistant-welcome-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.assistant-welcome-btn-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(218, 32, 62, 0.09);
  color: #da203e;
}

.assistant-welcome-btn--software .assistant-welcome-btn-icon {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.assistant-welcome-btn-text {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.45;
}

.assistant-side-hint {
  flex-shrink: 0;
  margin: 0;
  padding: 12px 2px 4px;
  font-size: 11px;
  line-height: 1.5;
  color: #9ca3af;
  border-top: 1px solid #ececec;
}

.assistant-msg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 92%;
}

.assistant-msg--user {
  align-self: flex-end;
  align-items: flex-end;
}

.assistant-msg--assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.assistant-msg-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.assistant-msg-bubble {
  border-radius: 12px;
  padding: 12px 14px;
  line-height: 1.65;
}

.assistant-msg--user .assistant-msg-bubble {
  background: #111827;
  color: #f9fafb;
}

.assistant-msg--assistant .assistant-msg-bubble {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.assistant-msg-text {
  margin: 0;
  font-size: 14px;
  white-space: pre-line;
}

.assistant-msg-bubble--typing {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #6b7280;
}

.assistant-dots {
  display: inline-flex;
  gap: 4px;
}

.assistant-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  animation: assistant-pulse 1s ease-in-out infinite;
}

.assistant-dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.assistant-dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes assistant-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

.assistant-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

@media (max-width: 520px) {
  .assistant-cards {
    grid-template-columns: 1fr;
  }
}

.assistant-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
  text-decoration: none;
  color: inherit;
  min-height: 0;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.assistant-card--component {
  border-left: 3px solid #da203e;
}

.assistant-card--software {
  border-left: 3px solid #2563eb;
  background: #f8fafc;
}

.assistant-card:hover {
  border-color: #d1d5db;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.assistant-card--component:hover {
  border-left-color: #da203e;
}

.assistant-card--software:hover {
  border-left-color: #2563eb;
}

.assistant-card-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.assistant-card-row--head {
  justify-content: space-between;
  gap: 8px;
}

.assistant-card-name {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assistant-card-lang {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3f4f6;
}

.assistant-card-row--meta {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.35;
  flex-wrap: wrap;
}

.assistant-card-row--software {
  font-variant-numeric: tabular-nums;
}

.assistant-card-row--component {
  margin-top: 1px;
}

.assistant-card-dot {
  color: #d1d5db;
  user-select: none;
}

.assistant-card-foot {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #da203e;
}

.assistant-card-foot--software {
  color: #2563eb;
}

.assistant-prompts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 12px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.assistant-prompts-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.assistant-chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
  line-height: 1.3;
  text-align: left;
}

.assistant-chip:hover:not(:disabled) {
  border-color: #fca5a5;
  color: #b91c1c;
  background: #fff1f2;
}

.assistant-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.assistant-form {
  display: flex;
  gap: 10px;
  padding: 12px 20px 16px;
  align-items: flex-end;
}

.assistant-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
}

.assistant-input:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.assistant-send {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #da203e;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.assistant-send:hover:not(:disabled) {
  filter: brightness(1.05);
}

.assistant-send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
