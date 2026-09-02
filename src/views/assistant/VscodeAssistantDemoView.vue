<template>
  <div class="vscode-demo" aria-label="VSCode 风格 AI 助手演示">
    <!-- 活动栏 -->
    <nav class="vs-activitybar" aria-label="活动栏">
      <span class="vs-activitybar-item vs-activitybar-item--active" title="可信开源代码库 AI 助手">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-act-ico" aria-hidden="true"><path d="M12 3v18M5 8l-3 4 3 4M19 8l3 4-3 4"/></svg>
      </span>
      <span class="vs-activitybar-item" title="资源管理器"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="vs-act-ico" aria-hidden="true"><path d="M3 7h7l2 2h9v10H3z"/></svg></span>
      <span class="vs-activitybar-item" title="搜索"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="vs-act-ico" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/></svg></span>
      <span class="vs-activitybar-spacer" />
      <span class="vs-activitybar-item" title="设置"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="vs-act-ico" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
    </nav>

    <!-- 侧边栏：AI 助手 -->
    <aside class="vs-sidebar" aria-label="AI 助手侧边栏">
      <header class="vs-sidebar-hd">
        <span class="vs-sidebar-title">可信开源代码库 · AI 助手</span>
        <button type="button" class="vs-new-btn" @click="startNewChat">+ 新对话</button>
      </header>

      <!-- 对话历史 -->
      <div class="vs-history" aria-label="对话历史">
        <p class="vs-history-label">对话历史</p>
        <button
          v-for="c in conversations"
          :key="c.id"
          type="button"
          class="vs-history-item"
          :class="{ 'is-active': c.id === activeId }"
          @click="switchChat(c.id)"
        >{{ c.title }}</button>
      </div>

      <!-- 对话区 -->
      <div class="vs-chat" ref="chatBox" aria-live="polite">
        <template v-if="messages.length === 0">
          <div class="vs-welcome">
            <p class="vs-welcome-title">你好，我是可信开源代码库的 AI 助手。</p>
            <p class="vs-welcome-body">
              无需离开编辑器，即可完成软件选型、漏洞查询、License 合规、依赖分析与引入集成。
            </p>
          </div>
          <p class="vs-suggest-label">推荐问题</p>
          <div class="vs-suggest-list">
            <button
              v-for="q in recommendedQuestions"
              :key="q.id"
              type="button"
              class="vs-suggest-item"
              @click="sendQuestion(q.text)"
            >{{ q.text }}</button>
          </div>
        </template>

        <template v-else>
          <div v-for="m in messages" :key="m.id" class="vs-msg" :class="'vs-msg--' + m.role">
            <div class="vs-msg-avatar" aria-hidden="true">{{ m.role === 'user' ? '我' : 'AI' }}</div>
            <div class="vs-msg-body">
              <p class="vs-msg-text" v-html="m.text"></p>
              <div v-if="m.cards && m.cards.length" class="vs-cards">
                <button
                  v-for="(card, i) in m.cards"
                  :key="'card-' + m.id + '-' + i"
                  type="button"
                  class="vs-card"
                  @click="openCard(card)"
                >
                  <span class="vs-card-kind" :class="'vs-card-kind--' + card.kind">{{ card.kind === 'software' ? '软件' : '组件' }}</span>
                  <span class="vs-card-name">{{ card.name }}</span>
                  <span class="vs-card-ver">{{ card.version }}</span>
                  <span class="vs-card-meta">{{ card.kind === 'software' ? '评分 ' + card.score + ' · ' + card.vulnCount + ' 漏洞' : card.language }}</span>
                </button>
              </div>
            </div>
          </div>
          <p v-if="thinking" class="vs-thinking">AI 正在思考<span class="vs-dots">...</span></p>
        </template>
      </div>

      <!-- 输入区 -->
      <footer class="vs-input-bar">
        <textarea
          v-model="draft"
          class="vs-input"
          rows="2"
          placeholder="询问软件、组件、漏洞、License 或依赖…"
          :disabled="thinking"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button type="button" class="vs-send" :disabled="thinking || !draft.trim()" @click="send" aria-label="发送">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-send-ico" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </footer>
    </aside>

    <!-- 编辑器占位（衬托侧边栏） -->
    <section class="vs-editor" aria-label="编辑器占位">
      <div class="vs-editor-tabs">
        <span class="vs-editor-tab is-active">pom.xml</span>
        <span class="vs-editor-tab">App.java</span>
        <span class="vs-editor-tab">package.json</span>
      </div>
      <pre class="vs-code"><code><span class="vs-code-c">// 在代码编辑器里直接完成开源选型与合规咨询</span>
