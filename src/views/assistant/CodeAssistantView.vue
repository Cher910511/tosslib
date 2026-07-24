<template>
  <div class="assistant">
    <!-- 侧边栏：对话历史 -->
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
    </aside>

    <section class="assistant-main" aria-label="对话">
      <header class="assistant-head">
        <h1 class="assistant-title">AI 助手</h1>
        <p class="assistant-sub">可信开源代码库 · 智能问答</p>
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

          <div class="assistant-landing-suggestions" role="group" aria-labelledby="assistant-landing-suggestions-title">
            <h3 id="assistant-landing-suggestions-title" class="assistant-landing-suggestions-title">推荐问题</h3>
            <div class="assistant-welcome-grid">
              <button
                v-for="p in recommendedQuestions.slice(1)"
                :key="'landing-' + p.id"
                type="button"
                class="assistant-welcome-btn"
                :disabled="thinking"
                @click="sendPreset(p.text)"
              >
                <span class="assistant-welcome-btn-text">{{ p.text }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话内容 -->
      <div v-else ref="scrollRef" class="assistant-scroll">
        <template v-for="msg in active.messages" :key="msg.id">
          <!-- 用户消息 -->
          <div class="msg-row msg-row--user">
            <div class="msg-bubble msg-bubble--user">
              <p class="msg-text">{{ msg.text }}</p>
            </div>
          </div>

          <!-- 助手消息 - 任务工作流卡片 -->
          <div v-if="msg.role === 'assistant' && msg.tasks" class="assistant-reply">
            <!-- 提示语：准备中 → 正在制定计划 → 创建任务中（思考过程出现后消失） -->
            <div class="thinking-indicator" v-if="msg === active.messages[active.messages.length - 1] && thinkingPhase < 3">
              <span class="think-dot" /><span class="think-dot" /><span class="think-dot" />
              <span class="think-text">
                <template v-if="thinkingPhase === 0">准备中</template>
                <template v-else-if="thinkingPhase === 1">正在制定计划</template>
                <template v-else>创建任务中</template>
              </span>
              <span class="think-seconds">{{ thinkingSeconds }} 秒</span>
            </div>

            <!-- 思考过程（可折叠展开） -->
            <div class="reasoning-section" v-if="msg === active.messages[active.messages.length - 1] && thinkingPhase >= 3">
              <div class="reasoning-header" @click="reasoningExpanded = !reasoningExpanded">
                <span class="think-dot" /><span class="think-dot" /><span class="think-dot" />
                <span class="think-text">思考中</span><span class="think-seconds">{{ thinkingSeconds }} 秒</span>
                <span class="reasoning-toggle-icon" style="margin-left:auto;">{{ reasoningExpanded ? '▾' : '▸' }}</span>
              </div>
              <div class="reasoning-content" v-if="reasoningExpanded">
                <div class="reasoning-stream">{{ reasoningText }}<span class="reasoning-cursor">|</span></div>
              </div>
              <div class="reasoning-query" v-if="queryStreamText.length > 0">{{ queryStreamText }}</div>
            </div>

            <!-- 待办事项卡片 -->
            <div class="task-card" v-if="msg.tasks && thinkingPhase >= 3 && reasoningText.length >= fullReasoningText.length && queryStreamText.length >= 24">
              <div class="task-card-header">
                <h3 class="task-card-title">待办事项</h3>
                <span class="task-card-count">共 {{ msg.tasks.length }} 项</span>
              </div>

              <div class="task-summary">
                <span class="task-summary-item task-summary-pending">待处理 {{ pendingCount(msg.tasks) }}</span>
                <span class="task-summary-item task-summary-progress">进行中 {{ inProgressCount(msg.tasks) }}</span>
                <span class="task-summary-item task-summary-done">已完成 {{ doneCount(msg.tasks) }}</span>
              </div>

              <div class="task-list">
                <div
                  v-for="(task, ti) in msg.tasks"
                  :key="ti"
                  class="task-item"
                  :class="'task-item--' + task.status"
                >
                  <div class="task-item-head">
                    <span class="task-item-icon" :class="'task-item-icon--' + task.status">
                      <svg v-if="task.status === 'done'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg v-else-if="task.status === 'progress'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    </span>
                    <span class="task-item-title">{{ task.title }}</span>
                    <span class="task-item-badge" :class="'task-item-badge--' + task.status">{{ task.statusLabel }}</span>
                  </div>

                  <div v-if="task.substeps && task.substeps.length" class="task-substeps">
                    <div
                      v-for="(sub, si) in task.substeps"
                      :key="si"
                      class="task-substep"
                      :class="{ 'task-substep--done': sub.done }"
                    >
                      <span class="task-substep-icon">
                        <svg v-if="sub.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                      </span>
                      <div class="task-substep-body">
                        <span class="task-substep-label">{{ sub.label }}</span>
                        <span v-if="sub.tag" class="task-substep-tag">{{ sub.tag }}</span>
                        <span v-if="sub.desc" class="task-substep-desc">{{ sub.desc }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 旧版助手消息（兼容） -->
          <div v-else-if="msg.role === 'assistant'" class="msg-row msg-row--assistant">
            <div class="msg-bubble msg-bubble--assistant">
              <p class="msg-text">{{ msg.text }}</p>
            </div>
          </div>
        </template>

        <!-- 正在思考 - 立即显示 -->
        <div v-if="thinking && active.messages.length === 0" class="msg-row msg-row--assistant">
          <div class="thinking-indicator">
            <span class="thinking-dot" /><span class="thinking-dot" /><span class="thinking-dot" />
            创建任务中 {{ thinkingSeconds }} 秒
          </div>
        </div>
      </div>

      <!-- 推荐问题 -->
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

      <!-- 输入框 -->
      <form v-if="!isLandingView" class="assistant-form" @submit.prevent="sendInput">
        <textarea
          v-model="draft"
          class="assistant-input"
          rows="3"
          placeholder="继续提问…"
          :disabled="thinking"
          @keydown.enter.exact.prevent="sendInput"
        />
        <button type="submit" class="assistant-send" :disabled="thinking || !draft.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { RECOMMENDED_QUESTIONS, matchAssistantReply } from '../../data/assistantDemo.js'

const recommendedQuestions = RECOMMENDED_QUESTIONS

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
const thinkingSeconds = ref(0)
const thinkingPhase = ref(0) // 0=等待中 1=准备中 2=思考中 3=创建任务中
let thinkingTimer = null
const reasoningText = ref('')
const reasoningExpanded = ref(false)
const fullReasoningText = ref('')
const queryStreamText = ref('')
const scrollRef = ref(null)

const active = computed(() => {
  const c = conversations.value.find((x) => x.id === activeId.value)
  return c || conversations.value[0]
})

const isLandingView = computed(() => active.value.messages.length === 0 && !thinking.value)

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

watch(() => active.value.messages.length, () => scrollToBottom())

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
  thinkingSeconds.value = 0
  thinkingPhase.value = 0 // 准备中
  thinkingTimer = setInterval(() => { thinkingSeconds.value++ }, 1000)
  reasoningText.value = ''
  reasoningExpanded.value = false
  scrollToBottom()

  // 每2秒切换阶段：准备中(0) → 思考中(1) → 创建任务中(2) → 开始推理(3)
  setTimeout(() => { thinkingPhase.value = 1 }, 2000)  // 思考中
  setTimeout(() => { thinkingPhase.value = 2 }, 4000)  // 创建任务中
  setTimeout(() => {
    thinkingPhase.value = 3 // 开始推理

    // 构建推理内容并开始流式输出（只播一次）
    const reasoningChunks = buildReasoningChunks()
    fullReasoningText.value = reasoningChunks.join('')
    let ri = 0
    reasoningText.value = ''
    reasoningExpanded.value = true // 输出时展开
    const streamReasoning = () => {
      if (ri < reasoningChunks.length) {
        reasoningText.value += reasoningChunks[ri]
        ri++
        setTimeout(streamReasoning, 50)
      } else {
        reasoningExpanded.value = false // 输出完成自动收起
        // 开始流式输出查询提示
        const queryText = '我来帮你查找比XStream更安全的Java XML解析库'
        let qi = 0
        const streamQuery = () => {
          if (qi < queryText.length) {
            queryStreamText.value += queryText[qi]
            qi++
            setTimeout(streamQuery, 30)
          }
        }
        streamQuery()
      }
    }
    streamReasoning()
  }, 6000) // 6秒后开始推理流式输出

  window.setTimeout(() => {
    const { text: replyText, cards } = matchAssistantReply(raw)
    const tasks = buildDemoTasks(replyText)

    // 先创建空消息，让用户看到首字快速出现
    const msg = {
      id: uid(),
      role: 'assistant',
      text: '',
      cards: cards && cards.length ? cards : undefined,
      tasks: tasks.length ? tasks : undefined,
    }
    c.messages.push(msg)
    scrollToBottom()

    // 流式逐字输出模拟，首字快速出现
    let idx = 0
    const step = () => {
      if (idx < replyText.length) {
        msg.text += replyText[idx]
        idx++
        // 前 10 个字每 30ms 输出一个，之后每 15ms
        const delay = idx <= 10 ? 30 : 15
        setTimeout(step, delay)
        scrollToBottom()
      }
    }
    step()
  }, 500) // 缩短思考等待时间，让首字更快出现
}

function buildReasoningChunks() {
  const raw = [
    '用户', '问', '的是', '关于', 'GPL', '协议', '的', '库', '引入', '闭', '源', '产品的', '合规', '风险', '问题', '。',
    '这是一个', '典型的', '开源', '软件', '合规', '评估', '问题', '，', '属于', 'tosshub', '-skill', '的范围', '。\n\n',
    '根据', '全局', '指令', '中的', '特殊', '例外', '规则', '：\n',
    '-', ' 开', '源', '软件', '的安全', '与', '合规', '评估', '（', '漏洞', '/', '开源', '协议', '）', '必须', '调用', 'todo', '\n',
    '-', ' 必', '须', '创建', '3', '~', '5', '个', '合适的', 'todo', '\n',
    '-', ' 不', '允许', '只', '创建', '1', '个', '笼', '统', '任务', '\n',
    '-', ' 不', '允许', '跳', '过', 'todo', '直接', '回答', '\n\n',
    '我', '需要', '：\n',
    '1', '.', ' 先', '调用', 'tosshub', '-skill', '来', '获取', '相关信息', '\n',
    '2', '.', ' 创建', '合适的', 'todo', '任务', '清单', '\n',
    '3', '.', ' 按', '照', '任务', '顺序', '执行', '\n',
    '4', '.', ' 最后', '根据', 'output', '_format', '.md', '约束', '输出', '格式', '\n\n',
    '让我', '先', '调用', 'tosshub', '-skill', '。',
  ]
  return raw
}

function buildDemoTasks(replyText) {
  return [
    {
      title: '明确用户问题：查询 Log4j 最新版本的安全漏洞情况',
      status: 'done',
      statusLabel: '已完成',
      substeps: [],
    },
    {
      title: '调用 tosshub-skill 查询 Log4j 组件信息与安全漏洞',
      status: 'progress',
      statusLabel: '进行中',
      substeps: [
        { label: '调用技能: tosshub-skill', tag: '# 可信开源代码库 AI 助手技能', done: true },
        { label: '读取文件: sql_templates.md', desc: '[File skeleton: sql_templates.md (305 lines)]', done: true },
        { label: '读取文件: output_format.md', desc: '1| # 前端 UI 卡片数据渲染格式规范', done: true },
        { label: '读取文件: sql_templates.md', desc: '170| ### 2.1 漏洞评估逻辑', done: true },
        { label: '执行命令: python /root/atomcode/skills/tosshub-skill/script/...', desc: '[elapsed: 0.3s, exit: 0]', done: true },
        { label: '执行命令: python /root/atomcode/skills/tosshub-skill/script/...', done: false },
      ],
    },
    {
      title: '分析扫描结果并生成安全评估报告',
      status: 'pending',
      statusLabel: '待处理',
      substeps: [],
    },
    {
      title: '汇总最终回答并展示给用户',
      status: 'pending',
      statusLabel: '待处理',
      substeps: [],
    },
  ]
}

function pendingCount(tasks) {
  return tasks.filter((t) => t.status === 'pending').length
}
function inProgressCount(tasks) {
  return tasks.filter((t) => t.status === 'progress').length
}
function doneCount(tasks) {
  return tasks.filter((t) => t.status === 'done').length
}

onUnmounted(() => {
  if (thinkingTimer) clearInterval(thinkingTimer)
})
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

/* ===== 侧边栏 ===== */
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
  font-family: inherit;
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
  font-family: inherit;
}
.assistant-history-item:hover { background: #f3f4f6; }
.assistant-history-item.is-active {
  background: #fff;
  box-shadow: 0 0 0 1px #e5e7eb;
  color: #111827;
  font-weight: 600;
}

/* ===== 主区域 ===== */
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
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 消息行 ===== */
.msg-row {
  display: flex;
  width: 100%;
}
.msg-row--user {
  justify-content: flex-end;
}
.msg-row--assistant {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}
.msg-bubble--user {
  background: #dbeafe;
  color: #1e40af;
  border-bottom-right-radius: 4px;
}
.msg-bubble--assistant {
  background: transparent;
  border: none;
  border-bottom-left-radius: 4px;
  color: #374151;
  padding: 0;
}
.msg-text {
  margin: 0;
  white-space: pre-wrap;
}

/* ===== 思考中指示器 ===== */
.assistant-reply {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  padding: 12px 20px;
  background: #f8faff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  width: 100%;
  max-width: 720px;
  box-sizing: border-box;
}

/* 统一跳动三点 */
.think-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #224ebf;
  animation: think-bounce 1.2s ease-in-out infinite;
}
.think-dot:nth-child(2) { animation-delay: 0.2s; }
.think-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes think-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* 提示文字样式 */
.think-text {
  font-weight: 600;
  color: #224ebf;
  font-size: 14px;
}
.think-seconds {
  font-weight: 600;
  color: #224ebf;
  font-size: 14px;
  margin-left: 4px;
}
.thinking-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #da203e;
  animation: think-bounce 1.2s ease-in-out infinite;
}
.thinking-dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes think-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

