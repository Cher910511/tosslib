<template>
  <div class="sbom-ana">
    <!-- ==================== 分析任务列表 ==================== -->
    <template v-if="!selected">
      <div class="sba-page-hd">
        <h1 class="sba-title">
          <span class="sba-title-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>
          </span>
          详情分析
        </h1>
        <p class="sba-desc">实时监控任务进度 · 查询浏览已经生成的 SBOM 记录与分析详情</p>
      </div>

      <!-- 筛选查询区 -->
      <div class="sba-card sba-filter-card">
        <div class="sba-filter-row">
          <input v-model="listFilters.name" type="text" class="sba-f-input" placeholder="项目名称（模糊搜索）" />
          <select v-model="listFilters.sourceType" class="sba-f-select">
            <option value="">来源类型：全部</option>
            <option value="upload">文件上传</option>
          </select>
          <select v-model="listFilters.status" class="sba-f-select">
            <option value="">状态：全部</option>
            <option value="success">成功</option>
            <option value="processing">PROCESSING</option>
            <option value="failed">失败</option>
          </select>
          <div class="sba-f-range">
            <span class="sba-f-label">创建时间</span>
            <input v-model="listFilters.dateFrom" type="date" class="sba-f-date" aria-label="创建时间开始" />
            <span class="sba-f-sep">至</span>
            <input v-model="listFilters.dateTo" type="date" class="sba-f-date" aria-label="创建时间结束" />
          </div>
          <button type="button" class="sba-f-btn" @click="applyListFilter">查询</button>
          <button type="button" class="sba-f-reset" @click="resetListFilter">重置</button>
        </div>
      </div>

      <!-- 数据列表 -->
      <div class="sba-card">
        <div v-if="filteredRecords.length === 0" class="sba-empty">
          <p class="sba-empty-text">没有匹配的分析记录</p>
          <RouterLink class="sba-empty-btn" :to="{ name: 'sbom-generate' }">去生成</RouterLink>
        </div>

        <template v-else>
          <div class="sba-table-wrap">
            <table class="sba-table sba-table--list">
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th class="sba-center">来源类型</th>
                  <th class="sba-center">状态</th>
                  <th class="sba-center">组件数</th>
                  <th>创建时间</th>
                  <th class="sba-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in pagedRecords" :key="r.id">
                  <td class="sba-name-cell" :title="r.name">
                    <button type="button" class="sba-project-link" @click="select(r.id)">
                      {{ r.name }}
                    </button>
                  </td>
                  <td class="sba-center sba-muted">{{ sourceTypeLabel(r.sourceType) }}</td>
                  <td class="sba-center">
                    <span v-if="r.status === 'processing'" class="sba-status sba-status--processing">
                      PROCESSING
                    </span>
                    <span v-else-if="r.status === 'failed'" class="sba-status sba-status--failed">失败</span>
                    <span v-else class="sba-status sba-status--success">成功</span>
                  </td>
                  <td class="sba-center">{{ r.components.length }}</td>
                  <td class="sba-muted sba-nowrap">{{ r.createdAt }}</td>
                  <td class="sba-center">
                    <div class="sba-row-actions">
                      <button type="button" class="sba-reanalyze-btn" @click="reanalyzeRecord(r)">
                        重新分析
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="listTotalPages > 1" class="sba-pager">
            <template v-for="(p, i) in pageItems(listPage, listTotalPages)" :key="i">
              <span v-if="p === '...'" class="sba-page-ellipsis">…</span>
              <button
                v-else
                type="button"
                class="sba-page-btn"
                :class="{ 'is-active': p === listPage }"
                @click="listPage = p"
              >
                {{ p }}
              </button>
            </template>
            <button
              type="button"
              class="sba-page-next"
              :disabled="listPage >= listTotalPages"
              @click="listPage = Math.min(listPage + 1, listTotalPages)"
            >
              下一页 &gt;
            </button>
          </div>
        </template>
      </div>
    </template>

    <!-- ==================== 分析结果 ==================== -->
    <template v-else>
      <!-- 1. 顶部信息与操作区 -->
      <div class="sba-top">
        <div class="sba-top-left">
          <button type="button" class="sba-back" @click="backToList">← 返回记录</button>
          <h1 class="sba-top-title">
            分析结果 <span class="sba-top-dash">—</span>
            <span class="sba-top-name">{{ selected.name }}-{{ selected.version }}</span>
          </h1>
          <p class="sba-top-meta">
            识别组件：<strong>{{ selected.components.length }}</strong> 个
            <span class="sba-dot">·</span>
            <span class="sba-spec">{{ selected.spec }} {{ selected.specVersion }}</span>
            <span class="sba-dot">·</span>
            {{ selected.fileName }}（{{ selected.fileSize }}）
            <span class="sba-dot">·</span>
            {{ selected.createdAt }}
          </p>
        </div>

        <div class="sba-top-actions">
          <button type="button" class="sba-btn sba-btn--ghost" @click="downloadSbom">下载 SBOM</button>
          <button type="button" class="sba-btn sba-btn--ghost" :disabled="reanalyzing" @click="reanalyze">
            {{ reanalyzing ? '分析中…' : '重新分析' }}
          </button>
          <div class="sba-report" ref="reportRef">
            <button type="button" class="sba-btn sba-btn--primary" @click="reportOpen = !reportOpen">
              分析报告
              <span class="sba-caret">▾</span>
            </button>
            <Transition name="sba-fade">
              <div v-if="reportOpen" class="sba-menu">
                <button type="button" class="sba-menu-item" @click="pickReport('在线查看')">在线查看报告</button>
                <button type="button" class="sba-menu-item" @click="pickReport('PDF')">导出 PDF</button>
                <button type="button" class="sba-menu-item" @click="pickReport('Word')">导出 Word</button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 明细切换：仅保留 原始内容 / 组件 / 漏洞 / 许可证 -->
      <div class="sba-tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          class="sba-tab"
          :class="{ 'is-active': tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.label }}
          <span v-if="t.count !== null" class="sba-tab-num">{{ t.count }}</span>
        </button>
      </div>

      <!-- 5. SBOM 原始内容 -->
      <div v-show="tab === 'raw'" class="sba-raw">
        <div class="sba-raw-hd">
          <span class="sba-raw-title">SBOM 原始内容</span>
          <span class="sba-raw-format">{{ currentFormatLabel }}</span>
        </div>
        <pre class="sba-code"><code v-html="highlighted" /></pre>
      </div>

      <!-- 明细区 -->
      <!-- 组件清单 -->
      <div v-show="tab === 'components'" class="sba-card">
        <!-- 顶部统计与筛选 -->
        <div class="sba-comp-hd">
          <div class="sba-comp-stat">
            <p class="sba-comp-count">
              共 <strong>{{ filteredComponents.length }}</strong> 个组件
              <span class="sba-comp-page-info">（第 {{ safePage }}/{{ totalPages }} 页）</span>
            </p>
            <div class="sba-comp-tags">
              <span class="sba-comp-tag">
                语言：<strong>{{ topLanguage.name }} {{ topLanguage.count }} ({{ topLanguage.pct }}%)</strong>
              </span>
              <span class="sba-comp-tag">
                依赖类型：<strong>{{ topDepType.name }} {{ topDepType.count }} ({{ topDepType.pct }}%)</strong>
              </span>
            </div>
          </div>

          <div class="sba-comp-filters">
            <select v-model="filters.type" class="sba-filter">
              <option value="">类型</option>
              <option v-for="v in typeOptions" :key="v" :value="v">{{ v }}</option>
            </select>
            <select v-model="filters.language" class="sba-filter">
              <option value="">语言</option>
              <option v-for="v in languageOptions" :key="v" :value="v">{{ v }}</option>
            </select>
            <select v-model="filters.depType" class="sba-filter">
              <option value="">依赖</option>
              <option v-for="v in depTypeOptions" :key="v.value" :value="v.value">{{ v.label }}</option>
            </select>
            <select v-model="filters.license" class="sba-filter">
              <option value="">许可证</option>
              <option
                v-for="opt in licenseFilterOptions"
                :key="opt.value"
                :value="opt.value"
              >{{ opt.label }}</option>
            </select>
            <input
              v-model="filters.keyword"
              type="text"
              class="sba-search"
              placeholder="搜索组件名称..."
            />
          </div>
        </div>

        <!-- 表格 -->
        <div class="sba-table-wrap">
          <table class="sba-table sba-table--comp">
            <thead>
              <tr>
                <th>组件名称</th>
                <th>版本</th>
                <th>类型</th>
                <th>语言</th>
                <th>依赖类型</th>
                <th>许可证</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in pagedComponents" :key="c.purl">
                <td class="sba-comp-name">
                  <span class="sba-strong">{{ c.name }}</span>
                  <span v-if="c.verified" class="sba-verified-dot" title="已认证组件" />
                </td>
                <td class="sba-muted">{{ c.version }}</td>
                <td class="sba-muted">{{ c.type }}</td>
                <td class="sba-muted">{{ c.language || '-' }}</td>
                <td class="sba-muted">{{ depTypeLabel(c.depType) }}</td>
                <td>
                  <span v-if="c.license" class="sba-license" :class="licenseClass(c.license)">
                    {{ c.license }}
                  </span>
                  <span v-else class="sba-muted">-</span>
                </td>
              </tr>
              <tr v-if="pagedComponents.length === 0">
                <td colspan="6" class="sba-comp-empty">没有匹配的组件</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="sba-pager">
          <template v-for="(p, i) in pageItems(safePage, totalPages)" :key="i">
            <span v-if="p === '...'" class="sba-page-ellipsis">…</span>
            <button
              v-else
              type="button"
              class="sba-page-btn"
              :class="{ 'is-active': p === safePage }"
              @click="compPage = p"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="sba-page-next"
            :disabled="safePage >= totalPages"
            @click="compPage = Math.min(safePage + 1, totalPages)"
          >
            下一页 &gt;
          </button>
        </div>
      </div>

      <!-- 许可证 -->
      <div v-show="tab === 'license'" class="sba-lic">
        <!-- 概览 -->
        <div class="sba-card sba-lic-ov">
          <div class="sba-lic-bar">
            <div
              class="sba-lic-seg sba-lic-seg--ok"
              :style="{ flex: licOverview.permissiveComponents || 0.001 }"
            >{{ licOverview.permissiveTypes }}</div>
            <div
              class="sba-lic-seg sba-lic-seg--unknown"
              :style="{ flex: licOverview.unknownComponents || 0.001 }"
            >{{ licOverview.unknownTypes }}</div>
          </div>
          <div class="sba-lic-legend">
            <span class="sba-legend-item">
              <span class="sba-legend-dot sba-legend-dot--ok" />
              宽松 {{ licOverview.permissiveTypes }}
            </span>
            <span class="sba-legend-item">
              <span class="sba-legend-dot sba-legend-dot--unknown" />
              未知 {{ licOverview.unknownTypes }}
            </span>
          </div>
          <p class="sba-lic-summary">
            共 {{ licDetails.length }} 种许可证、{{ licOverview.knownComponents }} 个组件持有明确许可证；
            另有 {{ licOverview.unknownComponents }} 个组件许可证未知或无许可证
          </p>
        </div>

        <!-- 许可证表格 -->
        <div class="sba-card">
          <div class="sba-table-wrap">
            <table class="sba-table sba-table--lic">
              <thead>
                <tr>
                  <th>风险等级</th>
                  <th>许可证</th>
                  <th>许可证全名</th>
                  <th>许可证类型</th>
                  <th class="sba-center">OSI认证</th>
                  <th class="sba-center">FSF许可</th>
                  <th class="sba-center">SPDX收录</th>
                  <th class="sba-center">GPL兼容</th>
                  <th class="sba-center">开源组件</th>
                  <th class="sba-center">占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in licDetails" :key="l.name">
                  <td>
                    <span class="sba-risk" :class="riskClass(l.risk)">{{ l.risk }}</span>
                  </td>
                  <td>
                    <button type="button" class="sba-lic-link" @click="openLicense(l.name)">
                      {{ l.name }}
                    </button>
                  </td>
                  <td class="sba-muted">{{ l.fullName }}</td>
                  <td class="sba-muted">{{ l.type }}</td>
                  <td class="sba-center">
                    <svg v-if="l.osi" class="sba-cert sba-cert--ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span v-else class="sba-muted">-</span>
                  </td>
                  <td class="sba-center">
                    <svg v-if="l.fsf" class="sba-cert sba-cert--ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span v-else class="sba-muted">-</span>
                  </td>
                  <td class="sba-center">
                    <svg v-if="l.spdx" class="sba-cert sba-cert--ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span v-else class="sba-muted">-</span>
                  </td>
                  <td class="sba-center">
                    <svg v-if="l.gplCompat" class="sba-cert sba-cert--ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span v-else class="sba-muted">-</span>
                  </td>
                  <td class="sba-center">
                    <button type="button" class="sba-comp-count-link" @click="openLicenseComponents(l)">
                      {{ l.count }} 个组件
                    </button>
                  </td>
                  <td class="sba-center sba-strong">{{ l.pct }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 合规雷达图 -->
        <div class="sba-card sba-radar-card">
          <div class="sba-card-hd">
            <span class="sba-card-title">许可证合规解读</span>
            <button type="button" class="sba-rule-toggle" @click="ruleOpen = !ruleOpen">
              {{ ruleOpen ? '收起评分口径' : '评分口径说明' }}
              <span class="sba-rule-caret" :class="{ 'is-open': ruleOpen }">▸</span>
            </button>
          </div>
          <div v-if="ruleOpen" class="sba-rule-note">
            <p>明确度：持有明确许可证的组件占比。</p>
            <p>宽松占比：宽松型许可证在已知许可证中的占比。</p>
            <p>冲突安全度：是否同时存在强传染与弱传染许可证。</p>
            <p>专有安全度：许可证是否允许闭源分发与商业使用。</p>
            <p>传染安全度：强传染许可证对分发场景的影响程度。</p>
          </div>
          <div class="sba-radar">
            <svg :width="RADAR_SIZE" :height="RADAR_SIZE" viewBox="0 0 260 260">
              <polygon
                v-for="(g, i) in radarGrid"
                :key="'g' + i"
                :points="g"
                fill="none"
                stroke="#eceef1"
                stroke-width="1"
              />
              <line
                v-for="(a, i) in radarAxes"
                :key="'a' + i"
                :x1="RADAR_C"
                :y1="RADAR_C"
                :x2="a.x"
                :y2="a.y"
                stroke="#eceef1"
                stroke-width="1"
              />
              <polygon
                :points="radarPoints"
                fill="rgba(218,32,62,0.14)"
                stroke="#da203e"
                stroke-width="2"
              />
              <circle
                v-for="(p, i) in radarVertices"
                :key="'v' + i"
                :cx="p.x"
                :cy="p.y"
                r="3"
                fill="#da203e"
              />
              <text
                v-for="(l, i) in radarLabels"
                :key="'l' + i"
                :x="l.x"
                :y="l.y"
                :text-anchor="l.anchor"
                dominant-baseline="middle"
                class="sba-radar-label"
              >{{ l.label }} {{ l.score }}</text>
            </svg>
          </div>
        </div>

        <!-- 明细列表 -->
        <div class="sba-card">
          <div class="sba-card-hd">
            <span class="sba-card-title">许可证明细</span>
          </div>
          <div class="sba-table-wrap">
            <table class="sba-table">
              <thead>
                <tr>
                  <th>许可证</th>
                  <th>传染性</th>
                  <th class="sba-center">合规判定</th>
                  <th>义务</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in licKnown" :key="l.name">
                  <td class="sba-strong">{{ l.name }}</td>
                  <td>
                    <span class="sba-contagion">
                      <span class="sba-contagion-dot sba-contagion-dot--ok" />
                      {{ l.type === '宽松型' ? '宽松' : l.type }}
                    </span>
                  </td>
                  <td class="sba-center sba-muted">-</td>
                  <td class="sba-muted">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 互操作冲突 -->
        <div class="sba-card sba-conflict-card">
          <div class="sba-conflict-hd">互操作冲突</div>
          <p v-if="conflicts.length" class="sba-conflict-count">共 {{ conflicts.length }} 条冲突</p>

          <div v-if="conflicts.length === 0" class="sba-conflict-ok">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            未检出许可证互操作冲突
          </div>

          <div v-else class="sba-conflict-grid">
            <div v-for="c in conflicts" :key="c.id" class="sba-conflict-item">
              <div class="sba-conflict-top">
                <div class="sba-conflict-pair">
                  <template v-for="(p, i) in c.pair" :key="p">
                    <button
                      type="button"
                      class="sba-lic-link sba-lic-link--sm"
                      @click="openLicense(p)"
                    >{{ p }}</button>
                    <span v-if="i < c.pair.length - 1" class="sba-conflict-x">×</span>
                  </template>
                </div>
                <span class="sba-conflict-level">{{ c.level }}</span>
              </div>
              <p class="sba-conflict-line">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>
                {{ c.advice }}
              </p>
              <p class="sba-conflict-line">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                {{ c.action }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 漏洞 -->
      <div v-show="tab === 'vuln'" class="sba-vuln">
        <div class="sba-card">
          <div class="sba-vuln-hd">
            <div class="sba-vuln-stats">
              <span class="sba-vuln-tag sba-vuln-tag--critical">
                严重: {{ vulnStats.critical }}
              </span>
              <span class="sba-vuln-tag sba-vuln-tag--high">
                高危: {{ vulnStats.high }}
              </span>
              <span class="sba-vuln-tag sba-vuln-tag--medium">
                中危: {{ vulnStats.medium }}
              </span>
              <span class="sba-vuln-tag sba-vuln-tag--low">
                低危: {{ vulnStats.low }}
              </span>
            </div>
          </div>

          <div v-if="selected.vulnerabilities.length === 0" class="sba-empty">
            <p class="sba-empty-text">未发现已知漏洞</p>
          </div>
          <template v-else>
            <div class="sba-table-wrap">
              <table class="sba-table sba-table--vuln">
                <thead>
                  <tr>
                    <th>组件名称</th>
                    <th>版本</th>
                    <th>CVE 编号</th>
                    <th>严重程度</th>
                    <th class="sba-center">CVSS 评分</th>
                    <th class="sba-center">可利用性</th>
                    <th class="sba-center">修复版本</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in pagedVulns" :key="v.cve">
                    <td class="sba-strong">{{ v.component }}</td>
                    <td class="sba-muted">{{ v.version }}</td>
                    <td>
                      <button type="button" class="sba-cve-link" @click="openVuln(v)">
                        {{ v.cve }}
                      </button>
                    </td>
                    <td>
                      <span class="sba-sev" :class="'sba-sev--' + v.level">{{ v.levelLabel }}</span>
                    </td>
                    <td class="sba-center sba-cvss" :class="'sba-cvss--' + v.level">{{ v.cvss }}</td>
                    <td class="sba-center sba-muted">{{ v.exploit || '-' }}</td>
                    <td class="sba-center">
                      <span v-if="v.fixVersion" class="sba-fix-ver">{{ v.fixVersion }}</span>
                      <span v-else class="sba-muted">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="vulnTotalPages > 1" class="sba-pager">
              <template v-for="(p, i) in pageItems(vulnPage, vulnTotalPages)" :key="i">
                <span v-if="p === '...'" class="sba-page-ellipsis">…</span>
                <button
                  v-else
                  type="button"
                  class="sba-page-btn"
                  :class="{ 'is-active': p === vulnPage }"
                  @click="vulnPage = p"
                >
                  {{ p }}
                </button>
              </template>
              <button
                type="button"
                class="sba-page-next"
                :disabled="vulnPage >= vulnTotalPages"
                @click="vulnPage = Math.min(vulnPage + 1, vulnTotalPages)"
              >
                下一页 &gt;
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- ==================== 许可证详情弹窗 ==================== -->
    <Transition name="sba-modal">
      <div v-if="licenseInfo" class="sba-modal-mask" @click.self="closeLicense">
        <div class="sba-modal">
          <div class="sba-modal-hd">
            <h3 class="sba-modal-title">许可证详情: {{ licenseInfo.name }}</h3>
            <button type="button" class="sba-modal-close" @click="closeLicense">×</button>
          </div>

          <div class="sba-modal-body">
            <!-- SPDX ID -->
            <div class="sba-mf">
              <span class="sba-mf-label">SPDX ID</span>
              <span class="sba-mf-value"><code>{{ licenseInfo.spdxId }}</code></span>
            </div>

            <!-- 名称 -->
            <div class="sba-mf">
              <span class="sba-mf-label">名称</span>
              <span class="sba-mf-value">{{ licenseInfo.fullName }}</span>
            </div>

            <!-- 风险级别 -->
            <div class="sba-mf">
              <span class="sba-mf-label">风险级别</span>
              <span class="sba-mf-value">
                <span class="sba-mf-risk" :class="riskClass(licenseInfo.risk)">
                  {{ licenseInfo.riskLabel }}
                </span>
              </span>
            </div>

            <!-- 认证状态 -->
            <div class="sba-mf">
              <span class="sba-mf-label">认证状态</span>
              <span class="sba-mf-value sba-mf-certs">
                <span v-for="c in certList" :key="c.key" class="sba-mf-cert" :class="{ 'is-off': !c.ok }">
                  <svg v-if="c.ok" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else class="sba-mf-cert-no">-</span>
                  {{ c.label }}
                </span>
              </span>
            </div>

            <!-- 分类 -->
            <div class="sba-mf">
              <span class="sba-mf-label">分类</span>
              <span class="sba-mf-value">{{ licenseInfo.category }}</span>
            </div>

            <!-- 发布年份 -->
            <div class="sba-mf">
              <span class="sba-mf-label">发布年份</span>
              <span class="sba-mf-value">{{ licenseInfo.year || '-' }}</span>
            </div>

            <!-- 所有者 -->
            <div class="sba-mf">
              <span class="sba-mf-label">所有者</span>
              <span class="sba-mf-value">{{ licenseInfo.owner }}</span>
            </div>

            <!-- SPDX 页面 -->
            <div class="sba-mf">
              <span class="sba-mf-label">SPDX 页面</span>
              <span class="sba-mf-value">
                <a v-if="licenseInfo.spdxUrl" :href="licenseInfo.spdxUrl" target="_blank" rel="noopener" class="sba-mf-link">
                  {{ licenseInfo.spdxUrl }}
                </a>
                <span v-else>-</span>
              </span>
            </div>

            <!-- 摘要 -->
            <details class="sba-mf-sec" open>
              <summary>摘要</summary>
              <p>{{ licenseInfo.summaryEn }}</p>
            </details>

            <!-- 中文摘要 -->
            <details class="sba-mf-sec" open>
              <summary>中文摘要</summary>
              <p>{{ licenseInfo.summaryZh }}</p>
            </details>

            <!-- 义务清单 -->
            <details class="sba-mf-sec" open>
              <summary>义务清单 ({{ licenseInfo.obligations.length }} 条)</summary>
              <ul class="sba-obligations">
                <li v-for="(o, i) in licenseInfo.obligations" :key="i" :class="'is-' + o.level">
                  <span class="sba-ob-icon">
                    <svg v-if="o.level === 'can'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg v-else-if="o.level === 'cannot'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <span v-else class="sba-ob-must">!</span>
                  </span>
                  <span class="sba-ob-prefix">{{ o.level === 'can' ? '可以' : o.level === 'cannot' ? '不可' : '必须' }}:</span>
                  <span class="sba-ob-text">{{ o.text }}</span>
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ==================== 漏洞详情弹窗 ==================== -->
    <Transition name="sba-modal">
      <div v-if="vulnInfo" class="sba-modal-mask" @click.self="closeVuln">
        <div class="sba-modal">
          <div class="sba-modal-hd">
            <h3 class="sba-modal-title">漏洞详情: {{ vulnInfo.cve }}</h3>
            <button type="button" class="sba-modal-close" @click="closeVuln">×</button>
          </div>

          <div class="sba-modal-body">
            <div class="sba-mf">
              <span class="sba-mf-label">CVE</span>
              <span class="sba-mf-value"><code>{{ vulnInfo.cve }}</code></span>
            </div>

            <div class="sba-mf">
              <span class="sba-mf-label">严重度</span>
              <span class="sba-mf-value">
                <span class="sba-sev" :class="'sba-sev--' + vulnInfo.level">
                  {{ severityText }}
                </span>
              </span>
            </div>

            <div class="sba-mf">
              <span class="sba-mf-label">CVSS</span>
              <span class="sba-mf-value">{{ vulnInfo.cvss }}</span>
            </div>

            <div class="sba-mf">
              <span class="sba-mf-label">CWE</span>
              <span class="sba-mf-value">{{ vulnInfo.cwe || '-' }}</span>
            </div>

            <div class="sba-mf">
              <span class="sba-mf-label">发布日期</span>
              <span class="sba-mf-value">{{ vulnInfo.published || '-' }}</span>
            </div>

            <div class="sba-mf">
              <span class="sba-mf-label">漏洞利用</span>
              <span class="sba-mf-value">{{ vulnInfo.exploited || vulnInfo.exploit || '否' }}</span>
            </div>

            <details class="sba-mf-sec" open>
              <summary>标题</summary>
              <p>{{ vulnInfo.title || '-' }}</p>
            </details>

            <details class="sba-mf-sec" open>
              <summary>中文标题</summary>
              <p>{{ vulnInfo.titleZh || '-' }}</p>
            </details>

            <details class="sba-mf-sec" open>
              <summary>描述</summary>
              <p>{{ vulnInfo.desc || '-' }}</p>
            </details>

            <details class="sba-mf-sec" open>
              <summary>修复建议</summary>
              <p>{{ vulnInfo.fix || '-' }}</p>
            </details>

            <details class="sba-mf-sec" open>
              <summary>修复建议(中文)</summary>
              <p>{{ vulnInfo.fixZh || '-' }}</p>
            </details>

            <details class="sba-mf-sec" open>
              <summary>受影响组件 ({{ affectedComponents.length }})</summary>
              <ul class="sba-affected">
                <li v-for="(a, i) in affectedComponents" :key="i">
                  {{ a.name }}
                  <span class="sba-affected-lang">({{ a.language }})</span>
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ==================== 许可证关联组件弹窗 ==================== -->
    <Transition name="sba-modal">
      <div v-if="licCompInfo" class="sba-modal-mask" @click.self="closeLicComponents">
        <div class="sba-modal sba-modal--sm">
          <div class="sba-modal-hd">
            <h3 class="sba-modal-title">
              {{ licCompInfo.name }} 组件 ({{ licCompInfo.components.length }})
            </h3>
            <button type="button" class="sba-modal-close" @click="closeLicComponents">×</button>
          </div>
          <div class="sba-modal-body">
            <ul class="sba-lic-comps">
              <li v-for="(c, i) in licCompInfo.components" :key="i">
                <span class="sba-lic-comp-name">{{ c.name }}</span>
                <span class="sba-lic-comp-ver">{{ c.version }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  sbomState,
  licenseSummary,
  licenseDetail,
  licenseScore,
  LICENSE_META,
  LICENSE_CONFLICTS,
  renderSbom,
} from '../../../data/sbomStore.js'

const route = useRoute()
const router = useRouter()

const records = computed(() => sbomState.records)
const currentId = ref(typeof route.query.id === 'string' ? route.query.id : '')
const selected = computed(() => records.value.find((r) => r.id === currentId.value) || null)

/* ---------- 任务列表：筛选 / 分页 / 操作 ---------- */
const LIST_PAGE_SIZE = 10
const listPage = ref(1)

const listFilters = reactive({
  name: '',
  sourceType: '',
  status: '',
  dateFrom: '',
  dateTo: '',
})

/* 已提交的筛选条件（点「查询」后生效） */
const appliedFilters = reactive({ ...listFilters })

function sourceTypeLabel(t) {
  return t === 'upload' ? '文件上传' : t || '-'
}

const filteredRecords = computed(() => {
  const f = appliedFilters
  const kw = f.name.trim().toLowerCase()
  return records.value.filter((r) => {
    if (kw && !String(r.name).toLowerCase().includes(kw)) return false
    if (f.sourceType && r.sourceType !== f.sourceType) return false
    if (f.status && r.status !== f.status) return false
    const day = String(r.createdAt).slice(0, 10)
    if (f.dateFrom && day < f.dateFrom) return false
    if (f.dateTo && day > f.dateTo) return false
    return true
  })
})

const listTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRecords.value.length / LIST_PAGE_SIZE)),
)