<span class="vs-code-k">&lt;dependency&gt;</span>
    <span class="vs-code-k">&lt;groupId&gt;</span>net.coobird<span class="vs-code-k">&lt;/groupId&gt;</span>
    <span class="vs-code-k">&lt;artifactId&gt;</span>thumbnailator<span class="vs-code-k">&lt;/artifactId&gt;</span>
    <span class="vs-code-k">&lt;version&gt;</span>0.4.20<span class="vs-code-k">&lt;/version&gt;</span>
<span class="vs-code-k">&lt;/dependency&gt;</span>

<span class="vs-code-c">// 在侧边栏提问，AI 助手直接给出引入配置与合规结论</span>
<span class="vs-code-s">const</span> axios = <span class="vs-code-s">require</span>(<span class="vs-code-str">'axios'</span>);
axios.get(<span class="vs-code-str">'https://tosslib.com/api'</span>);</code></pre>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RECOMMENDED_QUESTIONS, matchAssistantReply } from '../../data/assistantDemo.js'

const router = useRouter()
const draft = ref('')
const thinking = ref(false)
const activeId = ref(1)
const chatBox = ref(null)

let msgSeq = 0
let chatSeq = 2

const conversations = ref([
  { id: 1, title: 'Java 加密库选型' },
  { id: 2, title: 'OpenSSL 高危漏洞查询' },
])

const messages = ref([
  {
    id: 0,
    role: 'assistant',
    text: '你好！我是可信开源代码库的 AI 助手，已连接平台内软件与组件数据。试试下方推荐问题，或直接提问。',
  },
])

const recommendedQuestions = computed(() =>
  RECOMMENDED_QUESTIONS.map((q) => ({ id: q.id, text: q.text })),
)

function scrollBottom() {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function startNewChat() {
  const t = draft.value.trim() || '新对话'
  chatSeq += 1
  conversations.value.unshift({ id: chatSeq, title: t.slice(0, 12) })
  activeId.value = chatSeq
  messages.value = []
  draft.value = ''
}

function switchChat(id) {
  activeId.value = id
  messages.value = []
  draft.value = ''
}

async function sendQuestion(text) {
  draft.value = text
  await send()
}

async function send() {
  const q = draft.value.trim()
  if (!q || thinking.value) return
  msgSeq += 1
  messages.value.push({ id: msgSeq, role: 'user', text: q })
  draft.value = ''
  thinking.value = true
  scrollBottom()
  const reply = matchAssistantReply(q)
  await new Promise((r) => setTimeout(r, 700))
  thinking.value = false
  msgSeq += 1
  messages.value.push({
    id: msgSeq,
    role: 'assistant',
    text: reply.text.replace(/\n/g, '<br/>') || '相关条目如下，点击卡片可查看详情。',
    cards: reply.cards || [],
  })
  scrollBottom()
}

function openCard(card) {
  if (card.kind === 'software') {
    router.push({ name: 'software-detail', query: { name: card.name } })
  } else {
    router.push({ name: 'component-detail', params: { id: card.componentId || card.name } })
  }
}

onMounted(() => {
  scrollBottom()
})
</script>

<style scoped>
.vscode-demo {
  display: flex;
  height: calc(100vh - 64px);
  min-height: 520px;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  border-radius: 10px;
  overflow: hidden;
}

/* ===== 活动栏 ===== */
.vs-activitybar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 48px;
  flex-shrink: 0;
  padding: 8px 0;
  background: #333333;
}
.vs-activitybar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 40px;
  color: #858585;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.vs-activitybar-item:hover { color: #cccccc; }
