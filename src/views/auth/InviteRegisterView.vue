<template>
  <div class="inv-page">
    <div class="inv-card">
      <!-- 品牌区 -->
      <header class="inv-brand">
        <span class="inv-logo" aria-hidden="true">可信</span>
        <div class="inv-brand-text">
          <h1 class="inv-brand-title">可信开源代码库</h1>
          <p class="inv-brand-sub">邀请注册</p>
        </div>
      </header>

      <!-- 链接不可用：不存在 / 已撤销 / 已过期 / 已用尽 -->
      <div v-if="!valid" class="inv-invalid">
        <span class="inv-invalid-ico" aria-hidden="true">!</span>
        <h2 class="inv-invalid-title">邀请链接不可用</h2>
        <p class="inv-invalid-reason">{{ invalidReason }}</p>
        <p class="inv-invalid-hint">
          请向邀请人确认后获取新的邀请链接。若已有账号，可直接登录平台。
        </p>
      </div>

      <!-- 注册成功 -->
      <div v-else-if="done" class="inv-success">
        <span class="inv-success-ico" aria-hidden="true">✓</span>
        <h2 class="inv-success-title">注册成功</h2>
        <p class="inv-success-desc">
          账号 <strong>{{ createdUser.name }}</strong>（{{ createdUser.email }}）已创建，
          并已加入 <strong>{{ invite.orgName }}</strong>。
        </p>
        <dl class="inv-summary">
          <div class="inv-summary-row">
            <dt>平台角色</dt>
            <dd>{{ roleName }}</dd>
          </div>
          <div v-if="postsText" class="inv-summary-row">
            <dt>覆盖岗位</dt>
            <dd>{{ postsText }}</dd>
          </div>
        </dl>
        <p class="inv-success-hint">后续可由组织管理员在组织管理中调整你在组织内的权限。</p>
      </div>

      <!-- 正常注册表单 -->
      <div v-else class="inv-form-wrap">
        <!-- 邀请信息 -->
        <section class="inv-invite-info">
          <p class="inv-invite-tip">你被 <strong>{{ invite.createdBy }}</strong> 邀请加入：</p>
          <dl class="inv-summary">
            <div class="inv-summary-row">
              <dt>加入组织</dt>
              <dd>{{ invite.orgName }}</dd>
            </div>
            <div class="inv-summary-row">
              <dt>平台角色</dt>
              <dd>{{ roleName }}</dd>
            </div>
            <div v-if="postsText" class="inv-summary-row">
              <dt>覆盖岗位</dt>
              <dd>{{ postsText }}</dd>
            </div>
            <div class="inv-summary-row">
              <dt>有效期</dt>
              <dd>{{ invite.expiresAt ? `至 ${invite.expiresAt}` : '永久有效' }}</dd>
            </div>
            <div class="inv-summary-row">
              <dt>剩余次数</dt>
              <dd>{{ invite.maxUses > 0 ? `${invite.maxUses - invite.usedCount} 次` : '不限次数' }}</dd>
            </div>
          </dl>
        </section>

        <!-- 填写资料 -->
        <form class="inv-form" @submit.prevent="submit">
          <div class="inv-field">
            <label class="inv-label" for="inv-name">姓名 <span class="inv-req">*</span></label>
            <input id="inv-name" v-model.trim="form.name" type="text" class="inv-input" placeholder="请输入真实姓名" />
          </div>
          <div class="inv-field">
            <label class="inv-label" for="inv-email">邮箱 <span class="inv-req">*</span></label>
            <input id="inv-email" v-model.trim="form.email" type="email" class="inv-input" placeholder="用于登录与接收通知" />
          </div>
          <div class="inv-field">
            <label class="inv-label" for="inv-phone">手机号</label>
            <input id="inv-phone" v-model.trim="form.phone" type="tel" class="inv-input" placeholder="选填" />
          </div>

          <p v-if="error" class="inv-error">{{ error }}</p>

          <button type="submit" class="inv-submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '完成注册' }}
          </button>
          <p class="inv-form-hint">提交即表示同意平台服务条款与隐私政策。</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  validateInvite,
  acceptInvite,
} from '../../data/inviteData.js'
import { PLATFORM_ROLES } from '../../data/permissionData.js'

const route = useRoute()
const token = computed(() => {
  const t = route.params.token
  return Array.isArray(t) ? t[0] : (t || '')
})

const check = validateInvite(token.value)
const valid = ref(check.ok)
const invalidReason = ref(check.reason || '')
const invite = ref(check.invite)