const pagedRecords = computed(() => {
  const start = (listPage.value - 1) * LIST_PAGE_SIZE
  return filteredRecords.value.slice(start, start + LIST_PAGE_SIZE)
})

function applyListFilter() {
  Object.assign(appliedFilters, listFilters)
  listPage.value = 1
}

function resetListFilter() {
  for (const k of Object.keys(listFilters)) listFilters[k] = ''
  Object.assign(appliedFilters, listFilters)
  listPage.value = 1
}

function reanalyzeRecord(r) {
  select(r.id)
}

/* 分页页码：超过 7 页时中间用省略号折叠 */
function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of list) {
    if (prev && p - prev > 1) out.push('...')
    out.push(p)
    prev = p
  }
  return out
}

const licenses = computed(() => (selected.value ? licenseSummary(selected.value) : []))

/* 明细切页：原始内容 / 组件 / 漏洞 / 许可证 */
const tab = ref('components')

const TABS = computed(() => {
  const r = selected.value
  if (!r) return []
  return [
    { key: 'raw', label: '原始内容', count: null },
    { key: 'components', label: '组件', count: r.components.length },
    { key: 'vuln', label: '漏洞', count: r.vulnerabilities.length },
    { key: 'license', label: '许可证', count: licenses.value.length },
  ]
})

