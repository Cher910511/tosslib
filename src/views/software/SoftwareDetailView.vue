<template>
  <div class="detail">
    <!-- ====== 英雄区 ====== -->
    <section class="hero-card">
      <div class="hero-badge">
        <span class="hero-badge-ico">⬡</span>
        <span class="hero-badge-text">软件详情</span>
      </div>
      <div class="hero-body">
        <div class="hero-lead">
          <h1 class="hero-title">{{ displayPkg.name || '软件名称' }}</h1>
          <div class="hero-meta-strip">
            <div class="hero-meta-cell">
              <span class="hero-meta-k">版本</span>
              <span class="hero-meta-v hero-meta-v--ver">v{{ displayPkg.version || '—' }}</span>
            </div>
            <span class="hero-meta-divider" />
            <div class="hero-meta-cell">
              <span class="hero-meta-k">评分</span>
              <span class="hero-meta-v hero-meta-v--score">{{ displayPkg.score ?? '—' }}</span>
            </div>
            <span class="hero-meta-divider" />
            <div class="hero-meta-cell">
              <span class="hero-meta-k">漏洞</span>
              <span class="hero-meta-v hero-meta-v--vuln-line">
                <span v-if="!displayPkg.vulnCount && displayPkg.vulnCount !== 0" class="hero-vuln-empty">—</span>
                <span v-else-if="displayPkg.vulnCount === 0" class="hero-vuln-empty">无已知漏洞</span>
                <span v-else class="hero-vuln-num--high">{{ displayPkg.vulnCount }}</span>
              </span>
            </div>
            <span class="hero-meta-divider" />
            <div class="hero-meta-cell">
              <span class="hero-meta-k">语言</span>
              <span class="hero-meta-v hero-meta-v--lang">{{ displayPkg.language || '—' }}</span>
            </div>
            <span class="hero-meta-divider" />
            <div class="hero-meta-cell">
              <span class="hero-meta-k">许可证</span>
              <span class="hero-meta-v hero-meta-v--lic">{{ displayPkg.license?.names?.[0] || '—' }}</span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button type="button" class="btn btn-ghost" :disabled="!displayPkg.name">选型 ▾</button>
          <button type="button" class="btn btn-ghost" :disabled="!displayPkg.name">订阅 ▾</button>
          <button type="button" class="btn btn-primary" :disabled="!displayPkg.name">下载</button>
        </div>
      </div>
    </section>

    <!-- ====== Tab 导航 ====== -->
    <div class="tabs">
      <button v-for="t in tabs" :key="t.key" type="button" class="tab"
        :class="{ 'is-active': activeTab === t.key }" @click="setTab(t.key)">
        {{ t.label }}
      </button>
    </div>

    <!-- ====== 软件介绍 Tab ====== -->
    <div v-show="activeTab === 'intro'" class="tab-panel">
      <div class="card-grid-2col">
        <!-- 基本信息卡 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">◈</span>
            <span class="card-title">基本信息</span>
          </div>
          <dl class="info-dl">
            <div class="info-row"><dt>软件名称</dt><dd>{{ displayPkg.name || '—' }}</dd></div>
            <div class="info-row"><dt>版本</dt><dd>v{{ displayPkg.version || '—' }}</dd></div>
            <div class="info-row"><dt>编程语言</dt><dd>{{ displayPkg.language || '—' }}</dd></div>
            <div class="info-row"><dt>开源许可证</dt><dd><span class="badge badge-lic" v-if="displayPkg.license?.names?.length">{{ displayPkg.license.names.join(', ') }}</span><span v-else class="na-text">—</span></dd></div>
            <div class="info-row"><dt>评分</dt><dd>{{ displayPkg.score ?? '—' }}</dd></div>
            <div class="info-row"><dt>行业分类</dt><dd>{{ displayPkg.industry || '—' }}</dd></div>
          </dl>
        </div>
        <!-- 开发者信息卡 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">♢</span>
            <span class="card-title">开发者信息</span>
          </div>
          <dl class="info-dl">
            <div class="info-row"><dt>开发商</dt><dd>{{ displayPkg.author || '—' }}</dd></div>
            <div class="info-row"><dt>发布日期</dt><dd>{{ displayPkg.released || '—' }}</dd></div>
            <div class="info-row"><dt>漏洞数</dt><dd>{{ displayPkg.vulnCount ?? '—' }}</dd></div>
            <div class="info-row"><dt>最后更新</dt><dd>{{ displayPkg.lastUpdated || displayPkg.released || '—' }}</dd></div>
          </dl>
        </div>
        <!-- 相关链接卡 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">⇱</span>
            <span class="card-title">相关链接</span>
          </div>
          <dl class="info-dl">
            <div class="info-row"><dt>源码地址</dt><dd><a v-if="displayPkg.links?.source" :href="displayPkg.links.source" target="_blank" class="link-text">{{ displayPkg.links.sourceText || '查看' }}</a><span v-else class="na-text">—</span></dd></div>
            <div class="info-row"><dt>官网</dt><dd><a v-if="displayPkg.links?.website" :href="displayPkg.links.website" target="_blank" class="link-text">{{ displayPkg.links.websiteText || '查看' }}</a><span v-else class="na-text">—</span></dd></div>
            <div class="info-row"><dt>文档</dt><dd><a v-if="displayPkg.links?.docs" :href="displayPkg.links.docs" target="_blank" class="link-text">{{ displayPkg.links.docsText || '查看' }}</a><span v-else class="na-text">—</span></dd></div>
          </dl>
        </div>
        <!-- 标签卡 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">✦</span>
            <span class="card-title">标签</span>
          </div>
          <div class="tag-cloud" v-if="displayPkg.tags?.length">
            <span class="tag-pill" v-for="t in displayPkg.tags" :key="t">{{ t }}</span>
          </div>
          <div class="tag-cloud tag-cloud--sk" v-else>
            <span class="sk-pill" v-for="i in 6" :key="i"></span>
          </div>
        </div>
        <!-- 描述卡 (全宽) -->
        <div class="info-card-fill info-card-fill--wide">
          <div class="card-header">
            <span class="card-header-ico">❡</span>
            <span class="card-title">描述</span>
          </div>
          <p class="desc-text">{{ displayPkg.description || '暂无描述信息' }}</p>
          <div class="desc-skeleton" v-if="!displayPkg.description">
            <div class="sk-line" v-for="i in 3" :key="i"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 依赖关系 Tab ====== -->
    <div v-show="activeTab === 'deps'" class="tab-panel">
      <div class="deps-layout">
        <!-- 依赖关系树 (左列) -->
        <div class="info-card-fill info-card-fill--tree">
          <div class="card-header">
            <span class="card-header-ico">⊞</span>
            <span class="card-title">依赖关系树</span>
            <span class="card-badge">{{ depAll.length }} 个组件</span>
          </div>
          <div class="dep-tree-table">
            <!-- 表头 -->
            <div class="dep-th-row">
              <span class="dep-th dep-th--name">组件版本名称</span>
              <span class="dep-th">groupId</span>
              <span class="dep-th">PackageName</span>
              <span class="dep-th">版本</span>
              <span class="dep-th">编程语言</span>
              <span class="dep-th">所属软件</span>
              <span class="dep-th dep-th--op">操作</span>
            </div>
            <!-- 根节点行 -->
            <div class="dep-tr dep-tr--root">
              <span class="dep-td dep-td--name">
                <span class="tree-dot tree-dot--root"></span>
                {{ displayPkg.name }}
                <span class="dep-root-ver">v{{ displayPkg.version }}</span>
              </span>
              <span class="dep-td"></span>
              <span class="dep-td"></span>
              <span class="dep-td dep-td--ver">v{{ displayPkg.version }}</span>
              <span class="dep-td"></span>
              <span class="dep-td"></span>
              <span class="dep-td dep-td--op"></span>
            </div>
            <!-- 分组 + 叶子行 -->
            <template v-for="g in depTree" :key="g.group">
              <div class="dep-tr dep-tr--group" @click="toggleGroup(g.group)">
                <span class="dep-td dep-td--name">
                  <span class="tree-caret" :class="{ 'is-open': isGroupOpen(g.group) }">▸</span>
                  {{ g.group }}
                </span>
                <span class="dep-td"></span>
                <span class="dep-td"></span>
                <span class="dep-td"></span>
                <span class="dep-td"></span>
                <span class="dep-td"></span>
                <span class="dep-td dep-td--op dep-group-count">{{ g.items.length }} 项</span>
              </div>
              <template v-if="isGroupOpen(g.group)">
                <div class="dep-tr dep-tr--leaf" v-for="d in g.items" :key="d.id"
                  :class="{ 'is-selected': selectedDep?.id === d.id }" @click="selectDep(d)">
                  <span class="dep-td dep-td--name dep-leaf-name">
                    <span class="dep-indent"></span>
                    {{ d.component_name }}
                  </span>
                  <span class="dep-td dep-td--mono">{{ d.group_id }}</span>
                  <span class="dep-td">{{ d.artifact_id }}</span>
                  <span class="dep-td dep-td--mono" :class="{ 'is-unknown': d.version === 'UNKNOWN' }">{{ d.version }}</span>
                  <span class="dep-td">{{ d.language }}</span>
                  <span class="dep-td">{{ d.software_name }}</span>
                  <span class="dep-td dep-td--op">
                    <a href="#" class="dep-download-btn" @click.prevent>下载</a>
                  </span>
                </div>
              </template>
            </template>
          </div>
        </div>
        <!-- 右列:来源分布 / 版本状态 / 依赖统计 竖排 -->
        <div class="deps-side">
          <!-- 来源分布扇形图 -->
          <div class="info-card-fill">
            <div class="card-header">
              <span class="card-header-ico">◔</span>
              <span class="card-title">来源分布</span>
              <span class="card-badge">按 Group 前缀</span>
            </div>
            <div ref="depSourceChartRef" class="pie-chart"></div>
          </div>
          <!-- 版本状态扇形图 -->
          <div class="info-card-fill">
            <div class="card-header">
              <span class="card-header-ico">◑</span>
              <span class="card-title">版本状态</span>
              <span class="card-badge">正常 {{ depVersionData[0]?.value }} / 未知 {{ depVersionData[1]?.value }}</span>
            </div>
            <div ref="depStatusChartRef" class="pie-chart"></div>
          </div>
          <!-- 依赖统计 (花哨渐变卡) -->
          <div class="info-card-fill info-card-fill--fancy">
          <div class="card-header">
            <span class="card-header-ico">▣</span>
            <span class="card-title">依赖统计</span>
            <span class="card-badge card-badge--fancy">版本完整率 {{ depStats.knownRate }}%</span>
          </div>
          <div class="fancy-stats">
            <div class="fancy-stat fancy-stat--total">
              <span class="fancy-val">{{ depStats.total || '—' }}</span>
              <span class="fancy-lbl">组件总数</span>
            </div>
            <div class="fancy-stat fancy-stat--groups">
              <span class="fancy-val">{{ depStats.groups }}</span>
              <span class="fancy-lbl">来源 Group</span>
            </div>
            <div class="fancy-stat fancy-stat--artifacts">
              <span class="fancy-val">{{ depStats.artifacts }}</span>
              <span class="fancy-lbl">独立组件</span>
            </div>
            <div class="fancy-stat fancy-stat--direct">
              <span class="fancy-val">{{ depStats.direct }}</span>
              <span class="fancy-lbl">直接依赖</span>
            </div>
            <div class="fancy-stat fancy-stat--transitive">
              <span class="fancy-val">{{ depStats.transitive }}</span>
              <span class="fancy-lbl">传递依赖</span>
            </div>
            <div class="fancy-stat fancy-stat--unknown">
              <span class="fancy-val">{{ depStats.unknownVersion }}</span>
              <span class="fancy-lbl">未知版本</span>
            </div>
          </div>
          <div class="fancy-rate">
            <div class="fancy-rate-track">
              <div class="fancy-rate-fill" :style="{ width: depStats.knownRate + '%' }"></div>
            </div>
            <span class="fancy-rate-text">已知版本 {{ depStats.knownVersion }} / {{ depStats.total || 0 }}</span>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 漏洞信息 Tab ====== -->
    <div v-show="activeTab === 'vuln'" class="tab-panel">
      <!-- 漏洞状态提示条 -->
      <div class="vuln-tip" :class="{ 'is-clean': vulnData.total === 0 }">
        <span class="vuln-tip-ico" aria-hidden="true">{{ vulnData.total === 0 ? '🛡' : '⚠' }}</span>
        <div class="vuln-tip-body">
          <p class="vuln-tip-title">
            {{ vulnData.total === 0 ? '未检测到已知漏洞' : `检测到 ${vulnData.total} 个漏洞` }}
          </p>
          <p class="vuln-tip-text" v-if="vulnData.total > 0">
            其中超危 {{ vulnData.critical }} 个、高危 {{ vulnData.high }} 个、中危 {{ vulnData.medium }} 个、低危 {{ vulnData.low }} 个，
            请重点关注高危及以上漏洞，建议及时升级至修复版本。
          </p>
          <p class="vuln-tip-text" v-else>
            当前版本风险状态良好，可放心使用；如后续发现新漏洞，平台将持续跟进并提示。
          </p>
        </div>
      </div>
      <div class="card-grid-2col">
        <!-- 漏洞概览 + 等级分布（合并卡，全宽） -->
        <div class="info-card-fill info-card-fill--wide vuln-summary">
          <div class="card-header">
            <span class="card-header-ico">◉</span>
            <span class="card-title">漏洞概览</span>
            <span class="card-badge">共 {{ vulnData.total }} 个</span>
          </div>
          <div class="vuln-summary-body">
            <!-- 左侧：四统计卡（2x2）+ 趋势条 -->
            <div class="vuln-summary-stats">
              <div class="stat-grid-2">
                <div class="stat-card stat-card--crit"><span class="stat-val">{{ vulnData.critical }}</span><span class="stat-lbl">超危</span></div>
                <div class="stat-card stat-card--high"><span class="stat-val">{{ vulnData.high }}</span><span class="stat-lbl">高危</span></div>
                <div class="stat-card stat-card--med"><span class="stat-val">{{ vulnData.medium }}</span><span class="stat-lbl">中危</span></div>
                <div class="stat-card stat-card--low"><span class="stat-val">{{ vulnData.low }}</span><span class="stat-lbl">低危</span></div>
              </div>
              <!-- 趋势微条 -->
              <div class="vuln-trend-bar">
                <div class="vuln-trend-seg crit" :style="{ width: vulnTrendPct.critical + '%' }"></div>
                <div class="vuln-trend-seg high" :style="{ width: vulnTrendPct.high + '%' }"></div>
                <div class="vuln-trend-seg med" :style="{ width: vulnTrendPct.medium + '%' }"></div>
                <div class="vuln-trend-seg low" :style="{ width: vulnTrendPct.low + '%' }"></div>
              </div>
            </div>
            <!-- 右侧：等级分布扇形图 -->
            <div class="vuln-summary-chart">
              <div ref="vulnSevChartRef" class="an-chart-box"></div>
            </div>
          </div>
        </div>
        <!-- 漏洞列表 -->
        <div class="info-card-fill info-card-fill--wide" v-if="vulnList.length">
          <div class="card-header">
            <span class="card-header-ico">☰</span>
            <span class="card-title">漏洞列表</span>
            <span class="card-badge">点击行查看详情</span>
          </div>
          <div class="vuln-list-item" v-for="v in vulnList" :key="v.id" @click="openVulnDetail(v)">
            <span class="vuln-level" :class="'level--' + v.level">{{ v.levelLabel }}</span>
            <span class="vuln-id">{{ v.cve_id }}</span>
            <span class="vuln-desc">{{ v.vuln_name }}</span>
            <span class="vuln-cvss" v-if="v.cvss_score != null">CVSS {{ v.cvss_score }}</span>
            <span class="vuln-more">›</span>
          </div>
        </div>
        <!-- 无漏洞时的骨架 -->
        <div class="info-card-fill info-card-fill--wide" v-else>
          <div class="card-header">
            <span class="card-header-ico">☰</span>
            <span class="card-title">漏洞列表</span>
          </div>
          <div class="vuln-sk-list">
            <div class="sk-vuln-row" v-for="i in 4" :key="i">
              <span class="sk-block sk-block--lvl"></span>
              <span class="sk-block sk-block--id"></span>
              <span class="sk-block sk-block--desc"></span>
              <span class="sk-block sk-block--st"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 恶意代码 Tab ====== -->
    <div v-show="activeTab === 'malware'" class="tab-panel">
      <div class="card-grid-2col">
        <!-- 检测概览 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">☣</span>
            <span class="card-title">检测概览</span>
            <span class="card-badge">共 {{ malwareData.total }} 个文件</span>
          </div>
          <div class="stat-grid-4">
            <div class="stat-card stat-card--crit"><span class="stat-val">{{ malwareData.malicious }}</span><span class="stat-lbl">恶意</span></div>
            <div class="stat-card stat-card--high"><span class="stat-val">{{ malwareData.suspicious }}</span><span class="stat-lbl">可疑</span></div>
            <div class="stat-card stat-card--accent"><span class="stat-val">{{ malwareData.clean }}</span><span class="stat-lbl">正常</span></div>
            <div class="stat-card stat-card--accent"><span class="stat-val">{{ malwareData.total }}</span><span class="stat-lbl">检测文件</span></div>
          </div>
          <!-- 检测进度 -->
          <div class="mal-progress" v-if="malwareData.total > 0">
            <div class="mal-progress-track">
              <div class="mal-progress-fill" :style="{ width: malwareCleanRate + '%' }"></div>
            </div>
            <span class="mal-progress-text">正常率 {{ malwareCleanRate }}%</span>
          </div>
        </div>
        <!-- 检测引擎 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">▣</span>
            <span class="card-title">检测引擎</span>
            <span class="card-badge">{{ malwareEngines.length }} 个</span>
          </div>
          <div class="mal-engine-list">
            <div class="mal-engine-row" v-for="e in malwareEngines" :key="e.name">
              <span class="mal-engine-name">{{ e.name }}</span>
              <span class="mal-engine-status" :class="'mal-st--' + e.status">{{ e.statusLabel }}</span>
            </div>
          </div>
        </div>
        <!-- 检测结果列表 (全宽) -->
        <div class="info-card-fill info-card-fill--wide" v-if="malwareList.length">
          <div class="card-header">
            <span class="card-header-ico">☰</span>
            <span class="card-title">检测结果</span>
            <span class="card-badge">{{ malwareList.length }} 条告警</span>
          </div>
          <div class="mal-list-item" v-for="m in malwareList" :key="m.id">
            <span class="mal-level" :class="'mal-level--' + m.level">{{ m.levelLabel }}</span>
            <span class="mal-file mono-text">{{ m.file }}</span>
            <span class="mal-type">{{ m.type }}</span>
            <span class="mal-desc">{{ m.desc }}</span>
          </div>
        </div>
        <!-- 无告警占位 -->
        <div class="info-card-fill info-card-fill--wide" v-else>
          <div class="card-header">
            <span class="card-header-ico">☰</span>
            <span class="card-title">检测结果</span>
          </div>
          <div class="mal-empty">未发现恶意代码告警，检测结果全部正常</div>
        </div>
      </div>
    </div>

    <!-- ====== SBOM Tab ====== -->
    <div v-show="activeTab === 'sbom'" class="tab-panel">
      <div class="card-grid-2col">
        <!-- SBOM 概览 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">◫</span>
            <span class="card-title">软件物料清单概览</span>
            <span class="card-badge">共 {{ sbomData.total }} 个组件</span>
          </div>
          <div class="sbom-overview">
            <!-- 左：组件总数 hero -->
            <div class="sbom-hero">
              <span class="sbom-hero-num">{{ sbomData.total }}</span>
              <span class="sbom-hero-lbl">组件总数</span>
              <span class="sbom-hero-lic">许可证 {{ sbomData.licenses }} 个</span>
            </div>
            <!-- 右：依赖构成比例条 -->
            <div class="sbom-deps">
              <div class="sbom-dep-row">
                <span class="sbom-dep-dot sbom-dep-dot--direct"></span>
                <span class="sbom-dep-name">直接依赖</span>
                <span class="sbom-dep-num">{{ sbomData.direct }}</span>
                <span class="sbom-dep-pct">{{ sbomDirectPct }}%</span>
              </div>
              <div class="sbom-dep-row">
                <span class="sbom-dep-dot sbom-dep-dot--trans"></span>
                <span class="sbom-dep-name">传递依赖</span>
                <span class="sbom-dep-num">{{ sbomData.transitive }}</span>
                <span class="sbom-dep-pct">{{ 100 - sbomDirectPct }}%</span>
              </div>
              <div class="sbom-dep-bar">
                <div class="sbom-dep-fill" :style="{ width: sbomDirectPct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 风险分析（整合漏洞 + 依赖数据，与概览并排） -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">⚠</span>
            <span class="card-title">风险分析</span>
            <span class="card-badge">漏洞 + 依赖交叉分析</span>
          </div>
          <div class="sbom-risk-grid">
            <div class="sbom-risk-item" :class="{ 'sbom-risk-item--danger': sbomRiskStats.vulnTotal > 0 }">
              <span class="sbom-risk-ico" :class="sbomRiskStats.vulnTotal > 0 ? 'sbom-risk-ico--crit' : 'sbom-risk-ico--ok'">⚠</span>
              <div class="sbom-risk-main">
                <span class="sbom-risk-num">{{ sbomRiskStats.vulnTotal }}</span>
                <span class="sbom-risk-lbl">漏洞总数</span>
              </div>
            </div>
            <div class="sbom-risk-item">
              <span class="sbom-risk-ico sbom-risk-ico--accent">◈</span>
              <div class="sbom-risk-main">
                <span class="sbom-risk-num">{{ sbomRiskStats.depTotal }}</span>
                <span class="sbom-risk-lbl">依赖组件</span>
              </div>
            </div>
            <div class="sbom-risk-item">
              <span class="sbom-risk-ico sbom-risk-ico--warn">▣</span>
              <div class="sbom-risk-main">
                <span class="sbom-risk-num">{{ sbomRiskStats.unknownDeps }}</span>
                <span class="sbom-risk-lbl">未知版本依赖</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 组件清单 (全宽) -->
        <div class="info-card-fill info-card-fill--wide">
          <div class="card-header">
            <span class="card-header-ico">☰</span>
            <span class="card-title">组件清单</span>
            <span class="card-badge">{{ sbomList.length }} 条</span>
          </div>
          <div class="sbom-list-item" v-for="s in sbomList" :key="s.id">
            <span class="sbom-group mono-text">{{ s.group }}</span>
            <span class="sbom-artifact">{{ s.artifact }}</span>
            <span class="sbom-ver mono-text">{{ s.version }}</span>
            <span class="sbom-license">{{ s.license }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 许可证信息 Tab ====== -->
    <div v-show="activeTab === 'license'" class="tab-panel">
      <!-- 许可证概览 (全宽，仅多许可证时显示：单许可证时统计格无意义) -->
      <div class="info-card-fill info-card-fill--wide lic-summary" v-if="licList.length > 1">
        <div class="card-header">
          <span class="card-header-ico">©</span>
          <span class="card-title">许可证概览</span>
          <span class="card-badge">共 {{ licStats.total }} 个</span>
        </div>
        <div class="stat-grid-5">
          <div class="stat-card stat-card--accent lic-stat-card">
            <span class="stat-ico stat-ico--total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </span>
            <span class="lic-stat-main">
              <span class="stat-val">{{ licStats.total }}</span>
              <span class="stat-lbl">许可证总数</span>
            </span>
          </div>
          <div class="stat-card stat-card--accent lic-stat-card">
            <span class="stat-ico stat-ico--ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <span class="lic-stat-main">
              <span class="stat-val">{{ licStats.approved }}</span>
              <span class="stat-lbl">已批准</span>
            </span>
          </div>
          <div class="stat-card stat-card--accent lic-stat-card">
            <span class="stat-ico stat-ico--warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </span>
            <span class="lic-stat-main">
              <span class="stat-val">{{ licStats.pending }}</span>
              <span class="stat-lbl">未批准</span>
            </span>
          </div>
          <div class="stat-card stat-card--accent lic-stat-card">
            <span class="stat-ico stat-ico--type">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </span>
            <span class="lic-stat-main">
              <span class="stat-val">{{ licStats.typeCount }}</span>
              <span class="stat-lbl">许可证类型</span>
            </span>
          </div>
          <div class="stat-card stat-card--accent lic-stat-card">
            <span class="stat-ico" :class="'stat-ico--' + licRiskKey">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            </span>
            <span class="lic-stat-main">
              <span class="stat-val" :class="'lic-risk-val lic-risk-val--' + licRiskKey">{{ licRiskLevel }}</span>
              <span class="stat-lbl">集成风险</span>
            </span>
          </div>
        </div>
      </div>
      <!-- 许可证分析（左侧属性占比环形图 + 右侧属性三卡，始终显示） -->
      <div class="info-card-fill info-card-fill--wide lic-analysis">
        <div class="card-header">
          <span class="card-header-ico">◈</span>
          <span class="card-title">许可证分析</span>
          <span class="card-badge">{{ licenseListRaw[0]?.name }}</span>
        </div>
        <div class="lic-analysis-body">
          <!-- 左：属性占比环形图（允许/受限/必要 数量占比） -->
          <div ref="licAttrChartRef" class="lic-attr-chart"></div>
          <!-- 右：允许/受限/必要 数量展示 -->
          <div class="lic-attr-counts">
            <div class="lic-attr-count" v-for="s in licAttrStruct" :key="s.key">
              <span class="lic-count-ico" :class="'lic-count-ico--' + s.key">{{ s.key === 'perm' ? '✓' : s.key === 'lim' ? '✕' : '!' }}</span>
              <span class="lic-attr-count-name">{{ s.label }}</span>
              <span class="lic-attr-count-num">{{ s.count }} 项</span>
              <span class="lic-attr-count-pct">{{ s.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 单许可证：多卡片布局（信息卡 + 描述卡 + 属性三卡） -->
      <template v-if="licList.length === 1">
        <!-- 第一行：许可证信息 + 描述 -->
        <div class="card-grid-2col">
          <div class="info-card-fill">
            <div class="card-header">
              <span class="card-header-ico">©</span>
              <span class="card-title">许可证信息</span>
              <span class="badge" :class="licList[0].approvedClass">{{ licList[0].approvedLabel }}</span>
            </div>
            <dl class="info-dl">
              <div class="info-row"><dt>许可证名称</dt><dd>{{ licList[0].name }}</dd></div>
              <div class="info-row"><dt>许可证类型</dt><dd>{{ licList[0].type }}</dd></div>
              <div class="info-row"><dt>版本</dt><dd class="mono-text">{{ licDetailMap[licList[0].id]?.version || '—' }}</dd></div>
              <div class="info-row"><dt>批准状态</dt><dd><span class="badge" :class="licList[0].approvedClass">{{ licList[0].approvedLabel }}</span></dd></div>
            </dl>
          </div>
          <div class="info-card-fill">
            <div class="card-header">
              <span class="card-header-ico">❡</span>
              <span class="card-title">描述</span>
            </div>
            <p class="desc-text">{{ licDetailMap[licList[0].id]?.description || '暂无描述信息' }}</p>
          </div>
        </div>
        <!-- 第二行：属性三卡（允许 / 受限 / 必要） -->
        <div class="card-grid-3col">
          <div class="info-card-fill lic-attr-card">
            <div class="card-header">
              <span class="card-header-ico lic-attr-ico lic-attr-ico--perm">✓</span>
              <span class="card-title">允许的</span>
              <span class="card-badge">{{ licDetailMap[licList[0].id]?.permissions?.length || 0 }} 项</span>
            </div>
            <div class="ld-tags" v-if="licDetailMap[licList[0].id]?.permissions?.length">
              <span class="ld-tag ld-tag--perm" v-for="(p, i) in licDetailMap[licList[0].id].permissions" :key="i">{{ p }}</span>
            </div>
            <p class="na-text" v-else>—</p>
          </div>
          <div class="info-card-fill lic-attr-card">
            <div class="card-header">
              <span class="card-header-ico lic-attr-ico lic-attr-ico--lim">✕</span>
              <span class="card-title">受限的</span>
              <span class="card-badge">{{ licDetailMap[licList[0].id]?.limitations?.length || 0 }} 项</span>
            </div>
            <div class="ld-tags" v-if="licDetailMap[licList[0].id]?.limitations?.length">
              <span class="ld-tag ld-tag--lim" v-for="(p, i) in licDetailMap[licList[0].id].limitations" :key="i">{{ p }}</span>
            </div>
            <p class="na-text" v-else>—</p>
          </div>
          <div class="info-card-fill lic-attr-card">
            <div class="card-header">
              <span class="card-header-ico lic-attr-ico lic-attr-ico--cond">!</span>
              <span class="card-title">必要的</span>
              <span class="card-badge">{{ licDetailMap[licList[0].id]?.conditions?.length || 0 }} 项</span>
            </div>
            <div class="ld-tags" v-if="licDetailMap[licList[0].id]?.conditions?.length">
              <span class="ld-tag ld-tag--cond" v-for="(p, i) in licDetailMap[licList[0].id].conditions" :key="i">{{ p }}</span>
            </div>
            <p class="na-text" v-else>—</p>
          </div>
        </div>
      </template>
      <!-- 多许可证：一行一个卡片（列表只展示第一个许可证 Apache License 2.0） -->
      <template v-else>
        <div class="card-grid-1col">
          <template v-if="licList.length">
            <div class="info-card-fill lic-card" v-for="lic in licList.slice(0, 1)" :key="lic.id" @click="openLicDetail(lic)">
              <div class="card-header">
                <span class="card-header-ico">©</span>
                <span class="card-title">{{ lic.name }}</span>
                <span class="lic-meta">
                  <span class="badge lic-ver-badge" v-if="licDetailMap[lic.id]?.version">v{{ licDetailMap[lic.id].version }}</span>
                  <span class="badge lic-type-badge">{{ lic.type }}</span>
                  <span class="badge" :class="lic.approvedClass">{{ lic.approvedLabel }}</span>
                </span>
              </div>
              <div class="lic-props">
                <span class="lic-prop lic-prop--perm">允许 {{ lic.permissionCount }} 项</span>
                <span class="lic-prop lic-prop--lim">受限 {{ lic.limitationCount }} 项</span>
                <span class="lic-prop lic-prop--cond">必要 {{ lic.conditionCount }} 项</span>
              </div>
            </div>
          </template>
          <!-- 许可证骨架占位 -->
          <template v-else>
            <div class="info-card-fill lic-card lic-card--sk" v-for="i in 3" :key="i">
              <div class="card-header">
                <span class="card-header-ico">©</span>
                <span class="sk-block sk-block--title"></span>
                <span class="sk-block sk-block--badge"></span>
              </div>
              <div class="sk-lic-rows">
                <div class="sk-info-row" v-for="r in 4" :key="r">
                  <span class="sk-block sk-block--dt"></span>
                  <span class="sk-block sk-block--dd"></span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- ====== 贡献者信息 Tab ====== -->
    <div v-show="activeTab === 'contrib'" class="tab-panel">
      <div class="card-grid-2col">
        <!-- 贡献者统计 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">♔</span>
            <span class="card-title">贡献者统计</span>
          </div>
          <div class="stat-grid-3">
            <div class="stat-card stat-card--accent">
              <span class="stat-val">{{ contribData.total || '—' }}</span>
              <span class="stat-lbl">总贡献者</span>
            </div>
            <div class="stat-card stat-card--accent">
              <span class="stat-val">{{ contribData.recent || '—' }}</span>
              <span class="stat-lbl">近一年活跃</span>
            </div>
            <div class="stat-card stat-card--accent">
              <span class="stat-val">{{ contribData.commits || '—' }}</span>
              <span class="stat-lbl">总提交数</span>
            </div>
          </div>
        </div>
        <!-- 评分 -->
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">★</span>
            <span class="card-title">评分</span>
          </div>
          <div class="stat-grid-2">
            <div class="stat-card stat-card--accent">
              <span class="stat-val">{{ scoreData.scorecard ?? '—' }}</span>
              <span class="stat-lbl">Scorecard</span>
            </div>
            <div class="stat-card stat-card--accent">
              <span class="stat-val">{{ scoreData.criticality ?? '—' }}</span>
              <span class="stat-lbl">Criticality</span>
            </div>
          </div>
        </div>
        <!-- 贡献者列表 -->
        <div class="info-card-fill info-card-fill--wide">
          <div class="card-header">
            <span class="card-header-ico">♛</span>
            <span class="card-title">贡献者排名</span>
            <span class="card-badge" v-if="contribList.length">{{ contribList.length }} 人</span>
          </div>
          <template v-if="contribList.length">
            <div class="contrib-row" v-for="(c, i) in contribList" :key="c.name">
              <span class="contrib-rank" :class="{ 'is-top': i < 3 }">{{ i + 1 }}</span>
              <span class="contrib-avatar sk-avatar">{{ c.name[0] }}</span>
              <span class="contrib-name">{{ c.name }}</span>
              <span class="contrib-bar"><span class="contrib-bar-fill" :style="{ width: c.pct + '%' }"></span></span>
              <span class="contrib-commits">{{ c.commits }} commits</span>
            </div>
          </template>
          <template v-else>
            <div class="contrib-sk-list">
              <div class="sk-contrib-row" v-for="i in 5" :key="i">
                <span class="sk-block sk-block--rank"></span>
                <span class="sk-avatar"></span>
                <span class="sk-block sk-block--cname"></span>
                <span class="sk-block sk-block--cbar"></span>
                <span class="sk-block sk-block--ccnt"></span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ====== 软件版本 Tab ====== -->
    <div v-show="activeTab === 'versions'" class="tab-panel">
      <div class="card-grid-1col">
        <div class="info-card-fill">
          <div class="card-header">
            <span class="card-header-ico">↯</span>
            <span class="card-title">版本历史</span>
            <span class="card-badge" v-if="versionHistory.length">{{ versionHistory.length }} 个版本</span>
            <span class="card-badge card-badge--sk" v-else>— 个版本</span>
          </div>
          <!-- 真实版本列表 -->
          <div class="version-list" v-if="versionHistory.length">
            <div class="version-item" v-for="(row, idx) in versionHistory" :key="row.version" @click="goToVersionIntro(row)">
              <div class="version-left">
                <span class="version-pill" v-if="idx === 0">最新</span>
                <span class="version-num">{{ row.version }}</span>
              </div>
              <div class="version-mid">
                <span class="version-date">{{ row.released }}</span>
                <span class="version-vuln">{{ row.vulnCount ?? '—' }} 个漏洞</span>
              </div>
              <div class="version-right">
                <span class="version-score">评分 {{ row.score }}</span>
              </div>
            </div>
          </div>
          <!-- 版本骨架占位 -->
          <div class="version-sk-list" v-else>
            <div class="sk-version-row" v-for="i in 5" :key="i">
              <div class="sk-version-left">
                <span class="sk-block sk-block--pill"></span>
                <span class="sk-block sk-block--vnum"></span>
              </div>
              <div class="sk-version-mid">
                <span class="sk-block sk-block--vdate"></span>
                <span class="sk-block sk-block--vvuln"></span>
              </div>
              <div class="sk-version-right">
                <span class="sk-block sk-block--vscore"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== 漏洞详情抽屉 ====== -->
  <Teleport to="body">
    <div v-if="vulnDetail" class="vd-overlay" @click.self="vulnDetail = null">
      <div class="vd-drawer">
        <div class="vd-drawer-hd">
          <div class="vd-drawer-title">
            <h3 class="vd-cve">{{ vulnDetail.cve_id }}</h3>
            <p class="vd-name">{{ vulnDetail.vuln_name }}</p>
          </div>
          <button type="button" class="vd-drawer-close" @click="vulnDetail = null">×</button>
        </div>
        <div class="vd-drawer-body">
          <dl class="vd-dl">
            <div class="vd-dl-row"><dt>风险等级</dt><dd><span class="vuln-level" :class="'level--' + detailLevel">{{ detailLevelLabel }}</span></dd></div>
            <div class="vd-dl-row"><dt>组件名称</dt><dd>{{ vulnDetail.component_name || '—' }}</dd></div>
            <div class="vd-dl-row"><dt>攻击向量</dt><dd>{{ attrLabel('attack_vector', vulnDetail.attack_vector) }}</dd></div>
            <div class="vd-dl-row"><dt>攻击复杂度</dt><dd>{{ attrLabel('attack_complexity', vulnDetail.attack_complexity) }}</dd></div>
            <div class="vd-dl-row"><dt>用户交互</dt><dd>{{ attrLabel('user_interaction', vulnDetail.user_interaction) }}</dd></div>
            <div class="vd-dl-row"><dt>所需权限</dt><dd>{{ attrLabel('privileges_required', vulnDetail.privileges_required) }}</dd></div>
            <div class="vd-dl-row"><dt>发布时间</dt><dd>{{ vulnDetail.publish_time || vulnDetail.publish_date || '—' }}</dd></div>
          </dl>
          <section class="vd-section"><h4>漏洞描述</h4><p>{{ vulnDetail.summary || vulnDetail.vul_description || '—' }}</p></section>
          <section class="vd-section" v-if="vulnDetail.fix_suggestion"><h4>修复建议</h4><p>{{ vulnDetail.fix_suggestion }}</p></section>
          <section class="vd-section" v-if="vulnRefs.length">
            <h4>参考链接</h4>
            <ul class="vd-refs">
              <li v-for="(u, i) in vulnRefs" :key="i"><a :href="u" target="_blank" rel="noopener noreferrer">{{ u }}</a></li>
            </ul>
          </section>
          <section class="vd-section" v-if="vulnDetail.source_ref"><h4>来源</h4><a class="vd-source" :href="vulnDetail.source_ref" target="_blank" rel="noopener noreferrer">{{ vulnDetail.source_ref }}</a></section>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ====== 许可证详情抽屉 ====== -->
  <Teleport to="body">
    <div v-if="licDetail" class="ld-overlay" @click.self="closeLicDetail">
      <div class="ld-drawer">
        <div class="ld-drawer-hd">
          <div class="ld-drawer-title">
            <h3 class="ld-name">{{ licDetail.name }}</h3>
            <div class="ld-sub">
              <span class="badge lic-type-badge">{{ licDetail.type }}</span>
              <span class="badge lic-st--ok">{{ licDetail.status }}</span>
            </div>
          </div>
          <button type="button" class="ld-drawer-close" @click="closeLicDetail">×</button>
        </div>
        <div class="ld-drawer-body">
          <dl class="ld-dl">
            <div class="ld-dl-row"><dt>许可证名称</dt><dd>{{ licDetail.name }}</dd></div>
            <div class="ld-dl-row"><dt>版本</dt><dd class="mono-text">{{ licDetail.version || '—' }}</dd></div>
            <div class="ld-dl-row"><dt>类型</dt><dd>{{ licDetail.type || '—' }}</dd></div>
            <div class="ld-dl-row"><dt>状态</dt><dd><span class="badge lic-st--ok">{{ licDetail.status || '—' }}</span></dd></div>
          </dl>

          <!-- 许可证属性：允许的 -->
          <section class="ld-section" v-if="licDetail.permissions?.length">
            <h4 class="ld-section-title ld-section-title--perm">
              <span class="ld-section-ico">✓</span> 允许的
            </h4>
            <div class="ld-tags">
              <span class="ld-tag ld-tag--perm" v-for="(p, i) in licDetail.permissions" :key="i">{{ p }}</span>
            </div>
          </section>

          <!-- 许可证属性：受限的 -->
          <section class="ld-section" v-if="licDetail.limitations?.length">
            <h4 class="ld-section-title ld-section-title--lim">
              <span class="ld-section-ico">✕</span> 受限的
            </h4>
            <div class="ld-tags">
              <span class="ld-tag ld-tag--lim" v-for="(p, i) in licDetail.limitations" :key="i">{{ p }}</span>
            </div>
          </section>

          <!-- 许可证属性：必要的 -->
          <section class="ld-section" v-if="licDetail.conditions?.length">
            <h4 class="ld-section-title ld-section-title--cond">
              <span class="ld-section-ico">!</span> 必要的
            </h4>
            <div class="ld-tags">
              <span class="ld-tag ld-tag--cond" v-for="(p, i) in licDetail.conditions" :key="i">{{ p }}</span>
            </div>
          </section>

          <!-- 描述 -->
          <section class="ld-section" v-if="licDetail.description">
            <h4 class="ld-section-title">描述</h4>
            <p class="ld-desc">{{ licDetail.description }}</p>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()

/* ===== 数据源 ===== */
import { getComponentMock } from '../../data/componentDetailMocks.js'

const compId = computed(() => route.params.id || 'vertx-web-sstore-cookie')
const comp = computed(() => getComponentMock(compId.value))

const displayPkg = computed(() => {
  const c = comp.value
  if (!c) return {}
  return {
    name: c.name || '—',
    version: c.version || '—',
    language: c.language || '—',
    score: c.score ?? null,
    vulnCount: c.vulnCount ?? null,
    author: c.author || '—',
    released: c.released || '—',
    industry: c.industry || '—',
    lastUpdated: c.lastUpdated || null,
    description: c.descriptionZh || c.descriptionEn || '暂无描述信息',
    license: c.license || null,
    links: c.links || null,
    tags: c.tags || [],
  }
})

/* ===== Tab ===== */
// 版本数量动态显示；其余标签按需求调整
const tabs = computed(() => [
  { key: 'intro', label: '版本信息' },
  { key: 'deps', label: '依赖关系' },
  { key: 'vuln', label: '漏洞信息' },
  { key: 'malware', label: '恶意代码' },
  { key: 'sbom', label: '软件物料清单' },
  { key: 'contrib', label: '贡献者信息' },
  { key: 'license', label: '许可证信息' },
  { key: 'versions', label: `软件版本 (${versionHistory.length})` },
])
const activeTab = ref('intro')
const allowedTabs = ['intro', 'deps', 'vuln', 'malware', 'sbom', 'contrib', 'license', 'versions']

function setTab(key) {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}
function goToVersionIntro(row) {
  router.push({ name: 'software-detail', query: { tab: 'intro', v: row.version } })
}

onMounted(() => {
  const t = route.query.tab
  const tStr = Array.isArray(t) ? t[0] : t
  if (tStr && allowedTabs.includes(String(tStr))) activeTab.value = String(tStr)
})

/* ===== 依赖数据（真实接口结构） ===== */
// 直接依赖
const depList = [
  { id: 212817, component_name: 'commons-codec 1.18.0', group_id: 'commons-codec', artifact_id: 'commons-codec', component_code: '3b9605e11ac6464b839da770fac9e3f7', version: '1.18.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212818, component_name: 'commons-io 2.19.0', group_id: 'commons-io', artifact_id: 'commons-io', component_code: '7a56bde9c83f4fffb8a53cd0fedaeb3c', version: '2.19.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212819, component_name: 'commons-lang3 3.17.0', group_id: 'org.apache.commons', artifact_id: 'commons-lang3', component_code: 'a85fb4eb42c148b28296bd2ba812963d', version: '3.17.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212820, component_name: 'easymock 5.5.0', group_id: 'org.easymock', artifact_id: 'easymock', component_code: '3e48f88878444c18ae3e0c3fd7b01367', version: '5.5.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212821, component_name: 'guava-testlib 33.3.1-jre', group_id: 'com.google.guava', artifact_id: 'guava-testlib', component_code: 'dcac4f2fb0984c68ae2713b95a4b789c', version: '33.3.1-jre', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212822, component_name: 'junit-jupiter-engine UNKNOWN', group_id: 'org.junit.jupiter', artifact_id: 'junit-jupiter-engine', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 212823, component_name: 'junit-jupiter-params UNKNOWN', group_id: 'org.junit.jupiter', artifact_id: 'junit-jupiter-params', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
]
// 传递依赖
const transitiveDeps = [
  { id: 513628, component_name: 'commons-io 2.18.0', group_id: 'commons-io', artifact_id: 'commons-io', component_code: null, version: '2.18.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513629, component_name: 'byte-buddy 1.17.5', group_id: 'net.bytebuddy', artifact_id: 'byte-buddy', component_code: null, version: '1.17.5', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513630, component_name: 'byte-buddy-agent 1.17.5', group_id: 'net.bytebuddy', artifact_id: 'byte-buddy-agent', component_code: null, version: '1.17.5', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513631, component_name: 'jimfs 1.3.0', group_id: 'com.google.jimfs', artifact_id: 'jimfs', component_code: null, version: '1.3.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513632, component_name: 'jmh-core UNKNOWN', group_id: 'org.openjdk.jmh', artifact_id: 'jmh-core', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513633, component_name: 'junit-jupiter UNKNOWN', group_id: 'org.junit.jupiter', artifact_id: 'junit-jupiter', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513634, component_name: 'junit-pioneer UNKNOWN', group_id: 'org.junit-pioneer', artifact_id: 'junit-pioneer', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513635, component_name: 'mockito-inline UNKNOWN', group_id: 'org.mockito', artifact_id: 'mockito-inline', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513636, component_name: 'commons-text 1.12.0', group_id: 'org.apache.commons', artifact_id: 'commons-text', component_code: null, version: '1.12.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513637, component_name: 'easymock 5.4.0', group_id: 'org.easymock', artifact_id: 'easymock', component_code: null, version: '5.4.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513638, component_name: 'hamcrest 3.0', group_id: 'org.hamcrest', artifact_id: 'hamcrest', component_code: null, version: '3.0', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513639, component_name: 'jmh-core 1.37', group_id: 'org.openjdk.jmh', artifact_id: 'jmh-core', component_code: null, version: '1.37', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513640, component_name: 'jmh-generator-annprocess 1.37', group_id: 'org.openjdk.jmh', artifact_id: 'jmh-generator-annprocess', component_code: null, version: '1.37', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513641, component_name: 'jsr305 3.0.2', group_id: 'com.google.code.findbugs', artifact_id: 'jsr305', component_code: null, version: '3.0.2', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513642, component_name: 'junit-pioneer 1.9.1', group_id: 'org.junit-pioneer', artifact_id: 'junit-pioneer', component_code: null, version: '1.9.1', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513644, component_name: 'asm 9.7.1', group_id: 'org.ow2.asm', artifact_id: 'asm', component_code: null, version: '9.7.1', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513645, component_name: 'byte-buddy 1.15.10', group_id: 'net.bytebuddy', artifact_id: 'byte-buddy', component_code: null, version: '1.15.10', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513646, component_name: 'dexmaker UNKNOWN', group_id: 'org.droidparts.dexmaker', artifact_id: 'dexmaker', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513647, component_name: 'junit UNKNOWN', group_id: 'junit', artifact_id: 'junit', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513648, component_name: 'junit-vintage-engine UNKNOWN', group_id: 'org.junit.vintage', artifact_id: 'junit-vintage-engine', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513649, component_name: 'objenesis 3.4', group_id: 'org.objenesis', artifact_id: 'objenesis', component_code: null, version: '3.4', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513650, component_name: 'testng UNKNOWN', group_id: 'org.testng', artifact_id: 'testng', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513651, component_name: 'checker-qual UNKNOWN', group_id: 'org.checkerframework', artifact_id: 'checker-qual', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513652, component_name: 'error_prone_annotations UNKNOWN', group_id: 'com.google.errorprone', artifact_id: 'error_prone_annotations', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513653, component_name: 'guava 33.3.1-jre', group_id: 'com.google.guava', artifact_id: 'guava', component_code: null, version: '33.3.1-jre', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513654, component_name: 'j2objc-annotations UNKNOWN', group_id: 'com.google.j2objc', artifact_id: 'j2objc-annotations', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513655, component_name: 'jsr305 UNKNOWN', group_id: 'com.google.code.findbugs', artifact_id: 'jsr305', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513656, component_name: 'junit 4.13.2', group_id: 'junit', artifact_id: 'junit', component_code: null, version: '4.13.2', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
  { id: 513657, component_name: 'truth UNKNOWN', group_id: 'com.google.truth', artifact_id: 'truth', component_code: null, version: 'UNKNOWN', language: 'Java', software_name: 'Apache Maven Help Plugin', has_children: false },
]
/* ===== 依赖树与图表数据（基于真实数据推导） ===== */
// 全部依赖合并
const depAll = computed(() => [...depList, ...transitiveDeps])

// 按 group_id 分组构建依赖树
const depTree = computed(() => {
  const groups = {}
  for (const d of depAll.value) {
    const g = d.group_id || '未分组'
    if (!groups[g]) groups[g] = []
    groups[g].push(d)
  }
  return Object.entries(groups).map(([group, items]) => ({ group, items }))
})

// 依赖树分组默认收起，点击展开/收起
const openGroups = ref(new Set())
function isGroupOpen(group) {
  return openGroups.value.has(group)
}
function toggleGroup(group) {
  const next = new Set(openGroups.value)
  if (next.has(group)) next.delete(group)
  else next.add(group)
  openGroups.value = next
}

// 选中依赖节点：点击树节点展示该依赖详情
const selectedDep = ref(null)
function selectDep(d) {
  selectedDep.value = d
}

// 来源分布饼图：按 group_id 前两段归类（如 org.apache / com.google / org.junit…）
// 只保留数量前 6 的组，其余合并为「其他」，避免图例过长
const depSourceData = computed(() => {
  const counts = {}
  for (const d of depAll.value) {
    const parts = String(d.group_id || '未知').split('.')
    const key = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0]
    counts[key] = (counts[key] || 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 6).map(([name, value]) => ({ name, value }))
  const rest = sorted.slice(6).reduce((sum, [, value]) => sum + value, 0)
  if (rest > 0) top.push({ name: '其他', value: rest })
  return top
})

// 版本状态饼图：正常版本 / UNKNOWN
const depVersionData = computed(() => {
  const unknown = depAll.value.filter((d) => d.version === 'UNKNOWN').length
  return [
    { name: '正常版本', value: depAll.value.length - unknown },
    { name: '未知版本', value: unknown },
  ]
})

// 依赖统计
const depStats = computed(() => {
  const all = depAll.value
  const unknownVersion = all.filter((d) => d.version === 'UNKNOWN').length
  const knownVersion = all.length - unknownVersion
  return {
    total: all.length,
    groups: new Set(all.map((d) => d.group_id)).size,
    artifacts: new Set(all.map((d) => d.artifact_id)).size,
    unknownVersion,
    knownVersion,
    knownRate: all.length ? Math.round((knownVersion / all.length) * 100) : 0,
    direct: depList.length,
    transitive: transitiveDeps.length,
  }
})

/* ===== 依赖图表（echarts 饼图） ===== */
const depSourceChartRef = ref(null)
const depStatusChartRef = ref(null)
let depSourceChart = null
let depStatusChart = null

function renderDepCharts() {
  if (!depSourceChart || !depStatusChart) return
  const base = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      textStyle: { color: '#6b7280', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 8,
    },
    series: [
      {
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['40%', '50%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { scale: true },
        animationDuration: 800,
      },
    ],
  }
  depSourceChart.setOption({
    ...base,
    color: ['#da203e', '#2563eb', '#0d9488', '#d97706', '#7c3aed', '#059669', '#9ca3af'],
    series: [{ ...base.series[0], data: depSourceData.value }],
  })
  depStatusChart.setOption({
    ...base,
    color: ['#16a34a', '#d97706'],
    series: [{ ...base.series[0], data: depVersionData.value }],
  })
}

function initDepCharts() {
  if (!depSourceChartRef.value || !depStatusChartRef.value) return
  if (!depSourceChart) depSourceChart = echarts.init(depSourceChartRef.value)
  if (!depStatusChart) depStatusChart = echarts.init(depStatusChartRef.value)
  renderDepCharts()
  resizeDepCharts()
}

function resizeDepCharts() {
  depSourceChart?.resize()
  depStatusChart?.resize()
}

function disposeDepCharts() {
  depSourceChart?.dispose()
  depStatusChart?.dispose()
  depSourceChart = null
  depStatusChart = null
}

// 切到「依赖关系」/「漏洞信息」/「许可证信息」Tab 时初始化对应图表。
// 注意：外层用 v-show，元素初始 display:none，echarts.init 会拿到 0 尺寸，
// 必须等切换完成、布局稳定后再初始化；离开时销毁实例避免引用已隐藏的 DOM。
watch(activeTab, (t) => {
  if (t === 'deps') {
    disposeVulnCharts()
    disposeLicAttrChart()
    requestAnimationFrame(() => {
      nextTick(() => {
        initDepCharts()
      })
    })
    return
  }
  if (t === 'vuln') {
    disposeDepCharts()
    disposeLicAttrChart()
    requestAnimationFrame(() => {
      nextTick(() => {
        initVulnCharts()
      })
    })
    return
  }
  if (t === 'license') {
    disposeDepCharts()
    disposeVulnCharts()
    requestAnimationFrame(() => {
      nextTick(() => {
        initLicAttrChart()
      })
    })
    return
  }
  disposeDepCharts()
  disposeVulnCharts()
  disposeLicAttrChart()
})

/* ===== 漏洞数据（对接真实接口：列表 + 详情） ===== */
// 列表接口 data 字段：id / cve_id / vuln_name / severity / cwe_id / cvss_score /
// affected_version / fixed_version / repair_status / patch_version / publish_date …
const vulnListRaw = [
  {
    id: 3075,
    cve_id: 'CVE-2024-3772',
    vuln_name: 'Regular expression denial of service in Pydantic < 2.4.0',
    severity: 'MEDIUM',
    cwe_id: 'CWE-1333',
    cvss_score: 5.9,
    affected_version: 'v0.24.0rc1',
    fixed_version: '2.11.7',
    repair_status: 0,
    patch_version: '2.11.7',
    publish_date: '2024-04-16',
  },
]

// 严重等级展示映射
const SEV_META = {
  CRITICAL: { key: 'crit', label: '超危' },
  HIGH: { key: 'high', label: '高危' },
  MEDIUM: { key: 'med', label: '中危' },
  LOW: { key: 'low', label: '低危' },
}

// 概览统计由列表数据派生
const vulnData = computed(() => {
  const total = vulnListRaw.length
  const count = (sev) => vulnListRaw.filter((v) => v.severity === sev).length
  return {
    critical: count('CRITICAL'),
    high: count('HIGH'),
    medium: count('MEDIUM'),
    low: count('LOW'),
    total,
  }
})
const vulnTrendPct = computed(() => {
  const t = vulnData.value.total || 1
  return {
    critical: (vulnData.value.critical / t) * 100,
    high: (vulnData.value.high / t) * 100,
    medium: (vulnData.value.medium / t) * 100,
    low: (vulnData.value.low / t) * 100,
  }
})

/* ===== 漏洞分析 ===== */
// ===== 漏洞图表（echarts，数据全部来自真实列表字段） =====
const vulnSevChartRef = ref(null)
let vulnSevChart = null

// 等级分布：按 severity 字段统计
const vulnSevData = computed(() =>
  ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    .map((sev) => ({
      name: SEV_META[sev].label,
      value: vulnData.value[SEV_META[sev].key] || 0,
    }))
    .filter((d) => d.value > 0)
)

function renderVulnCharts() {
  if (!vulnSevChart) return
  // 无数据时回退为四等级等分占位环 + 中心文字，避免图表空白
  const hasData = vulnSevData.value.length > 0
  const data = hasData
    ? vulnSevData.value
    : [
        { name: '超危', value: 1 },
        { name: '高危', value: 1 },
        { name: '中危', value: 1 },
        { name: '低危', value: 1 },
      ]
  vulnSevChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      icon: 'circle',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 12,
      textStyle: { color: '#6b7280', fontSize: 12 },
      formatter: (name) => {
        // 无数据时统一显示 0%，不按等分占位算占比
        if (!hasData) return `${name}  0%`
        const item = data.find((d) => d.name === name)
        const total = data.reduce((s, d) => s + d.value, 0)
        const pct = total && item ? Math.round((item.value / total) * 100) : 0
        return `${name}  ${pct}%`
      },
    },
    color: ['#dc2626', '#d97706', '#2563eb', '#9ca3af'],
    graphic: hasData
      ? [{
          type: 'text',
          left: 'center',
          top: '38%',
          style: { text: String(vulnData.value.total), fontSize: 26, fontWeight: 800, fill: '#111827' },
        }]
      : [],
    series: [{
      type: 'pie',
      radius: ['42%', '66%'],
      center: ['50%', '44%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { scale: true },
      animationDuration: 600,
      data,
    }],
  })
}

function initVulnCharts() {
  if (!vulnSevChartRef.value) return
  if (!vulnSevChart) vulnSevChart = echarts.init(vulnSevChartRef.value)
  renderVulnCharts()
  resizeVulnCharts()
}

function resizeVulnCharts() {
  vulnSevChart?.resize()
}

function disposeVulnCharts() {
  vulnSevChart?.dispose()
  vulnSevChart = null
}

// 列表展示行：附带展示用的等级字段
const vulnList = computed(() =>
  vulnListRaw.map((v) => {
    const sev = SEV_META[v.severity] || SEV_META.LOW
    return {
      ...v,
      level: sev.key,
      levelLabel: sev.label,
    }
  })
)

// 详情接口 data 字段（点击列表行后按 id 取详情，抽屉展示）
const vulnDetailMap = {
  3075: {
    id: 3075,
    cve_id: 'CVE-2024-3772',
    vuln_level: 'MEDIUM',
    cwe_id: 'CWE-1333',
    cvss_score: 5.9,
    publish_time: '2024-04-15T01:42:08',
    vuln_name: 'Regular expression denial of service in Pydantic < 2.4.0',
    summary: 'Regular expression denial of service in Pydanic < 2.4.0, < 1.10.13 allows remote attackers to cause denial of service via a crafted email string.',
    affected_version: 'v0.24.0rc1',
    fixed_version: '2.11.7',
    patch_version: '2.11.7',
    repair_status: 0,
    attack_vector: 'NETWORK',
    attack_complexity: 'HIGH',
    user_interaction: 'NONE',
    privileges_required: 'NONE',
    component_name: 'Pydantic/Pydantic',
    ref_url: '[https://github.com/pydantic/pydantic/pull/7360, https://lists.fedoraproject.org/archives/list/package-announce@lists.fedoraproject.org/message/6JBZLMSH4GAZOVBMT2JUO2LXHY7M2ALI/]',
    source_ref: 'https://pre-huake.tosslib.com/gateway/api/v1/supply-chain/scans/136036/issues/9563',
  },
}
const vulnDetail = ref(null)
function openVulnDetail(v) {
  vulnDetail.value = vulnDetailMap[v.id] || null
}

/* ===== 漏洞详情抽屉辅助 ===== */
const detailLevel = computed(() => {
  const sev = SEV_META[vulnDetail.value?.vuln_level] || SEV_META.LOW
  return sev.key
})
const detailLevelLabel = computed(() => {
  const sev = SEV_META[vulnDetail.value?.vuln_level] || SEV_META.LOW
  return sev.label
})
// 参考链接：ref_url / extra_info 可能是 "[url1, url2]" 或 "[\"url1\", \"url2\"]" 形式的字符串
const vulnRefs = computed(() => {
  const d = vulnDetail.value
  if (!d) return []
  const raw = d.ref_url || d.extra_info || ''
  const cleaned = raw.replace(/^\[|\]$/g, '').replace(/"/g, '')
  return cleaned.split(',').map((s) => s.trim()).filter(Boolean)
})
// CVSS 属性中文映射
const ATTR_MAP = {
  attack_vector: { NETWORK: '网络', ADJACENT_NETWORK: '相邻网络', LOCAL: '本地', PHYSICAL: '物理' },
  attack_complexity: { LOW: '低', HIGH: '高' },
  user_interaction: { NONE: '无需', REQUIRED: '需要' },
  privileges_required: { NONE: '无', LOW: '低', HIGH: '高' },
}
function attrLabel(kind, val) {
  if (!val) return '—'
  const m = ATTR_MAP[kind] || {}
  return m[val] || val
}

/* ===== 恶意代码数据 ===== */
const malwareData = {
  total: 128,
  malicious: 1,
  suspicious: 3,
  clean: 124,
}
const malwareCleanRate = computed(() => {
  if (!malwareData.total) return 0
  return Math.round((malwareData.clean / malwareData.total) * 100)
})
const malwareEngines = [
  { name: 'ClamAV 病毒库', status: 'ok', statusLabel: '正常' },
  { name: 'YARA 规则引擎', status: 'ok', statusLabel: '正常' },
  { name: '行为沙箱分析', status: 'warn', statusLabel: '有告警' },
  { name: '恶意 URL 情报', status: 'ok', statusLabel: '正常' },
]
const malwareList = [
  { id: 1, file: 'lib/jndi-exploit-2.0.jar', level: 'malicious', levelLabel: '恶意', type: '远程代码执行', desc: '检测到 JNDI 注入利用链特征（log4shell 变种）' },
  { id: 2, file: 'src/main/resources/app.properties', level: 'suspicious', levelLabel: '可疑', type: '硬编码密钥', desc: '发现疑似硬编码的加密密钥或口令' },
  { id: 3, file: 'bin/updater.sh', level: 'suspicious', levelLabel: '可疑', type: '外联下载', desc: '脚本中存在下载并执行外部程序的指令' },
  { id: 4, file: 'conf/logback.xml', level: 'suspicious', levelLabel: '可疑', type: '可疑配置', desc: '配置中包含回连地址（C2 特征）' },
]

/* ===== SBOM 数据 ===== */
const sbomData = {
  total: 86,
  direct: 7,
  transitive: 79,
  unique: 84,
  licenses: 12,
}
const sbomList = [
  { id: 1, group: 'org.apache.commons', artifact: 'commons-lang3', version: '3.17.0', license: 'Apache-2.0' },
  { id: 2, group: 'com.google.guava', artifact: 'guava', version: '33.3.1-jre', license: 'Apache-2.0' },
  { id: 3, group: 'org.slf4j', artifact: 'slf4j-api', version: '2.0.16', license: 'MIT' },
  { id: 4, group: 'com.fasterxml.jackson.core', artifact: 'jackson-databind', version: '2.18.2', license: 'Apache-2.0' },
  { id: 5, group: 'org.junit.jupiter', artifact: 'junit-jupiter-engine', version: '5.11.4', license: 'EPL-2.0' },
  { id: 6, group: 'net.bytebuddy', artifact: 'byte-buddy', version: '1.17.5', license: 'Apache-2.0' },
  { id: 7, group: 'org.mockito', artifact: 'mockito-core', version: '5.15.2', license: 'MIT' },
  { id: 8, group: 'org.hamcrest', artifact: 'hamcrest', version: '3.0', license: 'BSD-3-Clause' },
]

// 直接依赖占比（用于概览比例条）
const sbomDirectPct = computed(() => {
  const t = sbomData.direct + sbomData.transitive
  return t ? Math.round((sbomData.direct / t) * 100) : 0
})

/* ===== SBOM 风险分析（整合漏洞 + 依赖数据） ===== */
// 统计：漏洞总数 / 未知版本依赖 / 依赖组件总数
const sbomRiskStats = computed(() => ({
  vulnTotal: vulnListRaw.length,
  unknownDeps: depAll.value.filter((d) => d.version === 'UNKNOWN').length,
  depTotal: depAll.value.length,
}))

/* ===== 许可证数据（对接真实接口：列表 + 详情） ===== */
// 列表接口字段：name(许可证名称) / type(许可证类型) / approved(是否批准)
const licenseListRaw = [
  {
    id: 1,
    name: 'Apache License 2.0',
    type: 'apache',
    approved: true,
    detail: {
      name: 'Apache License 2.0',
      version: '3.28.0',
      type: 'apache',
      status: '已批准',
      permissions: ['commercial-use', 'modifications', 'distribution', 'patent-use', 'private-use'],
      limitations: ['trademark-use', 'liability', 'warranty'],
      conditions: ['include-copyright', 'document-changes'],
      description: 'A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.',
    },
  },
  {
    id: 2,
    name: 'MIT License',
    type: 'mit',
    approved: true,
    detail: {
      name: 'MIT License',
      version: '3.28.0',
      type: 'mit',
      status: '已批准',
      permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'],
      limitations: ['liability', 'warranty'],
      conditions: ['include-copyright'],
      description: 'A short, permissive license that allows reuse with few restrictions, requiring only that the original copyright notice is preserved. Licensed works, modifications, and larger works may be distributed under different terms and without source code.',
    },
  },
  {
    id: 3,
    name: 'BSD 3-Clause License',
    type: 'bsd',
    approved: true,
    detail: {
      name: 'BSD 3-Clause License',
      version: '3.28.0',
      type: 'bsd',
      status: '已批准',
      permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'],
      limitations: ['liability', 'warranty'],
      conditions: ['include-copyright', 'document-changes'],
      description: 'A permissive license similar to MIT, with an additional clause prohibiting the use of contributors names to endorse derived products without permission.',
    },
  },
  {
    id: 4,
    name: 'GNU General Public License v3.0',
    type: 'gpl',
    approved: true,
    detail: {
      name: 'GNU General Public License v3.0',
      version: '3.28.0',
      type: 'gpl',
      status: '已批准',
      permissions: ['commercial-use', 'modifications', 'distribution', 'patent-use', 'private-use'],
      limitations: ['liability', 'warranty'],
      conditions: ['include-copyright', 'document-changes', 'disclose-source', 'same-license'],
      description: 'A strong copyleft license requiring derivative works to be licensed under the same terms and source code to be disclosed when the software is distributed.',
    },
  },
]

// 批准状态展示
const licApprovedLabel = (approved) => (approved ? '已批准' : '未批准')
const licApprovedClass = (approved) => (approved ? 'lic-st lic-st--ok' : 'lic-st lic-st--warn')

// 列表展示行
const licList = computed(() =>
  licenseListRaw.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    approved: l.approved,
    approvedLabel: licApprovedLabel(l.approved),
    approvedClass: licApprovedClass(l.approved),
    permissionCount: l.detail?.permissions?.length || 0,
    limitationCount: l.detail?.limitations?.length || 0,
    conditionCount: l.detail?.conditions?.length || 0,
  }))
)

// 概览统计（全部基于列表真实字段）
const licStats = computed(() => {
  const list = licenseListRaw
  return {
    total: list.length,
    approved: list.filter((l) => l.approved).length,
    pending: list.filter((l) => !l.approved).length,
    typeCount: new Set(list.map((l) => l.type)).size,
  }
})

/* ===== 许可证分析（基于列表 + 详情真实字段） ===== */
// 单许可证属性结构：允许/受限/必要 数量与占比（大部分仓库只有一个许可证，按首个许可证分析）
const licAttrStruct = computed(() => {
  const d = licenseListRaw[0]?.detail || {}
  const permissions = d.permissions?.length || 0
  const limitations = d.limitations?.length || 0
  const conditions = d.conditions?.length || 0
  const total = permissions + limitations + conditions || 1
  return [
    { key: 'perm', label: '允许', count: permissions, pct: Math.round((permissions / total) * 100) },
    { key: 'lim', label: '受限', count: limitations, pct: Math.round((limitations / total) * 100) },
    { key: 'cond', label: '必要', count: conditions, pct: Math.round((conditions / total) * 100) },
  ]
})
// 集成风险：按许可证类型映射风险等级（低/中/高）
const RISK_BY_TYPE = {
  apache: '低', mit: '低', bsd: '低',
  epl: '中', mpl: '中', lgpl: '中',
  gpl: '高', agpl: '高', cddl: '中',
}
const licRiskLevel = computed(() => {
  const t = licenseListRaw[0]?.type || '未知'
  return RISK_BY_TYPE[t] || '中'
})
// 风险等级对应的样式 key
const licRiskKey = computed(() => {
  const map = { 低: 'low', 中: 'mid', 高: 'high' }
  return map[licRiskLevel.value] || 'mid'
})
// 风险等级展示配置
const RISK_LEVELS = [
  { key: '低', label: '低', cls: 'lic-risk--low' },
  { key: '中', label: '中', cls: 'lic-risk--mid' },
  { key: '高', label: '高', cls: 'lic-risk--high' },
]

/* ===== 属性占比环形图（echarts，数据来自 licAttrStruct） ===== */
const licAttrChartRef = ref(null)
let licAttrChart = null

function renderLicAttrChart() {
  if (!licAttrChart) return
  licAttrChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
    color: ['#16a34a', '#dc2626', '#2563eb'],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { scale: true },
      animationDuration: 600,
      data: licAttrStruct.value.map((s) => ({ name: s.label, value: s.count })),
    }],
  })
}