.vs-activitybar-item--active { color: #ffffff; border-left-color: #ffffff; }
.vs-act-ico { width: 22px; height: 22px; }
.vs-activitybar-spacer { flex: 1; }

/* ===== 侧边栏 ===== */
.vs-sidebar {
  display: flex;
  flex-direction: column;
  width: 380px;
  flex-shrink: 0;
  background: #252526;
  border-right: 1px solid #1b1b1b;
}
.vs-sidebar-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #1b1b1b;
}
.vs-sidebar-title { font-size: 12px; font-weight: 600; color: #cccccc; white-space: nowrap; }
.vs-new-btn {
  border: none;
  background: #0e639c;
  color: #fff;
  font-size: 11px;
  font-family: inherit;
  padding: 3px 10px;
  border-radius: 3px;
  cursor: pointer;
}
.vs-new-btn:hover { background: #1177bb; }

.vs-history {
  padding: 8px 10px;
  border-bottom: 1px solid #1b1b1b;
}
.vs-history-label { margin: 0 0 6px; font-size: 10px; text-transform: uppercase; color: #6f6f6f; }
.vs-history-item {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: #bbbbbb;
  font-size: 12px;
  font-family: inherit;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vs-history-item:hover { background: #2a2d2e; }
.vs-history-item.is-active { background: #37373d; color: #ffffff; }

/* ===== 对话区 ===== */
.vs-chat {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.vs-welcome-title { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #e7e7e7; }
.vs-welcome-body { margin: 0; font-size: 12px; line-height: 1.7; color: #a0a0a0; }
.vs-suggest-label { margin: 8px 0 6px; font-size: 11px; font-weight: 600; color: #9d9d9d; }
.vs-suggest-list { display: flex; flex-direction: column; gap: 6px; }
.vs-suggest-item {
  text-align: left;
  border: 1px solid #3c3c3c;
  background: #2d2d2d;
  color: #d4d4d4;
  font-size: 12px;
  font-family: inherit;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.5;
}
.vs-suggest-item:hover { border-color: #007acc; color: #ffffff; }

.vs-msg { display: flex; gap: 8px; }
.vs-msg--user { flex-direction: row-reverse; }
.vs-msg-avatar {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.vs-msg--assistant .vs-msg-avatar { background: #0e639c; color: #fff; }
.vs-msg--user .vs-msg-avatar { background: #3a3d41; color: #ccc; }
.vs-msg-body { flex: 1; min-width: 0; }
.vs-msg-text { margin: 0; font-size: 12px; line-height: 1.7; color: #d4d4d4; word-break: break-word; }
.vs-cards { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.vs-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 4px 8px;
  align-items: center;
  text-align: left;
  border: 1px solid #3c3c3c;
  background: #2d2d2d;
  color: #d4d4d4;
  font-family: inherit;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.vs-card:hover { border-color: #007acc; }
.vs-card-kind { grid-row: span 2; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
.vs-card-kind--software { background: #1f5c2b; color: #7ee08a; }
.vs-card-kind--component { background: #5c3a1f; color: #e0b47e; }
.vs-card-name { font-size: 12px; font-weight: 600; color: #e7e7e7; }
.vs-card-ver { font-size: 11px; color: #9d9d9d; }
.vs-card-meta { grid-column: 2 / 3; font-size: 11px; color: #a0a0a0; }
.vs-thinking { font-size: 12px; color: #9d9d9d; }
.vs-dots { animation: vs-blink 1s infinite steps(1); }
@keyframes vs-blink { 50% { opacity: 0; } }

/* ===== 输入区 ===== */
.vs-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #1b1b1b;
  background: #252526;
}
.vs-input {
  flex: 1;
  resize: none;
  border: 1px solid #3c3c3c;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px 10px;
  border-radius: 4px;
  outline: none;
}
.vs-input:focus { border-color: #007acc; }
.vs-input::placeholder { color: #6f6f6f; }
.vs-send {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 4px;
  background: #0e639c;
  color: #fff;
  cursor: pointer;
}
.vs-send:disabled { background: #3a3d41; color: #6f6f6f; cursor: not-allowed; }
.vs-send-ico { width: 16px; height: 16px; }

/* ===== 编辑器占位 ===== */
.vs-editor {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}
.vs-editor-tabs { display: flex; background: #252526; border-bottom: 1px solid #1b1b1b; }
.vs-editor-tab {
  padding: 8px 16px;
  font-size: 12px;
  color: #6f6f6f;
  border-right: 1px solid #1b1b1b;
}
.vs-editor-tab.is-active { background: #1e1e1e; color: #e7e7e7; }
.vs-code {
  flex: 1;
  margin: 0;
  padding: 20px 24px;
  font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #d4d4d4;
  overflow: auto;
}
.vs-code-c { color: #6a9955; }
.vs-code-k { color: #569cd6; }
.vs-code-s { color: #c586c0; }
.vs-code-str { color: #ce9178; }
</style>