/* ---------- 组件列表：筛选 / 分页 / 统计 ---------- */
const PAGE_SIZE = 10

const filters = reactive({
  type: '',
  language: '',
  depType: '',
  license: '',
  keyword: '',
})

const compPage = ref(1)

const DEP_TYPE_LABELS = { direct: '直接依赖', indirect: '间接依赖' }

function depTypeLabel(t) {
  return DEP_TYPE_LABELS[t] || t || '-'
}

function uniq(list) {
  return [...new Set(list.filter(Boolean))].sort()
}

const typeOptions = computed(() =>
  uniq((selected.value?.components || []).map((c) => c.type)),
)
const languageOptions = computed(() =>
  uniq((selected.value?.components || []).map((c) => c.language)),
)
const licenseOptions = computed(() =>
  uniq((selected.value?.components || []).map((c) => c.license)),
)
const depTypeOptions = computed(() =>
  uniq((selected.value?.components || []).map((c) => c.depType)).map((v) => ({
    value: v,
    label: depTypeLabel(v),
  })),
)

const filteredComponents = computed(() => {
  const list = selected.value?.components || []
  const kw = filters.keyword.trim().toLowerCase()
  return list.filter((c) => {
    if (filters.type && c.type !== filters.type) return false
    if (filters.language && c.language !== filters.language) return false
    if (filters.depType && c.depType !== filters.depType) return false
    if (filters.license === '__none__') {
      if (c.license) return false
    } else if (filters.license && c.license !== filters.license) {
      return false
    }
    if (kw && !String(c.name).toLowerCase().includes(kw)) return false
    return true
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredComponents.value.length / PAGE_SIZE)),
)

/* 翻页越界修正 */
const safePage = computed(() => Math.min(Math.max(compPage.value, 1), totalPages.value))

const pagedComponents = computed(() => {
  const start = (safePage.value - 1) * PAGE_SIZE
  return filteredComponents.value.slice(start, start + PAGE_SIZE)
})

/* 筛选条件变化时回到第一页 */
watch(filters, () => {
  compPage.value = 1
})

/* 顶部统计：占比最高的语言与依赖类型 */
function topStat(pick) {
  const counts = {}
  for (const c of filteredComponents.value) {
    const v = pick(c)
    if (!v) continue
    counts[v] = (counts[v] || 0) + 1
  }
  const total = filteredComponents.value.length || 1
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return { name: '-', count: 0, pct: 0 }
  const [name, count] = sorted[0]
  return { name, count, pct: Math.round((count / total) * 100) }
}

const topLanguage = computed(() => topStat((c) => c.language))
const topDepType = computed(() => {
  const s = topStat((c) => c.depType)
  return { ...s, name: depTypeLabel(s.name) }
})

/* 许可证筛选项补充「未识别」 */
const licenseFilterOptions = computed(() => {
  const opts = licenseOptions.value.map((v) => ({ value: v, label: v }))
  const hasEmpty = (selected.value?.components || []).some((c) => !c.license)
  if (hasEmpty) opts.push({ value: '__none__', label: '未识别' })
  return opts
})

/* ---------- 顶部操作 ---------- */
const reanalyzing = ref(false)
const reportOpen = ref(false)
const reportRef = ref(null)

const fileFormat = ref('spdx-json')

const fileFormats = computed(() => {
  if (!selected.value) return []
  return selected.value.spec === 'CycloneDX'
    ? [
        { value: 'cyclonedx-json', label: 'CycloneDX JSON', ext: 'cdx.json' },
        { value: 'cyclonedx-xml', label: 'CycloneDX XML', ext: 'cdx.xml' },
      ]
    : [
        { value: 'spdx-json', label: 'SPDX JSON', ext: 'spdx.json' },
        { value: 'spdx-tag', label: 'SPDX Tag-Value', ext: 'spdx' },
      ]
})

const currentFormatLabel = computed(
  () => fileFormats.value.find((f) => f.value === fileFormat.value)?.label || '',
)

watch(selected, (s) => {
  if (!s) return
  fileFormat.value = s.spec === 'CycloneDX' ? 'cyclonedx-json' : 'spdx-json'
}, { immediate: true })

const rawContent = computed(() =>
  selected.value ? renderSbom(selected.value, fileFormat.value) : '',
)

/* JSON 轻量高亮（内容由本地生成，先转义再着色） */
const highlighted = computed(() => {
  const esc = (t) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return esc(rawContent.value)
    .replace(/"([^"]+)"(\s*:)/g, '<span class="j-key">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="j-str">"$1"</span>')
    .replace(/:\s*(-?\d+(?:\.\d+)?)(\s*[,}\]])/g, ': <span class="j-num">$1</span>$2')
    .replace(/\b(true|false|null)\b/g, '<span class="j-kw">$1</span>')
})