function initLicAttrChart() {
  if (!licAttrChartRef.value) return
  if (!licAttrChart) licAttrChart = echarts.init(licAttrChartRef.value)
  renderLicAttrChart()
  resizeLicAttrChart()
}

function resizeLicAttrChart() {
  licAttrChart?.resize()
}

function disposeLicAttrChart() {
  licAttrChart?.dispose()
  licAttrChart = null
}

// 详情接口 data 字段（点击卡片后按 id 取详情，抽屉展示）
const licDetailMap = Object.fromEntries(licenseListRaw.map((l) => [l.id, l.detail]))
const licDetail = ref(null)
function openLicDetail(l) {
  licDetail.value = licDetailMap[l.id] || null
}
function closeLicDetail() {
  licDetail.value = null
}

/* ===== 贡献者数据 ===== */
const contribData = { total: 47, recent: 12, commits: 318 }
const scoreData = { scorecard: 4.8, criticality: 0.58 }
const contribList = [
  { name: 'Thomas Liu', commits: 128, pct: 40 },
  { name: 'Jane Doe', commits: 92, pct: 29 },
  { name: 'Alex Wang', commits: 58, pct: 18 },
  { name: 'Sarah Chen', commits: 25, pct: 8 },
  { name: 'Mike Zhang', commits: 15, pct: 5 },
]