/* ===== 思考过程 ===== */
.reasoning-section {
  max-width: 720px;
  margin-top: 8px;
  background: #fafbfc;
  border: 1px solid #e8edf5;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
}
.reasoning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.reasoning-header:hover {
  background: #f3f6fc;
}
.reasoning-query {
  font-size: 14px;
  color: #1f2937;
  padding: 6px 14px 12px;
  line-height: 1.6;
  font-weight: 500;
  border-top: 1px solid #e8edf5;
  background: #fff;
}
.reasoning-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: #f3f6fc;
  border-radius: 6px;
  font-size: 13px;
  color: #224ebf;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: background 0.15s;
}
.reasoning-toggle:hover {
  background: #e8edf5;
}
.reasoning-toggle-icon {
  font-size: 16px;
  color: #224ebf;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}
.reasoning-toggle-icon:hover {
  background: #e8edf5;
}
.reasoning-status {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}
.reasoning-content {
  margin-top: 8px;
  padding: 12px 16px;
  background: #fafbfc;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}
.reasoning-stream {
  font-size: 13px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}
.reasoning-cursor {
  color: #224ebf;
  animation: blink 0.8s step-end infinite;
  font-weight: 700;
}
@keyframes blink {
  50% { opacity: 0; }
}

/* ===== 任务卡片 ===== */
.task-card {
  width: 100%;
  max-width: 720px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.task-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
}
.task-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.task-card-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* ===== 任务状态概览 ===== */
.task-summary {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
}
.task-summary-item {
  font-size: 13px;
  font-weight: 500;
}
.task-summary-pending { color: #d97706; }
.task-summary-progress { color: #2563eb; }
.task-summary-done { color: #16a34a; }

/* ===== 任务列表 ===== */
.task-list {
  padding: 8px 0;
}

.task-item {
  padding: 12px 20px;
}

.task-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.task-item-icon--pending svg { color: #d1d5db; }

.task-item-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  min-width: 0;
}

.task-item-badge {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.task-item-badge--done {
  background: #dcfce7;
  color: #16a34a;
}
.task-item-badge--progress {
  background: #dbeafe;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.task-item-badge--progress::after {
  content: '↑';
  font-size: 10px;
}
.task-item-badge--pending {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ===== 子步骤 ===== */
.task-substeps {
  margin-top: 10px;
  margin-left: 34px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 8px;
  border-left: 2px solid #e5e7eb;
}

.task-substep {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 4px 0;
}

.task-substep-icon {
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
}

.task-substep-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-substep-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

.task-substep-tag {
  display: inline-block;
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 8px;
  border-radius: 4px;
  width: fit-content;
}

.task-substep-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}

/* ===== 着陆页 ===== */
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
  background: radial-gradient(ellipse 100% 70% at 50% 0%, rgba(218, 32, 62, 0.06), transparent 52%),
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
  max-width: 860px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 28px;
}

.assistant-welcome-plain {
  text-align: center;
}
.assistant-welcome-plain-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
}
.assistant-welcome-plain-body {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 520px;
  margin: 0 auto;
}

.assistant-form--hero {
  width: 100%;
}
.assistant-hero-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  width: 100%;
}
.assistant-hero-field {
  display: flex;
  flex-direction: column;
}
.assistant-input--hero {
  border: none;
  resize: none;
  padding: 16px;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  outline: none;
  line-height: 1.55;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
}
.assistant-input--hero::placeholder { color: #9ca3af; }
.assistant-input--hero:disabled { background: #f9fafb; }
.assistant-hero-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 12px 12px;
}
.assistant-send--hero {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #da203e;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.assistant-send--hero:hover { background: #b81830; }
.assistant-send--hero:disabled { background: #d1d5db; cursor: not-allowed; }
.assistant-send-hero-ico { font-size: 20px; font-weight: 700; line-height: 1; }

.assistant-landing-suggestions { text-align: center; }
.assistant-landing-suggestions-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.05em;
}
.assistant-welcome-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.assistant-welcome-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.assistant-welcome-btn:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fff5f5;
}
.assistant-welcome-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 推荐问题 ===== */
.assistant-prompts {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  overflow-x: auto;
  flex-shrink: 0;
}
.assistant-prompts-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  flex-shrink: 0;
}
.assistant-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #f9fafb;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;
}
.assistant-chip:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fff5f5;
}
.assistant-chip:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 输入框 ===== */
.assistant-form {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.assistant-input {
  flex: 1;
  resize: none;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  outline: none;
  line-height: 1.5;
  min-height: 44px;
  max-height: 120px;
}
.assistant-input:focus { border-color: #da203e; }
.assistant-input:disabled { background: #f9fafb; }
.assistant-input::placeholder { color: #9ca3af; }
.assistant-send {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: #da203e;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.assistant-send:hover { background: #b81830; }
.assistant-send:disabled { background: #d1d5db; cursor: not-allowed; }
</style>