function currentExt() {
  return fileFormats.value.find((f) => f.value === fileFormat.value)?.ext || 'txt'
}

function downloadSbom() {
  if (!selected.value) return
  const blob = new Blob([rawContent.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selected.value.name}-${selected.value.version}.${currentExt()}`
  a.click()
  URL.revokeObjectURL(url)
}

function reanalyze() {
  reanalyzing.value = true
  window.setTimeout(() => { reanalyzing.value = false }, 1200)
}

function pickReport(kind) {
  reportOpen.value = false
  // 报告导出能力待接入，先记录所选类型
  reportKind.value = kind
}

const reportKind = ref('')

/* ---------- 许可证分析 ---------- */
const licDetails = computed(() => (selected.value ? licenseDetail(selected.value) : []))
const licKnown = computed(() => licDetails.value.filter((l) => l.name !== 'unknown'))

const licOverview = computed(() => {
  const known = licDetails.value.filter((d) => d.name !== 'unknown')
  const unknown = licDetails.value.find((d) => d.name === 'unknown')
  const sum = (arr) => arr.reduce((s, d) => s + d.count, 0)
  return {
    permissiveTypes: known.filter((d) => d.type === '宽松型').length,
    unknownTypes: unknown ? 1 : 0,
    permissiveComponents: sum(known.filter((d) => d.type === '宽松型')),
    knownComponents: sum(known),
    unknownComponents: unknown ? unknown.count : 0,
  }
})

function riskClass(risk) {
  if (risk === '低' || risk === '宽松') return 'is-ok'
  if (risk === '中' || risk === '弱' || risk === '弱版权') return 'is-warn'
  if (risk === '高') return 'is-danger'
  return 'is-unknown'
}

/* ---------- 互操作冲突 ---------- */
/* 优先使用记录自带冲突数据；否则依据许可证集合判断是否同时存在弱 Copyleft */
const conflicts = computed(() => {
  const r = selected.value
  if (!r) return []
  if (Array.isArray(r.licenseConflicts)) return r.licenseConflicts
  const names = new Set((r.components || []).map((c) => c.license).filter(Boolean))
  return LICENSE_CONFLICTS.filter((c) => c.pair.every((p) => names.has(p)))
})

/* ---------- 许可证详情弹窗 ---------- */
const licenseInfo = ref(null)

const certList = computed(() => {
  const m = licenseInfo.value
  if (!m) return []
  return [
    { key: 'osi', label: 'OSI', ok: !!m.osi },
    { key: 'fsf', label: 'FSF', ok: !!m.fsf },
    { key: 'spdx', label: 'SPDX', ok: !!m.spdx },
  ]
})

function openLicense(name) {
  const meta = LICENSE_META[name] || LICENSE_META.unknown
  licenseInfo.value = {
    name,
    ...meta,
    obligations: meta.obligations || [],
  }
}

function closeLicense() {
  licenseInfo.value = null
}

/* ---------- 许可证关联组件弹窗 ---------- */
const licCompInfo = ref(null)

function openLicenseComponents(l) {
  const all = selected.value?.components || []
  const components = all.filter((c) => (c.license || 'unknown') === l.name)
  licCompInfo.value = { name: l.name, components }
}

function closeLicComponents() {
  licCompInfo.value = null
}

/* ---------- 漏洞详情弹窗 ---------- */
const vulnInfo = ref(null)

const severityText = computed(() => {
  const v = vulnInfo.value
  if (!v) return '-'
  if (v.levelLabel === 'LOW') return 'LOW'
  if (v.level === 'critical') return 'CRITICAL'
  if (v.level === 'high') return 'HIGH'
  if (v.level === 'medium') return 'MEDIUM'
  return 'LOW'
})

/* 受影响组件：同一 CVE 命中的所有组件 */
const affectedComponents = computed(() => {
  const v = vulnInfo.value
  if (!v || !selected.value) return []
  const list = selected.value.vulnerabilities.filter((x) => x.cve === v.cve)
  const components = selected.value.components || []
  return list.map((x) => {
    const c = components.find((cc) => cc.name === x.component)
    return {
      name: x.component,
      language: x.componentLanguage || c?.language || '未知',
    }
  })
})

function openVuln(v) {
  vulnInfo.value = v
}

function closeVuln() {
  vulnInfo.value = null
}

/* 合规雷达图 */
const ruleOpen = ref(false)
const RADAR_SIZE = 260
const RADAR_C = 130
const RADAR_R = 78

const radarData = computed(() => (selected.value ? licenseScore(selected.value) : []))

function radarPoint(index, ratio) {
  const angle = ((-90 + index * 72) * Math.PI) / 180
  return {
    x: RADAR_C + Math.cos(angle) * RADAR_R * ratio,
    y: RADAR_C + Math.sin(angle) * RADAR_R * ratio,
  }
}

const radarGrid = computed(() =>
  [0.25, 0.5, 0.75, 1].map((r) =>
    radarData.value
      .map((_, i) => {
        const p = radarPoint(i, r)
        return `${p.x},${p.y}`
      })
      .join(' '),
  ),
)

const radarAxes = computed(() => radarData.value.map((_, i) => radarPoint(i, 1)))

const radarVertices = computed(() =>
  radarData.value.map((d, i) => radarPoint(i, Math.max(d.score, 0) / 100)),
)

const radarPoints = computed(() =>
  radarVertices.value.map((p) => `${p.x},${p.y}`).join(' '),
)

const radarLabels = computed(() =>
  radarData.value.map((d, i) => {
    const p = radarPoint(i, 1.34)
    const anchor =
      Math.abs(p.x - RADAR_C) < 1 ? 'middle' : p.x > RADAR_C ? 'start' : 'end'
    return { x: p.x, y: p.y, anchor, label: d.label, score: d.score }
  }),
)

/* ---------- 漏洞列表 ---------- */
const VULN_PAGE_SIZE = 10
const vulnPage = ref(1)

const vulnStats = computed(() => {
  const s = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const v of selected.value?.vulnerabilities || []) {
    if (s[v.level] !== undefined) s[v.level] += 1
  }
  return s
})

const vulnTotalPages = computed(() =>
  Math.max(
    1,
    Math.ceil((selected.value?.vulnerabilities.length || 0) / VULN_PAGE_SIZE),
  ),
)

const pagedVulns = computed(() => {
  const list = selected.value?.vulnerabilities || []
  const start = (vulnPage.value - 1) * VULN_PAGE_SIZE
  return list.slice(start, start + VULN_PAGE_SIZE)
})

watch(
  () => selected.value?.id,
  () => {
    vulnPage.value = 1
  },
)

/* ---------- 许可证 ---------- */
function licenseClass(name) {
  const map = {
    'GPL-3.0': 'is-danger',
    'GPL-2.0': 'is-danger',
    'AGPL-3.0': 'is-danger',
    'LGPL-2.1': 'is-warn',
    'MPL-2.0': 'is-warn',
    'EPL-1.0': 'is-warn',
  }
  return map[name] || 'is-ok'
}

/* ---------- 选择 / 返回 ---------- */
function select(id) {
  currentId.value = id
  router.replace({ name: 'sbom-analysis', query: { id } })
  window.scrollTo({ top: 0 })
}

function backToList() {
  currentId.value = ''
  router.replace({ name: 'sbom-analysis' })
}

/* ---------- 点击外部关闭下拉 ---------- */
function onDocClick(e) {
  if (reportRef.value && !reportRef.value.contains(e.target)) reportOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.sbom-ana { display: flex; flex-direction: column; gap: 16px; }

/* 列表页 */
.sba-page-hd { margin-bottom: 4px; }
.sba-title { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sba-title-ico { display: inline-flex; align-items: center; justify-content: center; color: #da203e; }
.sba-desc { font-size: 13px; color: #8b919b; margin: 0; line-height: 1.6; max-width: 780px; }

/* ===== 筛选查询区 ===== */
.sba-filter-card { padding: 14px 16px; }
.sba-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sba-f-input { padding: 7px 11px; width: 168px; font-size: 12px; color: #111827; background: #fff; border: 1px solid #e1e4e8; border-radius: 6px; outline: none; font-family: inherit; transition: border-color .2s; box-sizing: border-box; }
.sba-f-input:focus { border-color: #da203e; }
.sba-f-input::placeholder { color: #c4c9d1; }
.sba-f-select { padding: 7px 26px 7px 11px; font-size: 12px; color: #4b5563; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 9px center; border: 1px solid #e1e4e8; border-radius: 6px; outline: none; cursor: pointer; font-family: inherit; appearance: none; -webkit-appearance: none; transition: border-color .2s; }
.sba-f-select:hover { border-color: #c9cdd4; }
.sba-f-select:focus { border-color: #da203e; }
.sba-f-range { display: flex; align-items: center; gap: 6px; }
.sba-f-date { padding: 6px 9px; font-size: 12px; color: #4b5563; background: #fff; border: 1px solid #e1e4e8; border-radius: 6px; outline: none; font-family: inherit; }
.sba-f-date:focus { border-color: #da203e; }
.sba-f-sep { font-size: 11.5px; color: #b0b5bd; }
.sba-f-label { font-size: 12px; color: #6b7280; white-space: nowrap; }
.sba-f-btn { padding: 7px 20px; font-size: 12px; font-weight: 600; color: #fff; background: #da203e; border: 1px solid #da203e; border-radius: 6px; cursor: pointer; font-family: inherit; transition: background .2s; }
.sba-f-btn:hover { background: #c01b36; }
.sba-f-reset { padding: 7px 12px; font-size: 12px; color: #9ca3af; background: none; border: none; cursor: pointer; font-family: inherit; transition: color .2s; }
.sba-f-reset:hover { color: #4b5563; }

/* ===== 任务列表 ===== */
.sba-table--list .sba-name-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sba-project-link { padding: 0; border: none; background: none; font-size: 12px; font-weight: 600; color: #111827; cursor: pointer; font-family: inherit; text-align: left; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .2s; }
.sba-project-link:hover { color: #da203e; text-decoration: underline; }
.sba-status { padding: 2px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 700; letter-spacing: .02em; white-space: nowrap; }
.sba-status--processing { color: #b8860b; background: rgba(229,168,80,0.16); }
.sba-status--success { color: #2f9e57; background: rgba(47,158,87,0.1); }
.sba-status--failed { color: #da203e; background: rgba(218,32,62,0.1); }
.sba-row-actions { display: inline-flex; align-items: center; gap: 6px; justify-content: center; }
.sba-reanalyze-btn { padding: 0 12px; height: 26px; font-size: 11.5px; font-weight: 600; color: #fff; background: #da203e; border: 1px solid #da203e; border-radius: 5px; cursor: pointer; font-family: inherit; white-space: nowrap; transition: background .2s; }
.sba-reanalyze-btn:hover { background: #c01b36; }

.sba-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.sba-card-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #f2f3f5; }
.sba-card-title { font-size: 13px; font-weight: 600; color: #374151; }
.sba-card-count { font-size: 11px; color: #b0b5bd; }

/* 明细切换由统计栏承载 */

.sba-table-wrap { overflow-x: auto; }
.sba-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.sba-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; background: #fafbfc; border-bottom: 1px solid #eef0f2; white-space: nowrap; letter-spacing: .03em; }
.sba-table td { padding: 11px 14px; border-bottom: 1px solid #f5f6f7; color: #4b5563; vertical-align: middle; }
.sba-table tbody tr:last-child td { border-bottom: none; }
.sba-table tbody tr:hover { background: #fafbfc; }
.sba-center { text-align: center !important; }
.sba-strong { font-weight: 600; color: #111827; }
.sba-muted { color: #9ca3af; }
.sba-nowrap { white-space: nowrap; }
.sba-fmt { font-size: 11px; }
.sba-id { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 11px; color: #6b7280; background: #f5f6f7; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.sba-purl { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 10px; color: #9ca3af; }
.sba-spec { font-size: 11px; font-weight: 500; color: #6b7280; background: #f5f6f7; padding: 2px 7px; border-radius: 4px; white-space: nowrap; }
.sba-link { padding: 0; border: none; background: none; font-size: 12px; font-weight: 600; color: #da203e; cursor: pointer; font-family: inherit; }
.sba-link:hover { text-decoration: underline; }
.sba-vuln-num { font-weight: 600; color: #9ca3af; }
.sba-vuln-num.is-risk { color: #e5a850; }

/* ===== 组件列表：统计与筛选 ===== */
.sba-comp-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 16px 18px; border-bottom: 1px solid #f2f3f5; flex-wrap: wrap; }
.sba-comp-stat { min-width: 0; }
.sba-comp-count { font-size: 13px; color: #4b5563; margin: 0 0 8px; }
.sba-comp-count strong { color: #111827; font-weight: 700; }
.sba-comp-page-info { font-size: 11.5px; color: #9ca3af; }
.sba-comp-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.sba-comp-tag { padding: 3px 10px; border-radius: 4px; font-size: 11px; color: #6b7280; background: #f5f6f7; }
.sba-comp-tag strong { font-weight: 600; color: #374151; }

.sba-comp-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sba-filter { padding: 6px 10px; padding-right: 24px; font-size: 12px; color: #4b5563; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 8px center; border: 1px solid #e1e4e8; border-radius: 6px; outline: none; cursor: pointer; font-family: inherit; appearance: none; -webkit-appearance: none; transition: border-color .2s; min-width: 82px; }
.sba-filter:hover { border-color: #c9cdd4; }
.sba-filter:focus { border-color: #da203e; }
.sba-search { padding: 6px 12px; width: 180px; font-size: 12px; color: #111827; background: #fff; border: 1px solid #e1e4e8; border-radius: 6px; outline: none; font-family: inherit; transition: border-color .2s; box-sizing: border-box; }
.sba-search:focus { border-color: #da203e; }
.sba-search::placeholder { color: #c4c9d1; }

/* 组件表 */
.sba-table--comp .sba-comp-name { max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sba-verified-dot { display: inline-block; width: 6px; height: 6px; margin-left: 6px; border-radius: 50%; background: #2563eb; vertical-align: middle; }
.sba-comp-empty { padding: 40px 20px !important; text-align: center; color: #b0b5bd; font-size: 12.5px; }

/* 分页 */
.sba-pager { display: flex; align-items: center; gap: 6px; padding: 14px 18px; border-top: 1px solid #f2f3f5; flex-wrap: wrap; }
.sba-page-btn { min-width: 28px; height: 28px; padding: 0 8px; font-size: 12px; font-weight: 500; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 5px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s, background .2s; }
.sba-page-btn:hover { border-color: rgba(218,32,62,0.45); color: #da203e; }
.sba-page-btn.is-active { color: #fff; background: #da203e; border-color: #da203e; font-weight: 600; }
.sba-page-ellipsis { min-width: 24px; text-align: center; font-size: 12px; color: #b0b5bd; user-select: none; }
.sba-page-next { margin-left: auto; padding: 0 12px; height: 28px; font-size: 12px; font-weight: 500; color: #6b7280; background: #fff; border: 1px solid #e5e7eb; border-radius: 5px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s; }
.sba-page-next:hover:not(:disabled) { color: #da203e; border-color: rgba(218,32,62,0.45); }
.sba-page-next:disabled { opacity: .45; cursor: not-allowed; }

.sba-empty { padding: 48px 20px; text-align: center; }
.sba-empty-text { font-size: 13px; color: #b0b5bd; margin: 0 0 12px; }
.sba-empty-btn { display: inline-block; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #da203e; border: 1px solid rgba(218,32,62,0.3); border-radius: 6px; text-decoration: none; }
.sba-empty-btn:hover { background: rgba(218,32,62,0.05); }

/* ===== 顶部信息与操作区 ===== */
.sba-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; }
.sba-top-left { min-width: 0; }
.sba-back { padding: 3px 10px; font-size: 11px; color: #9ca3af; background: #fff; border: 1px solid #eef0f2; border-radius: 5px; cursor: pointer; font-family: inherit; margin-bottom: 8px; transition: color .2s, border-color .2s; }
.sba-back:hover { color: #da203e; border-color: rgba(218,32,62,0.3); }
.sba-top-title { font-size: 19px; font-weight: 700; color: #111827; margin: 0 0 6px; letter-spacing: -.01em; }
.sba-top-dash { color: #d3d7dd; margin: 0 2px; font-weight: 400; }
.sba-top-name { color: #111827; }
.sba-top-meta { font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.8; }
.sba-top-meta strong { color: #374151; }
.sba-dot { margin: 0 5px; color: #d3d7dd; }

.sba-top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
.sba-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; font-size: 12px; font-weight: 500; border-radius: 6px; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s, background .2s, opacity .2s; white-space: nowrap; }
.sba-btn:disabled { opacity: .55; cursor: not-allowed; }
.sba-btn--ghost { color: #4b5563; background: #fff; border: 1px solid #e1e4e8; }
.sba-btn--ghost:hover:not(:disabled) { color: #da203e; border-color: rgba(218,32,62,0.45); }
.sba-btn--primary { color: #fff; background: #da203e; border: 1px solid #da203e; }
.sba-btn--primary:hover { background: #c01b36; border-color: #c01b36; }

.sba-caret { font-size: 9px; opacity: .8; margin-left: 1px; }

.sba-report { position: relative; }
.sba-menu { position: absolute; top: calc(100% + 5px); right: 0; z-index: 30; min-width: 148px; padding: 4px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 8px 28px rgba(0,0,0,0.12); display: flex; flex-direction: column; }
.sba-menu--dark { background: #252b38; border-color: rgba(255,255,255,0.14); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
.sba-menu-item { padding: 7px 10px; text-align: left; font-size: 12px; color: #4b5563; background: none; border: none; border-radius: 5px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.sba-menu-item:hover { background: #f5f6f7; color: #da203e; }
.sba-menu--dark .sba-menu-item { color: #c6ccd8; }
.sba-menu--dark .sba-menu-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sba-menu--dark .sba-menu-item.is-active { color: #fff; background: rgba(124,58,237,0.35); }

.sba-fade-enter-active, .sba-fade-leave-active { transition: opacity .18s, transform .18s; }
.sba-fade-enter-from, .sba-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ===== 明细 Tab（下划线形式） ===== */
.sba-tabs { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; }
.sba-tab { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; margin-bottom: -1px; font-size: 13px; font-weight: 500; color: #8b919b; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: color .2s, border-color .2s; }
.sba-tab:hover { color: #374151; }
.sba-tab.is-active { color: #da203e; border-bottom-color: #da203e; font-weight: 600; }
.sba-tab-num { padding: 0 6px; min-width: 16px; height: 16px; line-height: 16px; text-align: center; border-radius: 8px; font-size: 9.5px; font-weight: 700; color: #8b919b; background: #f2f3f5; font-variant-numeric: tabular-nums; }
.sba-tab.is-active .sba-tab-num { color: #fff; background: #da203e; }

/* ===== SBOM 原始内容 ===== */
.sba-raw { border-radius: 10px; overflow: hidden; background: #1e2430; border: 1px solid #2b3240; }
.sba-raw-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #252b38; border-bottom: 1px solid #2b3240; }
.sba-raw-title { font-size: 12px; font-weight: 600; color: #e8eaf0; }
.sba-raw-format { font-size: 10px; color: #8b94a6; font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.sba-code { margin: 0; padding: 14px 18px; max-height: 520px; overflow: auto; font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace; font-size: 11px; line-height: 1.75; color: #b9c2d0; white-space: pre; }
.sba-code :deep(.j-key) { color: #7dd3fc; }
.sba-code :deep(.j-str) { color: #a5e8a1; }
.sba-code :deep(.j-num) { color: #f0b072; }
.sba-code :deep(.j-kw) { color: #c792ea; }

/* ===== 许可证 ===== */
.sba-license-bars { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.sba-license-row { display: grid; grid-template-columns: 110px 56px 1fr 32px; align-items: center; gap: 10px; }
.sba-license-name { font-size: 12px; font-weight: 600; color: #374151; }
.sba-license-type { font-size: 10px; padding: 1px 6px; border-radius: 3px; text-align: center; white-space: nowrap; }
.sba-license-track { height: 6px; border-radius: 3px; background: #f2f3f5; overflow: hidden; }
.sba-license-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.sba-license-count { font-size: 11px; color: #9ca3af; text-align: right; font-variant-numeric: tabular-nums; }
.is-ok { background: rgba(47,158,87,0.1); color: #2f9e57; }
.is-warn { background: rgba(229,168,80,0.12); color: #c98a2e; }
.is-danger { background: rgba(218,32,62,0.1); color: #da203e; }
.sba-license-fill.is-ok { background: #2f9e57; }
.sba-license-fill.is-warn { background: #e5a850; }
.sba-license-fill.is-danger { background: #da203e; }
.sba-license { padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 500; }

/* ===== 许可证分析 ===== */
.sba-lic { display: flex; flex-direction: column; gap: 14px; }
.sba-lic-ov { padding: 18px 20px; }
.sba-lic-bar { display: flex; height: 14px; border-radius: 4px; overflow: hidden; background: #f2f3f5; }
.sba-lic-seg { display: flex; align-items: center; justify-content: center; min-width: 22px; font-size: 10px; font-weight: 700; color: #fff; overflow: hidden; }
.sba-lic-seg--ok { background: #2f9e57; }
.sba-lic-seg--unknown { background: #d8dce3; color: #6b7280; }
.sba-lic-legend { display: flex; gap: 16px; margin-top: 10px; }
.sba-legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #6b7280; }
.sba-legend-dot { width: 9px; height: 9px; border-radius: 2px; }
.sba-legend-dot--ok { background: #2f9e57; }
.sba-legend-dot--unknown { background: #d8dce3; }
.sba-lic-summary { font-size: 11.5px; color: #9ca3af; margin: 10px 0 0; line-height: 1.7; }

.sba-table--lic th, .sba-table--vuln th { white-space: nowrap; }
.sba-risk { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.sba-risk.is-unknown { background: #f2f3f5; color: #9ca3af; }
.sba-cert--ok { color: #2f9e57; display: inline-block; vertical-align: middle; }

.sba-radar-card { padding-bottom: 4px; }
.sba-rule-toggle { display: inline-flex; align-items: center; gap: 5px; padding: 0; font-size: 11px; color: #9ca3af; background: none; border: none; cursor: pointer; font-family: inherit; transition: color .2s; }
.sba-rule-toggle:hover { color: #da203e; }
.sba-rule-caret { font-size: 9px; transition: transform .2s; }
.sba-rule-caret.is-open { transform: rotate(90deg); }
.sba-rule-note { margin: 0 18px 8px; padding: 12px 14px; background: #fafbfc; border: 1px solid #f0f1f3; border-radius: 7px; }
.sba-rule-note p { font-size: 11.5px; line-height: 1.8; color: #6b7280; margin: 0; }
.sba-radar { display: flex; justify-content: center; padding: 6px 0 16px; }
.sba-radar-label { font-size: 10px; fill: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; }

.sba-contagion { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #4b5563; }
.sba-contagion-dot { width: 7px; height: 7px; border-radius: 50%; }
.sba-contagion-dot--ok { background: #2f9e57; }

.sba-conflict-card { padding: 16px 18px; }
.sba-conflict-hd { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; }
.sba-conflict-count { font-size: 12.5px; font-weight: 600; color: #da203e; margin: 0 0 12px; }
.sba-conflict-ok { display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; width: 100%; box-sizing: border-box; background: rgba(47,158,87,0.05); border: 1px solid rgba(47,158,87,0.2); border-radius: 7px; font-size: 12px; color: #2f9e57; }
.sba-conflict-ok svg { flex-shrink: 0; }

.sba-conflict-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.sba-conflict-item { display: flex; flex-direction: column; gap: 9px; padding: 14px 16px; background: #fafbfc; border: 1px solid #eef0f2; border-radius: 8px; }
.sba-conflict-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.sba-conflict-pair { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sba-conflict-x { font-size: 12px; color: #b0b5bd; }
.sba-conflict-level { padding: 2px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 600; color: #6b7280; background: #eceef1; white-space: nowrap; }
.sba-conflict-line { display: flex; align-items: flex-start; gap: 7px; font-size: 11.5px; line-height: 1.65; color: #6b7280; margin: 0; }
.sba-conflict-line svg { flex-shrink: 0; margin-top: 2px; color: #9ca3af; }

/* 许可证名称链接 */
.sba-lic-link { padding: 0; border: none; background: none; font-size: 12px; font-weight: 600; color: #2563eb; cursor: pointer; font-family: inherit; text-align: left; transition: color .2s; }
.sba-lic-link:hover { color: #da203e; text-decoration: underline; }
.sba-lic-link--sm { font-size: 11.5px; }

/* ===== 许可证详情弹窗 ===== */
.sba-modal-mask { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(17,24,39,0.42); backdrop-filter: blur(2px); }
.sba-modal { display: flex; flex-direction: column; width: 100%; max-width: 640px; max-height: 86vh; background: #fff; border-radius: 10px; box-shadow: 0 20px 60px rgba(0,0,0,0.22); overflow: hidden; }
.sba-modal--sm { max-width: 420px; max-height: min(46vh, 380px); }
.sba-modal--sm .sba-modal-hd { padding: 12px 16px; }
.sba-modal--sm .sba-modal-title { font-size: 14px; }
.sba-modal--sm .sba-modal-body { padding: 8px 12px 12px; }
.sba-modal-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f0f1f3; flex-shrink: 0; }
.sba-modal-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; letter-spacing: -.01em; }
.sba-modal-close { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; padding: 0; font-size: 18px; line-height: 1; color: #9ca3af; background: none; border: none; border-radius: 5px; cursor: pointer; font-family: inherit; transition: color .2s, background .2s; }
.sba-modal-close:hover { color: #da203e; background: #f5f6f7; }
.sba-modal-body { padding: 16px 20px 20px; overflow-y: auto; }

.sba-mf { display: grid; grid-template-columns: 104px 1fr; gap: 12px; padding: 7px 0; border-bottom: 1px solid #f5f6f7; align-items: start; }
.sba-mf:last-of-type { border-bottom: none; }
.sba-mf-label { font-size: 11.5px; color: #9ca3af; }
.sba-mf-value { font-size: 12.5px; color: #374151; line-height: 1.6; word-break: break-all; }
.sba-mf-value code { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 11.5px; color: #6b7280; background: #f5f6f7; padding: 1px 6px; border-radius: 3px; }
.sba-mf-risk { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.sba-mf-certs { display: flex; gap: 12px; flex-wrap: wrap; }
.sba-mf-cert { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; color: #2f9e57; font-weight: 500; }
.sba-mf-cert.is-off { color: #b0b5bd; }
.sba-mf-cert-no { font-size: 11px; }
.sba-mf-link { color: #2563eb; font-size: 12px; text-decoration: none; }
.sba-mf-link:hover { text-decoration: underline; }

.sba-mf-sec { margin-top: 12px; border-top: 1px solid #f0f1f3; padding-top: 10px; }
.sba-mf-sec summary { font-size: 12.5px; font-weight: 600; color: #374151; cursor: pointer; list-style: none; display: flex; align-items: center; gap: 6px; }
.sba-mf-sec summary::-webkit-details-marker { display: none; }
.sba-mf-sec summary::before { content: '▾'; font-size: 9px; color: #b0b5bd; }
.sba-mf-sec:not([open]) summary::before { content: '▸'; }
.sba-mf-sec p { font-size: 12px; line-height: 1.75; color: #6b7280; margin: 8px 0 0; }

.sba-obligations { list-style: none; margin: 10px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px 14px; }
.sba-obligations li { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.6; color: #4b5563; min-width: 0; }
.sba-ob-text { min-width: 0; overflow-wrap: anywhere; }
.sba-ob-icon { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }
.sba-obligations li.is-can .sba-ob-icon { color: #2f9e57; }
.sba-obligations li.is-cannot .sba-ob-icon { color: #da203e; }
.sba-obligations li.is-must .sba-ob-icon { color: #e08a3c; }
.sba-ob-must { font-size: 11px; font-weight: 700; line-height: 1; }
.sba-ob-prefix { font-weight: 600; white-space: nowrap; }
.sba-obligations li.is-can .sba-ob-prefix { color: #2f9e57; }
.sba-obligations li.is-cannot .sba-ob-prefix { color: #da203e; }
.sba-obligations li.is-must .sba-ob-prefix { color: #e08a3c; }

.sba-modal-enter-active, .sba-modal-leave-active { transition: opacity .2s; }
.sba-modal-enter-active .sba-modal, .sba-modal-leave-active .sba-modal { transition: transform .2s; }
.sba-modal-enter-from, .sba-modal-leave-to { opacity: 0; }
.sba-modal-enter-from .sba-modal, .sba-modal-leave-to .sba-modal { transform: translateY(10px) scale(.98); }

/* ===== 漏洞列表 ===== */
.sba-vuln { display: flex; flex-direction: column; gap: 14px; }
.sba-vuln-hd { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 18px; border-bottom: 1px solid #f2f3f5; flex-wrap: wrap; }
.sba-vuln-stats { display: flex; gap: 8px; flex-wrap: wrap; }
.sba-vuln-tag { padding: 4px 12px; border-radius: 5px; font-size: 12px; font-weight: 600; }
.sba-vuln-tag--critical { color: #fff; background: #da203e; }
.sba-vuln-tag--high { color: #fff; background: #e08a3c; }
.sba-vuln-tag--medium { color: #c98a2e; background: rgba(229,168,80,0.16); }
.sba-vuln-tag--low { color: #6b7280; background: #f2f3f5; }


.sba-table--vuln .sba-cve-link { padding: 0; border: none; background: none; color: #2563eb; font-size: 12px; font-weight: 500; text-decoration: none; font-family: 'SF Mono', 'JetBrains Mono', monospace; cursor: pointer; transition: color .2s; }
.sba-table--vuln .sba-cve-link:hover { color: #da203e; text-decoration: underline; }

/* 漏洞详情：受影响组件 */
.sba-affected { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.sba-affected li { font-size: 12px; color: #374151; padding: 6px 10px; background: #fafbfc; border: 1px solid #f0f1f3; border-radius: 5px; }
.sba-affected-lang { color: #9ca3af; font-size: 11px; }

/* 许可证关联组件 */
.sba-comp-count-link { padding: 0; border: none; background: none; font-size: 12px; color: #6b7280; cursor: pointer; font-family: inherit; transition: color .2s; white-space: nowrap; }
.sba-comp-count-link:hover { color: #da203e; text-decoration: underline; }
.sba-lic-comps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.sba-lic-comps li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #f5f6f7; }
.sba-lic-comps li:last-child { border-bottom: none; }
.sba-lic-comp-name { color: #374151; word-break: break-all; }
.sba-lic-comp-ver { color: #9ca3af; font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 11px; flex-shrink: 0; }
.sba-sev { padding: 2px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.sba-sev--critical { color: #fff; background: #da203e; }
.sba-sev--high { color: #fff; background: #e08a3c; }
.sba-sev--medium { color: #c98a2e; background: rgba(229,168,80,0.14); }
.sba-sev--low { color: #9ca3af; background: #f2f3f5; }
.sba-fix-ver { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-size: 11.5px; color: #2f9e57; font-weight: 600; }

/* ===== 漏洞（旧） ===== */
.sba-level { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.sba-level--critical { background: rgba(218,32,62,0.1); color: #da203e; }
.sba-level--high { background: rgba(229,105,80,0.12); color: #d9603f; }
.sba-level--medium { background: rgba(229,168,80,0.12); color: #c98a2e; }
.sba-level--low { background: #f2f3f5; color: #9ca3af; }
.sba-cvss { font-weight: 700; font-variant-numeric: tabular-nums; }
.sba-cvss--critical { color: #da203e; }
.sba-cvss--high { color: #d9603f; }
.sba-cvss--medium { color: #c98a2e; }
.sba-desc-cell { max-width: 220px; }
.sba-fix-cell { font-size: 11px; color: #2f9e57; }

@media (max-width: 900px) {
  .sba-top-actions { width: 100%; }
  .sba-license-row { grid-template-columns: 96px 52px 1fr 28px; }
}
</style>