/* ===== 版本数据 ===== */
const versionHistory = [
  { version: '2.3.7', score: '5.5', released: '2023-08-14', vulnCount: 3 },
  { version: '2.3.6', score: '5.4', released: '2023-07-01', vulnCount: 4 },
  { version: '2.3.5', score: '5.3', released: '2023-05-15', vulnCount: 5 },
  { version: '2.3.4', score: '5.2', released: '2023-04-01', vulnCount: 5 },
  { version: '2.3.3', score: '5.2', released: '2023-02-10', vulnCount: 6 },
  { version: '2.3.2', score: '5.1', released: '2022-12-05', vulnCount: 6 },
  { version: '2.3.1', score: '5.0', released: '2022-10-18', vulnCount: 7 },
  { version: '2.3.0', score: '5.0', released: '2022-09-01', vulnCount: 7 },
  { version: '2.2.9', score: '4.9', released: '2022-06-22', vulnCount: 8 },
  { version: '2.2.8', score: '4.9', released: '2022-04-13', vulnCount: 8 },
  { version: '2.2.7', score: '4.8', released: '2022-02-28', vulnCount: 9 },
  { version: '2.2.6', score: '4.8', released: '2021-12-09', vulnCount: 9 },
  { version: '2.2.5', score: '4.7', released: '2021-10-14', vulnCount: 10 },
  { version: '2.2.4', score: '4.7', released: '2021-08-05', vulnCount: 10 },
  { version: '2.2.3', score: '4.6', released: '2021-06-17', vulnCount: 11 },
  { version: '2.2.2', score: '4.6', released: '2021-04-08', vulnCount: 11 },
  { version: '2.2.1', score: '4.5', released: '2021-02-11', vulnCount: 12 },
  { version: '2.2.0', score: '4.5', released: '2020-12-03', vulnCount: 12 },
  { version: '2.1.9', score: '4.4', released: '2020-10-08', vulnCount: 13 },
]
</script>