const form = reactive({ name: '', email: '', phone: '' })
const error = ref('')
const submitting = ref(false)
const done = ref(false)
const createdUser = ref({})

/** 邀请预设的平台角色（多选），展示为「角色A、角色B」 */
const roleName = computed(() => {
  const ids = invite.value?.platformRoles || []
  const names = ids.map((id) => PLATFORM_ROLES.find((r) => r.id === id)?.name).filter(Boolean)
  return names.length ? names.join('、') : '—'
})
/** 各角色覆盖岗位的并集（仅作说明展示） */
const postsText = computed(() => {
  const ids = invite.value?.platformRoles || []
  const all = ids.flatMap((id) => PLATFORM_ROLES.find((r) => r.id === id)?.posts || [])
  return [...new Set(all)].join('、')
})

function submit() {
  error.value = ''
  if (!form.name) { error.value = '请填写姓名'; return }
  if (!form.email) { error.value = '请填写邮箱'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { error.value = '邮箱格式不正确'; return }

  submitting.value = true
  const res = acceptInvite(token.value, { ...form })
  submitting.value = false

  if (!res.ok) {
    // 链接可能在填写期间失效（被撤销 / 次数被别人用尽 / 过期）
    const again = validateInvite(token.value)
    if (!again.ok) {
      valid.value = false
      invalidReason.value = again.reason
      return
    }
    error.value = res.reason
    return
  }
  createdUser.value = res.user
  invite.value = res.invite
  done.value = true
}
</script>

<style scoped>
.inv-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(160deg, #f6f7f9 0%, #eef1f5 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
}
.inv-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

/* ===== 品牌区 ===== */
.inv-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid #f0f1f3;
}
.inv-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: #da203e;
  border-radius: 9px;
  flex-shrink: 0;
}
.inv-brand-title { margin: 0; font-size: 16px; font-weight: 600; color: #111827; }
.inv-brand-sub { margin: 2px 0 0; font-size: 12px; color: #9ca3af; }

/* ===== 邀请信息 / 结果摘要 ===== */
.inv-form-wrap { padding: 20px 28px 28px; }
.inv-invite-info {
  padding: 14px 16px;
  background: #f9fafb;
  border: 1px solid #eef0f3;
  border-radius: 10px;
}
.inv-invite-tip { margin: 0 0 10px; font-size: 13px; color: #374151; }
.inv-summary { margin: 0; display: flex; flex-direction: column; gap: 6px; }
.inv-summary-row { display: flex; gap: 10px; font-size: 13px; }
.inv-summary-row dt { width: 76px; flex-shrink: 0; color: #9ca3af; }
.inv-summary-row dd { margin: 0; color: #1f2937; font-weight: 500; }

/* ===== 表单 ===== */
.inv-form { margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
.inv-field { display: flex; flex-direction: column; gap: 6px; }
.inv-label { font-size: 13px; font-weight: 500; color: #374151; }
.inv-req { color: #da203e; }
.inv-input {
  height: 38px;
  padding: 0 12px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.inv-input:focus { border-color: #da203e; box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.08); }
.inv-input::placeholder { color: #9ca3af; }
.inv-error {
  margin: 0;
  padding: 9px 12px;
  font-size: 13px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}
.inv-submit {
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: #da203e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.inv-submit:hover:not(:disabled) { background: #c11b36; }
.inv-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.inv-form-hint { margin: 0; font-size: 12px; color: #9ca3af; text-align: center; }

/* ===== 链接不可用 ===== */
.inv-invalid,
.inv-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 28px 40px;
  text-align: center;
}
.inv-invalid-ico,
.inv-success-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 14px;
  font-size: 22px;
  font-weight: 700;
  border-radius: 50%;
}
.inv-invalid-ico { color: #b91c1c; background: #fee2e2; }
.inv-success-ico { color: #166534; background: #dcfce7; }
.inv-invalid-title,
.inv-success-title { margin: 0 0 8px; font-size: 17px; font-weight: 600; color: #111827; }
.inv-invalid-reason {
  margin: 0 0 10px;
  font-size: 14px;
  color: #b91c1c;
  font-weight: 500;
}
.inv-invalid-hint { margin: 0; font-size: 13px; line-height: 1.7; color: #6b7280; }

/* ===== 注册成功 ===== */
.inv-success-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
}
.inv-success .inv-summary {
  width: 100%;
  max-width: 300px;
  padding: 14px 16px;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #eef0f3;
  border-radius: 10px;
}
.inv-success-hint { margin: 16px 0 0; font-size: 12px; color: #9ca3af; }
</style>