<style scoped>
/* ============================================================
   排版修复 — 保持原有浅色配色，仅修复布局问题
   ============================================================ */

/* --- 页面容器：增加左右边距避免内容贴边，底部留白 --- */
.detail { margin: 0 auto; padding: 0 12px 24px; }

/* ============================================================
   HERO
   ============================================================ */
.hero-card {
  background: linear-gradient(145deg, #ffffff, #fafbfc);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  margin: 10px 0 0 18px;
  background: linear-gradient(135deg, rgba(218,32,62,0.08), rgba(218,32,62,0.03));
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #da203e;
  letter-spacing: 0.04em;
}
.hero-badge-ico { font-size: 13px; line-height: 1; }
.hero-badge-text { text-transform: uppercase; }

.hero-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding: 8px 18px 12px;
}
.hero-lead { flex: 1 1 220px; min-width: 0; }
.hero-title {
  margin: 0 0 6px;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
  word-break: break-word;
  letter-spacing: -0.01em;
}

/* meta strip：改用 gap + 内边框代替零散的 divider span */
.hero-meta-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
}
.hero-meta-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 0 16px;
  min-width: 0;
}
.hero-meta-cell:first-of-type { padding-left: 0; }
.hero-meta-k {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  line-height: 1.2;
}
.hero-meta-v {
  font-size: clamp(13px, 1.8vw, 16px);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
}
.hero-meta-v--ver { font-variant-numeric: tabular-nums; color: #2563eb; }
.hero-meta-v--score { font-variant-numeric: tabular-nums; color: #7c3aed; }
.hero-meta-v--vuln-line { font-weight: 600; color: #374151; }
.hero-meta-v--lang { color: #0d9488; }
.hero-meta-v--lic { color: #b45309; }
.hero-vuln-empty { color: #a8a8a8; font-weight: 500; }
.hero-vuln-num--high { color: #d03710; font-weight: 800; }

/* 分隔线：用 border-left 替代 span 分隔符，布局更稳定 */
.hero-meta-divider {
  width: 1px;
  flex-shrink: 0;
  align-self: stretch;
  min-height: 2.2rem;
  background: linear-gradient(180deg, transparent, #d1d5db 12%, #d1d5db 88%, transparent);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 0 0 auto;
}

/* ===== Buttons ===== */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-family: inherit;
  transition: all .15s;
}
.btn-ghost:hover { background: #f9fafb; border-color: #d1d5db; }
.btn-primary { background: #da203e; border-color: #da203e; color: #fff; font-weight: 600; }
.btn-primary:hover { filter: brightness(0.92); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 720px) {
  .hero-card { padding: 0; }
  .hero-body { padding: 10px 14px 12px; }
}
@media (max-width: 480px) {
  .hero-actions { width: 100%; justify-content: flex-start; }
}

/* ============================================================
   TABS — 修复标签在窄屏溢出
   ============================================================ */
.tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  margin-top: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }

.tab {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px 12px;
  border: none;
  background: none;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: color .15s;
  font-family: inherit;
  border-radius: 8px 8px 0 0;
}
.tab:hover { color: #111827; background: #f9fafb; }
.tab.is-active { color: #da203e; font-weight: 600; }
.tab.is-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 3px;
  background: #da203e;
  border-radius: 2px 2px 0 0;
}

.tab-panel { margin-top: 14px; min-height: 300px; }

/* ============================================================
   CARD GRID — 修复响应式断点，卡片不对齐问题
   ============================================================ */
.card-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.card-grid-1col { display: grid; grid-template-columns: 1fr; gap: 16px; }
.card-grid-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

@media (max-width: 860px) {
  .card-grid-3col { grid-template-columns: 1fr 1fr; }
}
/* 窄屏全部变单列 */
@media (max-width: 720px) {
  .card-grid-2col,
  .card-grid-3col { grid-template-columns: 1fr; }
}

/* ============================================================
   DEPS LAYOUT — 依赖关系 Tab：左侧依赖树 + 右侧三卡竖排
   ============================================================ */
.deps-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}
.deps-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
/* 依赖统计卡内部间距微调，保证与上方两张图卡对齐 */
.deps-side .info-card-fill--fancy { align-self: stretch; }

@media (max-width: 860px) {
  .deps-layout { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
}
@media (max-width: 720px) {
  .deps-layout { grid-template-columns: 1fr; }
  /* 树卡回到普通流，不再跨行占满左列 */
  .info-card-fill--tree { grid-column: auto; grid-row: auto; }
}

/* ============================================================
   INFO CARD — 修复卡片高度不一致、内边距不匀
   ============================================================ */
.info-card-fill {
  background: #fff;
  border: 1px solid #edf0f3;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.info-card-fill:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-color: #e0e3e8;
}
/* 同一行卡片等高：内容不足时底部留白，但保持边框对齐 */
.info-card-fill { min-height: 0; }
.info-card-fill--wide { grid-column: 1 / -1; }
/* 依赖关系树独占左列：跨所有行，右侧三张卡片竖排 */
.info-card-fill--tree {
  grid-column: 1;
  grid-row: 1 / -1;
  min-width: 0;
}
/* 表格区域自适应填满卡片剩余高度，内容超长才滚动 */
.info-card-fill--tree .dep-tree-table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}
.info-card-fill--tree .dep-tree-table::-webkit-scrollbar { width: 6px; height: 6px; }
.info-card-fill--tree .dep-tree-table::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }
.info-card-fill--tree .dep-tree-table::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.card-header-ico {
  font-size: 16px;
  line-height: 1;
  color: #da203e;
  opacity: 0.8;
  flex-shrink: 0;
}
.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.card-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.card-badge--sk { background: #e5e7eb; color: #9ca3af; }

/* ============================================================
   INFO DL — 修复 dt/dd 在窄屏不对齐
   ============================================================ */
.info-dl { margin: 0; }
.info-row {
  display: grid;
  grid-template-columns: minmax(64px, 80px) 1fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  align-items: baseline;
}
.info-row:last-child { border-bottom: none; }
.info-row dt { color: #9ca3af; font-weight: 500; word-break: keep-all; }
.info-row dd { margin: 0; color: #374151; word-break: break-word; min-width: 0; }

.badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 11px;
  color: #374151;
}
.badge-lic { background: rgba(218,32,62,0.08); color: #da203e; font-weight: 500; }
.na-text { color: #d1d5db; }
.link-text { color: #da203e; text-decoration: none; font-weight: 500; }
.link-text:hover { text-decoration: underline; }
.desc-text {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
}

/* ============================================================
   MONO TEXT（许可证编码 / 组件坐标）
   ============================================================ */
.mono-text {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
}

/* ============================================================
   空数据占位提示
   ============================================================ */
.empty-note {
  padding: 14px 0;
  text-align: center;
  font-size: 12px;
  color: #d1d5db;
  letter-spacing: 0.02em;
}

/* ============================================================
   许可证概览（与下方卡片组留出间距）
   ============================================================ */
.lic-summary { margin-bottom: 16px; }

/* ============================================================
   TAG CLOUD
   ============================================================ */
.tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-pill {
  display: inline-block;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  background: #f3f4f6;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}
.tag-cloud--sk { gap: 8px; }
.sk-pill {
  display: inline-block;
  height: 24px;
  width: 56px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f0f1f3 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* ============================================================
   SKELETON
   ============================================================ */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.sk-block {
  display: inline-block;
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
.sk-line {
  height: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
.sk-line:nth-child(1) { width: 85%; }
.sk-line:nth-child(2) { width: 68%; }
.sk-line:nth-child(3) { width: 76%; }

.desc-skeleton { margin-top: 12px; }
.dep-skeleton-note {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #d1d5db;
  letter-spacing: 0.02em;
}
.sk-dep-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.sk-dep-row:last-child { border-bottom: none; }
.sk-block--name { flex: 1; height: 15px; }
.sk-block--ver { width: 70px; height: 13px; }
.sk-block--lic { width: 70px; height: 13px; border-radius: 4px; }

.sk-vuln-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.sk-vuln-row:last-child { border-bottom: none; }
.sk-block--lvl { width: 42px; height: 22px; border-radius: 4px; }
.sk-block--id { width: 110px; height: 13px; }
.sk-block--desc { flex: 1; height: 13px; }
.sk-block--st { width: 50px; height: 13px; }

.sk-block--title { flex: 1; height: 16px; max-width: 160px; }
.sk-block--badge { width: 44px; height: 18px; border-radius: 4px; }
.sk-info-row {
  display: grid;
  grid-template-columns: minmax(64px, 80px) 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f3;
}
.sk-info-row:last-child { border-bottom: none; }
.sk-block--dt { height: 12px; width: 50px; }
.sk-block--dd { height: 12px; width: 70px; }

.sk-contrib-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.sk-contrib-row:last-child { border-bottom: none; }
.sk-block--rank { width: 22px; height: 18px; border-radius: 50%; }
.sk-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
.sk-block--cname { width: 100px; height: 13px; }
.sk-block--cbar { flex: 1; height: 8px; border-radius: 4px; }
.sk-block--ccnt { width: 70px; height: 13px; }

.sk-version-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #eceef2;
  border-radius: 10px;
}
.sk-version-left { display: flex; align-items: center; gap: 8px; }
.sk-version-mid { display: flex; flex: 1; gap: 16px; }
.sk-version-right { flex-shrink: 0; }
.sk-block--pill { width: 36px; height: 18px; border-radius: 4px; }
.sk-block--vnum { width: 52px; height: 16px; }
.sk-block--vdate { width: 90px; height: 12px; }
.sk-block--vvuln { width: 70px; height: 12px; }
.sk-block--vscore { width: 64px; height: 14px; border-radius: 4px; }

/* ============================================================
   STAT CARDS — 修复窄屏下网格崩坏
   ============================================================ */
.stat-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stat-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.stat-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }
.stat-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }

.stat-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  border: 1px solid transparent;
  transition: all .15s;
  position: relative;
  overflow: hidden;
}
.stat-card:hover { border-color: #e5e7eb; background: #fff; }
.stat-card--accent { background: linear-gradient(145deg, #f8f9fb, #f3f4f6); }
.stat-card--risk { border-left: 3px solid #ef4444; }
.stat-card--crit { border-left: 3px solid #dc2626; }
.stat-card--high { border-left: 3px solid #d97706; }
.stat-card--med { border-left: 3px solid #2563eb; }
.stat-card--low { border-left: 3px solid #6b7280; }

/* 许可证概览 stat-card：图标居左 + 大图标 */
.lic-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 14px 12px;
}
.lic-stat-card .stat-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}
.lic-stat-card .stat-ico svg {
  width: 22px;
  height: 22px;
}
.lic-stat-card .stat-ico--total { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
.lic-stat-card .stat-ico--ok { background: linear-gradient(135deg, #16a34a, #22c55e); }
.lic-stat-card .stat-ico--warn { background: linear-gradient(135deg, #d97706, #f59e0b); }
.lic-stat-card .stat-ico--type { background: linear-gradient(135deg, #2563eb, #3b82f6); }
/* 集成风险 KPI 格：图标与数值按风险等级着色 */
.lic-stat-card .stat-ico--low { background: linear-gradient(135deg, #16a34a, #22c55e); }
.lic-stat-card .stat-ico--mid { background: linear-gradient(135deg, #d97706, #f59e0b); }
.lic-stat-card .stat-ico--high { background: linear-gradient(135deg, #dc2626, #ef4444); }
.lic-risk-val--low { color: #16a34a; }
.lic-risk-val--mid { color: #d97706; }
.lic-risk-val--high { color: #dc2626; }
.lic-stat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.lic-stat-card .stat-val {
  font-size: 24px;
  line-height: 1.15;
}
.lic-stat-card .stat-lbl {
  margin-top: 2px;
}

.stat-val {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.stat-lbl {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* ============================================================
   FANCY STAT CARD — 依赖统计卡（浅色主题，与其他卡片一致）
   ============================================================ */
.info-card-fill--fancy {
  background: linear-gradient(145deg, #f8f9fb, #f3f4f6);
  border: 1px solid #edf0f3;
  color: #111827;
  position: relative;
  overflow: hidden;
}
.info-card-fill--fancy::before {
  content: '';
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(218,32,62,0.05), transparent 70%);
  top: -70px;
  right: -60px;
  pointer-events: none;
}
.info-card-fill--fancy .card-title { color: #111827; }
.info-card-fill--fancy .card-header-ico { color: #da203e; opacity: 1; }
.card-badge--fancy {
  background: #fff;
  color: #da203e;
  border: 1px solid rgba(218,32,62,0.2);
}
.fancy-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  position: relative;
}
.fancy-stat {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 9px 8px;
  text-align: center;
  transition: transform 0.15s, background 0.15s, border-color 0.15s;
}
.fancy-stat:hover { transform: translateY(-2px); background: #fff; border-color: #d1d5db; }
.fancy-val {
  display: block;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.fancy-lbl {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 3px;
}
.fancy-stat--total .fancy-val { color: #d97706; }
.fancy-stat--groups .fancy-val { color: #2563eb; }
.fancy-stat--artifacts .fancy-val { color: #059669; }
.fancy-stat--direct .fancy-val { color: #0891b2; }
.fancy-stat--transitive .fancy-val { color: #7c3aed; }
.fancy-stat--unknown .fancy-val { color: #ef4444; }
.fancy-rate { margin-top: 12px; position: relative; }
.fancy-rate-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.fancy-rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #0891b2);
  border-radius: 999px;
  transition: width 0.3s;
}
.fancy-rate-text {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 6px;
  text-align: right;
}

/* ============================================================
   DEPENDENCY TREE — 依赖关系树（带表头的表格结构）
   ============================================================ */
/* 表格容器：自适应卡片宽度，内容超宽时在容器内横向滚动 */
.dep-tree-table {
  font-size: 12.5px;
  min-width: 0;
}
/* 表头行 */
.dep-th-row,
.dep-tr {
  display: grid;
  grid-template-columns:
    minmax(190px, 1.6fr)
    minmax(130px, 1.2fr)
    minmax(110px, 1fr)
    minmax(70px, 0.7fr)
    minmax(70px, 0.7fr)
    minmax(100px, 1fr)
    72px;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  min-width: 860px;
}
.dep-th-row {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  white-space: nowrap;
}
.dep-th--op { text-align: center; }
/* 数据行 */
.dep-tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background .15s;
}
.dep-tr:last-child { border-bottom: none; }
.dep-td {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dep-td--name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #111827;
}
.dep-td--mono {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 11.5px;
  color: #6b7280;
}
.dep-td--mono.is-unknown { color: #b45309; font-style: italic; }
.dep-td--ver { font-variant-numeric: tabular-nums; color: #374151; }
.dep-td--op { text-align: center; }
/* 根节点行 */
.dep-tr--root {
  background: linear-gradient(145deg, #fafafa, #f6f7f8);
  font-weight: 700;
  color: #111827;
}
.dep-root-ver {
  font-weight: 600;
  color: #da203e;
  font-variant-numeric: tabular-nums;
}
/* 分组行 */
.dep-tr--group {
  cursor: pointer;
  user-select: none;
  background: #fafafa;
  font-weight: 700;
  color: #4b5563;
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 11.5px;
}
.dep-tr--group:hover { background: #f3f4f6; }
.dep-group-count {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
/* 叶子行 */
.dep-tr--leaf { cursor: pointer; }
.dep-tr--leaf:hover { background: #f9fafb; }
.dep-tr--leaf.is-selected { background: rgba(218, 32, 62, 0.08); }
.dep-tr--leaf.is-selected .dep-td--name { color: #da203e; font-weight: 600; }
.dep-leaf-name { padding-left: 14px; }
.dep-indent { flex-shrink: 0; }
/* 展开箭头 / 圆点（表格内沿用） */
.tree-caret {
  width: 12px;
  flex-shrink: 0;
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
  transition: transform .15s;
}
.tree-caret.is-open { transform: rotate(90deg); color: #da203e; }
.tree-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
}
.tree-dot--root {
  width: 10px;
  height: 10px;
  background: #da203e;
  box-shadow: 0 0 0 3px rgba(218, 32, 62, 0.12);
}
/* 下载按钮 */
.dep-download-btn {
  display: inline-block;
  padding: 3px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #fff;
  background: #da203e;
  border-radius: 6px;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 0.15s;
}
.dep-download-btn:hover { filter: brightness(0.92); }

/* ============================================================
   DEPENDENCY CHARTS — 依赖饼图
   ============================================================ */
.pie-chart {
  width: 100%;
  height: 180px;
  margin-top: 4px;
}

/* ============================================================
   VULN TIP — 漏洞状态提示条
   ============================================================ */
.vuln-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(218, 32, 62, 0.08), rgba(218, 32, 62, 0.02));
  border: 1px solid rgba(218, 32, 62, 0.18);
  border-left: 4px solid #da203e;
  border-radius: 12px;
}
.vuln-tip.is-clean {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(22, 163, 74, 0.02));
  border-color: rgba(22, 163, 74, 0.18);
  border-left-color: #16a34a;
}
.vuln-tip-ico {
  font-size: 20px;
  line-height: 1.3;
  flex-shrink: 0;
}
.vuln-tip-body {
  min-width: 0;
}
.vuln-tip-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}
.vuln-tip.is-clean .vuln-tip-title { color: #166534; }
.vuln-tip-text {
  margin: 0;
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.65;
}

/* ============================================================
   VULNERABILITY — 修复列表换行错位
   ============================================================ */
.vuln-trend-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 14px;
  background: #f3f4f6;
}
.vuln-trend-seg { transition: width 0.5s ease; }
.vuln-trend-seg.crit { background: #dc2626; }
.vuln-trend-seg.high { background: #d97706; }
.vuln-trend-seg.med { background: #2563eb; }
.vuln-trend-seg.low { background: #9ca3af; }

.vuln-list-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.vuln-list-item:hover { background: #f9fafb; }
.vuln-list-item:last-child { border-bottom: none; }
/* 漏洞骨架列表：与真实列表间距一致 */
.vuln-sk-list { margin-top: 2px; }
.vuln-level {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.level--high { background: #fef2f2; color: #dc2626; }
.level--med { background: #eff6ff; color: #2563eb; }
.level--crit { background: #fef2f2; color: #991b1b; }
.level--low { background: #f9fafb; color: #6b7280; }
.vuln-id {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 12px;
  color: #374151;
  min-width: 110px;
  flex-shrink: 0;
}
.vuln-desc { flex: 1; color: #6b7280; min-width: 0; }
.vuln-cvss {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #374151;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
.vuln-more {
  color: #d1d5db;
  font-size: 15px;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}
.vuln-list-item:hover .vuln-more { color: #da203e; transform: translateX(2px); }

/* ============================================================
   VULN ANALYSIS — 漏洞概览 + 等级分布（合并卡）
   ============================================================ */
.vuln-summary-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: center;
}
.vuln-summary-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.vuln-summary-stats .stat-grid-2 {
  grid-template-columns: 1fr 1fr;
}
.vuln-summary-chart {
  min-width: 0;
}
@media (max-width: 860px) {
  .vuln-summary-body { grid-template-columns: 1fr; gap: 14px; }
}
.an-chart-box {
  width: 100%;
  height: 220px;
}
@media (max-width: 860px) {
  .an-chart-box { height: 200px; }
}

/* ============================================================
   VULN DETAIL DRAWER — 漏洞详情抽屉
   ============================================================ */
.vd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}
.vd-drawer {
  width: 480px;
  max-width: 92vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
}
.vd-drawer-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.vd-drawer-title { min-width: 0; }
.vd-cve {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
}
.vd-name {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-word;
}
.vd-drawer-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.vd-drawer-close:hover { background: #fee2e2; color: #da203e; }
.vd-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 28px;
}
.vd-dl { margin: 0; }
.vd-dl-row {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  align-items: baseline;
}
.vd-dl-row:last-child { border-bottom: none; }
.vd-dl-row dt { color: #9ca3af; font-weight: 500; word-break: keep-all; }
.vd-dl-row dd { margin: 0; color: #374151; word-break: break-word; min-width: 0; }
.vd-cvss { font-variant-numeric: tabular-nums; font-weight: 700; color: #111827; }
.vd-section { margin-top: 18px; }
.vd-section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}
.vd-section p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  word-break: break-word;
}
.vd-refs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vd-refs a {
  display: block;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  word-break: break-all;
  line-height: 1.5;
}
.vd-refs a:hover { text-decoration: underline; }
.vd-source {
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  word-break: break-all;
  line-height: 1.5;
}
.vd-source:hover { text-decoration: underline; }

/* ============================================================
   LICENSE — 许可证卡片 + 详情抽屉
   ============================================================ */
/* 许可证分析：属性结构 + 合规评估 */
.lic-analysis {
  margin-bottom: 16px;
}
.lic-analysis-body {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}
/* 允许/受限/必要 彩色 icon（数量展示） */
.lic-count-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
.lic-count-ico--perm { background: linear-gradient(135deg, #16a34a, #22c55e); }
.lic-count-ico--lim { background: linear-gradient(135deg, #dc2626, #ef4444); }
.lic-count-ico--cond { background: linear-gradient(135deg, #2563eb, #3b82f6); }
/* 属性占比环形图容器 */
.lic-attr-chart {
  width: 100%;
  height: 180px;
  min-width: 0;
}
/* 允许/受限/必要 数量展示 */
.lic-attr-counts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.lic-attr-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #eceef2;
  border-radius: 10px;
  font-size: 13px;
}
.lic-attr-count-name {
  color: #6b7280;
  font-weight: 500;
}
.lic-attr-count-num {
  margin-left: auto;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}
.lic-attr-count-pct {
  width: 44px;
  text-align: right;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 860px) {
  .lic-analysis-body { grid-template-columns: 1fr; gap: 16px; }
}
/* 许可证卡片：可点击，hover 上浮 */
.lic-card {
  min-width: 0;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
}
.lic-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
  border-color: #d7dbe2;
  transform: translateY(-2px);
}
.lic-card .card-title { color: #111827; }
.lic-card--sk .card-title { min-width: 0; }
.lic-card--sk .sk-block--title { max-width: none; }

/* 多许可证：一行一个，紧凑卡片（标题 + 徽章同行，下方统计格） */
.lic-card .card-header .lic-meta {
  margin-bottom: 0;
  margin-left: auto;
}
.lic-card .card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 卡片顶部：类型 + 批准状态徽章 */
.lic-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.lic-type-badge {
  background: rgba(218, 32, 62, 0.08);
  color: #da203e;
  font-weight: 600;
}
/* 许可证版本徽章 */
.lic-ver-badge {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.lic-st {
  font-size: 11px;
  font-weight: 600;
}
.lic-st--ok { background: #dcfce7; color: #16a34a; }
.lic-st--warn { background: #fef3c7; color: #d97706; }

/* 卡片中部：允许 / 受限 / 必要 统计格 */
.lic-props {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.lic-prop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}
.lic-prop--perm { background: #f0fdf4; color: #16a34a; }
.lic-prop--lim { background: #fef2f2; color: #dc2626; }
.lic-prop--cond { background: #eff6ff; color: #2563eb; }

/* ===== 许可证详情抽屉 ===== */
.ld-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}
.ld-drawer {
  width: 480px;
  max-width: 92vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
}
.ld-drawer-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.ld-drawer-title { min-width: 0; }
.ld-name {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
}
.ld-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ld-drawer-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ld-drawer-close:hover { background: #fee2e2; color: #da203e; }
.ld-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 28px;
}
.ld-dl { margin: 0; }
.ld-dl-row {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  align-items: baseline;
}
.ld-dl-row:last-child { border-bottom: none; }
.ld-dl-row dt { color: #9ca3af; font-weight: 500; word-break: keep-all; }
.ld-dl-row dd { margin: 0; color: #374151; word-break: break-word; min-width: 0; }

/* 属性分组 */
.ld-section { margin-top: 18px; }
.ld-section-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ld-section-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.ld-section-title--perm .ld-section-ico { background: #16a34a; }
.ld-section-title--lim .ld-section-ico { background: #dc2626; }
.ld-section-title--cond .ld-section-ico { background: #2563eb; }
.ld-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ld-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}
.ld-tag--perm { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.ld-tag--lim { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.ld-tag--cond { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

/* 描述 */
.ld-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  word-break: break-word;
  background: #f9fafb;
  border: 1px solid #eceef2;
  border-radius: 10px;
  padding: 12px 14px;
}

/* ===== 单许可证属性三卡 ===== */
.lic-attr-card {
  display: flex;
  flex-direction: column;
}
.lic-attr-card .ld-tags { margin-top: 2px; }
.lic-attr-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}
.lic-attr-ico--perm { background: #16a34a; }
.lic-attr-ico--lim { background: #dc2626; }
.lic-attr-ico--cond { background: #2563eb; }

/* ============================================================
   MALWARE — 恶意代码检测
   ============================================================ */
.mal-progress { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.mal-progress-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #f3f4f6;
  overflow: hidden;
}
.mal-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #16a34a, #4ade80);
  transition: width 0.5s ease;
}
.mal-progress-text {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}
.mal-engine-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mal-engine-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: #f9fafb;
  border: 1px solid #eceef2;
  border-radius: 8px;
  font-size: 13px;
}
.mal-engine-name { color: #374151; font-weight: 500; }
.mal-engine-status {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.mal-st--ok { background: #dcfce7; color: #16a34a; }
.mal-st--warn { background: #fef3c7; color: #d97706; }
.mal-list-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.mal-list-item:last-child { border-bottom: none; }
.mal-level {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.mal-level--malicious { background: #fef2f2; color: #991b1b; }
.mal-level--suspicious { background: #fef3c7; color: #d97706; }
.mal-file {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: #374151;
  min-width: 160px;
  flex-shrink: 0;
}
.mal-type {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}
.mal-desc { flex: 1; color: #6b7280; min-width: 0; }
.mal-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #16a34a;
  font-weight: 500;
}

/* ============================================================
   SBOM — 软件物料清单
   ============================================================ */
/* 概览卡与风险分析卡并排：内部内容撑满卡片，保证两卡等高 */
.sbom-overview,
.sbom-risk-grid {
  flex: 1;
}
/* 概览：组件总数 hero + 依赖构成比例条 */
.sbom-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 20px;
  align-items: center;
}
.sbom-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: linear-gradient(145deg, #f8f9fb, #f3f4f6);
  border: 1px solid #eceef2;
  border-radius: 12px;
}
.sbom-hero-num {
  font-size: 34px;
  font-weight: 800;
  color: #111827;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.sbom-hero-lbl {
  font-size: 12px;
  color: #6b7280;
}
.sbom-hero-lic {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #da203e;
  background: rgba(218, 32, 62, 0.08);
  padding: 2px 10px;
  border-radius: 999px;
}
.sbom-deps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.sbom-dep-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}
.sbom-dep-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sbom-dep-dot--direct { background: #2563eb; }
.sbom-dep-dot--trans { background: #9ca3af; }
.sbom-dep-name { color: #6b7280; }
.sbom-dep-num {
  margin-left: auto;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}
.sbom-dep-pct {
  width: 44px;
  text-align: right;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}
.sbom-dep-bar {
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
  margin-top: 2px;
}
.sbom-dep-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  border-radius: 999px;
  transition: width 0.5s ease;
}
@media (max-width: 720px) {
  .sbom-overview { grid-template-columns: 1fr; gap: 12px; }
}

/* 风险分析：彩色图标 + 数值 */
/* 与概览并排时为半宽卡片，三个指标一排展示 */
.sbom-risk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: stretch;
}
.sbom-risk-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #eceef2;
  border-radius: 12px;
  min-height: 58px;
}
.sbom-risk-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 15px;
  color: #fff;
  flex-shrink: 0;
}
.sbom-risk-ico--crit { background: #dc2626; }
.sbom-risk-ico--high { background: #d97706; }
.sbom-risk-ico--ok { background: #16a34a; }
.sbom-risk-ico--warn { background: #2563eb; }
.sbom-risk-ico--accent { background: #0d9488; }
/* 有漏洞时：漏洞总数卡片红色警示态 */
.sbom-risk-item--danger {
  background: linear-gradient(145deg, #fef2f2, #fdf6f6);
  border-color: rgba(220, 38, 38, 0.25);
}
.sbom-risk-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sbom-risk-num {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.sbom-risk-lbl {
  font-size: 11px;
  color: #6b7280;
  margin-top: 1px;
}
.sbom-risk-hint {
  margin-left: auto;
  max-width: 40%;
  font-size: 10.5px;
  color: #9ca3af;
  text-align: right;
  line-height: 1.4;
  flex-shrink: 0;
}
@media (max-width: 720px) {
  .sbom-risk-grid { grid-template-columns: 1fr; }
  .sbom-risk-hint { max-width: 55%; }
}

/* 风险分析：漏洞组件清单 */
.sbom-vuln-list {
  margin-top: 12px;
  border-top: 1px solid #f3f4f6;
}
.sbom-vuln-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.sbom-vuln-row:last-child { border-bottom: none; }
.sbom-vuln-cve {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: #374151;
  min-width: 130px;
  flex-shrink: 0;
}
.sbom-vuln-component {
  flex: 1;
  min-width: 0;
  color: #374151;
  font-weight: 500;
}
.sbom-vuln-cvss {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #374151;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .sbom-vuln-cve { min-width: 0; width: auto; }
}

.sbom-list-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.sbom-list-item:last-child { border-bottom: none; }
.sbom-group {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 11px;
  color: #9ca3af;
  width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}
.sbom-artifact { flex: 1; min-width: 0; color: #374151; font-weight: 500; }
.sbom-ver {
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}
.sbom-license {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #da203e;
  background: rgba(218, 32, 62, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
}
@media (max-width: 768px) {
  .sbom-group { width: 100%; }
}

/* ============================================================
   CONTRIBUTOR LIST — 修复条宽度和文字对齐
   ============================================================ */
.contrib-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.contrib-row:last-child { border-bottom: none; }
.contrib-rank {
  width: 22px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
  flex-shrink: 0;
}
.contrib-rank.is-top { color: #da203e; }
.contrib-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #da203e, #e06b7e);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.contrib-name {
  min-width: 70px;
  font-weight: 600;
  color: #111827;
  flex-shrink: 0;
}
.contrib-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #f3f4f6;
  overflow: hidden;
  min-width: 40px;
}
.contrib-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #da203e, #f87171);
  transition: width 0.5s ease;
}
.contrib-commits {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  width: auto;
  min-width: 64px;
  text-align: right;
  flex-shrink: 0;
}

/* ============================================================
   VERSION LIST — 修复窄屏换行错位
   ============================================================ */
.version-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 11px 14px;
  margin-bottom: 6px;
  background: #fafafa;
  border: 1px solid #eceef2;
  border-radius: 10px;
  cursor: pointer;
  transition: all .15s;
}
.version-item:hover {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.version-left { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.version-pill {
  display: inline-block;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #da203e;
  background: rgba(218,32,62,0.1);
  border-radius: 4px;
}
.version-num {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
}
.version-mid {
  display: flex;
  flex: 1;
  gap: 16px;
  min-width: 0;
  flex-wrap: wrap;
}
.version-date { font-size: 12px; color: #9ca3af; }
.version-vuln { font-size: 12px; color: #6b7280; }
.version-right { flex-shrink: 0; }
.version-score { font-size: 12px; font-weight: 600; color: #374151; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .stat-grid-4 { grid-template-columns: 1fr 1fr; }
  /* 漏洞列表在窄屏让 CVE ID 和描述各占一行 */
  .vuln-list-item { gap: 4px 8px; }
  .vuln-id { min-width: 0; width: auto; }
}
@media (max-width: 560px) {
  .hero-meta-strip {
    flex-direction: column;
    padding: 8px 0;
    gap: 8px;
  }
  .hero-meta-divider {
    width: 100%;
    height: 1px;
    min-height: 0;
    background: #e5e7eb;
  }
  .hero-meta-cell { padding: 0; }
  .stat-grid-3 { grid-template-columns: 1fr 1fr; }
  /* 贡献者列表：窄屏让名字和条换行 */
  .contrib-row { flex-wrap: wrap; gap: 6px; }
  .contrib-name { min-width: 0; width: auto; }
}
</style>
